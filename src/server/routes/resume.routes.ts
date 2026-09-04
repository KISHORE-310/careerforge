import { Router, Request, Response } from "express";
import multer from "multer";
import pdfParse from "pdf-parse";
import { db } from "../../db/repositories";
import { authenticateToken, optionalAuth, AuthenticatedRequest } from "../auth";
import { uploadLimiter, aiLimiter, validateBody, validatePdfFile, sanitizeAiInput } from "../security";
import { ResumeSchema, AIRewriteSchema } from "../schemas";
import { aiService } from "../services/ai.service";
import { formatResumeResponse } from "../lib/resume";

export const resumeRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

export function calculateResumeScore(profile: any) {
  if (!profile) {
    return {
      resume_score: 0,
      grade: "Incomplete",
      strengths: [],
      weaknesses: ["No resume information entered yet. Upload or draft your resume to generate an evaluation."],
      breakdown: {
        personal_information: 0,
        summary: 0,
        education: 0,
        experience: 0,
        projects: 0,
        technical_skills: 0,
        certifications: 0,
      },
    };
  }

  let score = 0;
  const breakdown: Record<string, number> = {};
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  const personal = profile.personal_info || profile.contactInfo || {};
  let personalScore = 0;
  if (personal.full_name || personal.name) personalScore += 3;
  if (personal.email) personalScore += 3;
  if (personal.phone) personalScore += 3;
  if (personal.linkedin) {
    personalScore += 3;
    strengths.push("LinkedIn profile linked");
  } else {
    weaknesses.push("Add your verified LinkedIn profile URL");
  }
  if (personal.github) {
    personalScore += 4;
    strengths.push("GitHub repository link included");
  } else {
    weaknesses.push("Add your GitHub portfolio URL");
  }
  score += personalScore;
  breakdown.personal_information = personalScore;

  let summaryScore = 0;
  if (profile.summary && typeof profile.summary === "string") {
    const words = profile.summary.trim().split(/\s+/).filter(Boolean).length;
    if (words >= 35) {
      summaryScore = 10;
      strengths.push("Comprehensive impact-focused executive summary");
    } else if (words >= 15) {
      summaryScore = 7;
      strengths.push("Good professional summary");
    } else if (words > 0) {
      summaryScore = 4;
      weaknesses.push("Expand summary with quantified career achievements");
    }
  }
  if (summaryScore === 0) {
    weaknesses.push("Include a strong professional summary");
  }
  score += summaryScore;
  breakdown.summary = summaryScore;

  const education = Array.isArray(profile.education) ? profile.education.filter((e: any) => e && (e.degree || e.institution)) : [];
  const educationScore = Math.min(education.length * 5, 10);
  if (educationScore > 0) strengths.push("Educational background documented");
  else weaknesses.push("Add educational degrees or certifications");
  score += educationScore;
  breakdown.education = educationScore;

  const experience = Array.isArray(profile.experience) ? profile.experience.filter((e: any) => e && (e.company || e.role)) : [];
  const experienceScore = Math.min(experience.length * 10, 20);
  if (experienceScore >= 10) strengths.push("Demonstrated work experience with bullet metrics");
  else weaknesses.push("Add detailed work experience or project leadership");
  score += experienceScore;
  breakdown.experience = experienceScore;

  const projects = Array.isArray(profile.projects) ? profile.projects.filter((p: any) => p && (p.title || p.name)) : [];
  const projectScore = Math.min(projects.length * 5, 20);
  if (projectScore >= 10) strengths.push(`${projects.length} relevant technical project(s) showcased`);
  else weaknesses.push("Add at least 2 full-stack or systems projects with live links");
  score += projectScore;
  breakdown.projects = projectScore;

  const technicalSkills = Array.isArray(profile.technical_skills || profile.skills) ? (profile.technical_skills || profile.skills).filter(Boolean) : [];
  const skillScore = Math.min(technicalSkills.length, 15);
  if (skillScore >= 10) strengths.push("Diverse and modern technical stack");
  else weaknesses.push("Expand technical skills with relevant libraries and cloud tools");
  score += skillScore;
  breakdown.technical_skills = skillScore;

  const certs = Array.isArray(profile.certifications) ? profile.certifications.filter((c: any) => c && (c.name || typeof c === "string")) : [];
  const certScore = Math.min(certs.length * 2.5, 5);
  if (certScore > 0) strengths.push("Industry certifications included");
  score += certScore;
  breakdown.certifications = certScore;

  const rawPercent = Math.round((score / 80) * 100);
  const normalizedScore = Math.min(Math.max(rawPercent, 0), 98);
  let grade = "Needs Improvement";
  if (normalizedScore >= 90) grade = "Excellent";
  else if (normalizedScore >= 75) grade = "Good";
  else if (normalizedScore >= 60) grade = "Average";
  else if (normalizedScore === 0) grade = "Not Started";

  return {
    resume_score: normalizedScore,
    grade,
    strengths,
    weaknesses,
    breakdown,
  };
}

// GET /api/resume
resumeRouter.get(["/", "/current"], authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const user = await db.users.findById(userId);
    const resumeRecord = await db.resumes.getPrimary(userId);
    const resume = formatResumeResponse(resumeRecord, user);
    const evaluation = calculateResumeScore(resume);

    res.json({
      success: true,
      resume,
      evaluation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve resume." });
  }
});

// PUT /api/resume
resumeRouter.put("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const updatedResume = req.body.resume || req.body;
    const parsedResume = ResumeSchema.safeParse(updatedResume);

    if (!parsedResume.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid resume data structure.",
        errors: parsedResume.error.flatten().fieldErrors,
      });
    }

    const evaluation = calculateResumeScore(parsedResume.data);

    const saved = await db.resumes.upsertResume(userId, {
      ...parsedResume.data,
      atsScore: evaluation.resume_score,
      evaluation,
    });

    await db.resumes.createVersion(saved.id, userId, parsedResume.data, "Manual edit in Resume Studio");
    await db.analytics.recordEvent(userId, "resume_updated", "Resume", {
      atsScore: evaluation.resume_score,
    });

    res.json({
      success: true,
      message: "Resume saved successfully.",
      resume: parsedResume.data,
      evaluation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to save resume." });
  }
});

// POST /api/resume/ai-rewrite
resumeRouter.post(
  "/ai-rewrite",
  aiLimiter,
  validateBody(AIRewriteSchema),
  async (req: Request, res: Response) => {
    try {
      const { section, content, target_role, instruction } = req.body;
      const result = await aiService.rewriteResumeContent(
        section || "bullet point",
        content,
        target_role || "Senior Software Engineer",
        instruction
      );

      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error("[Resume AI Rewrite Error]:", error?.message || error);
      const isMissingKey = error?.message?.includes("GEMINI_API_KEY");
      res.status(500).json({
        success: false,
        message: isMissingKey
          ? "Resume AI Rewrite requires GEMINI_API_KEY to be configured in server environment."
          : error?.message || "AI rewriting service encountered an error.",
      });
    }
  }
);

// POST /api/upload-resume and /api/resume/upload
resumeRouter.post(
  ["/", "/upload"],
  uploadLimiter,
  optionalAuth,
  upload.single("file"),
  async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const targetRole = sanitizeAiInput((req.body.target_role as string) || "Full Stack Engineer", 100);
      const userId = (req as any).userId;

      const fileValidation = validatePdfFile(file);
      if (!fileValidation.isValid) {
        return res.status(400).json({
          success: false,
          message: fileValidation.error || "Invalid file uploaded.",
        });
      }

      let extractedText = "";
      if (file) {
        try {
          const parsed = await pdfParse(file.buffer);
          extractedText = sanitizeAiInput(parsed.text || "", 8000);
        } catch {
          return res.status(400).json({
            success: false,
            message: "Unable to parse the PDF document. The file may be corrupt or encrypted.",
          });
        }
      }

      if (!extractedText.trim()) {
        return res.status(400).json({
          success: false,
          message: "No readable text could be extracted from the uploaded PDF resume.",
        });
      }

      const profile = await aiService.parseResume(extractedText, targetRole);

      if (!profile || !profile.personal_info) {
        return res.status(502).json({
          success: false,
          message: "AI parser was unable to extract structured candidate data from the resume.",
        });
      }

      const resumeScore = calculateResumeScore(profile);

      if (userId) {
        await db.resumes.upsertResume(userId, {
          ...profile,
          atsScore: resumeScore.resume_score,
          evaluation: resumeScore,
          parsedText: extractedText,
        });

        if (Array.isArray(profile.technical_skills)) {
          for (const skill of profile.technical_skills) {
            if (typeof skill === "string" && skill.trim()) {
              await db.skills.upsert(userId, {
                name: skill.trim(),
                proficiency: 80,
                source: "Resume",
              });
            }
          }
        }

        await db.analytics.recordEvent(userId, "resume_uploaded", "Resume", {
          atsScore: resumeScore.resume_score,
        });
      }

      res.json({
        success: true,
        message: "Resume processed successfully.",
        profile,
        resume_score: resumeScore,
        target_role: targetRole,
      });
    } catch (error: any) {
      console.error("[Resume Upload Error]:", error?.message || error);
      const isMissingKey = error?.message?.includes("GEMINI_API_KEY");
      res.status(500).json({
        success: false,
        message: isMissingKey
          ? "Resume AI Parsing requires GEMINI_API_KEY to be configured in server environment."
          : error?.message || "Resume processing failed.",
      });
    }
  }
);
