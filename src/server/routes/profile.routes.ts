import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, AuthenticatedRequest } from "../auth";
import { validateBody } from "../security";
import { ProfileUpdateSchema, OnboardingSchema } from "../schemas";

export const profileRouter = Router();

// Helper: parse database resume JSON fields to object
function formatResumeResponse(resumeRecord: any, user: any) {
  if (!resumeRecord) {
    return {
      personal_info: {
        full_name: user?.name || "Candidate",
        email: user?.email || "",
        phone: user?.profile?.phone || "",
        location: user?.profile?.location || "",
        linkedin: user?.profile?.linkedin || "",
        github: user?.profile?.github || "",
        portfolio: user?.profile?.portfolio || "",
      },
      summary: "",
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      technical_skills: [],
      soft_skills: [],
      achievements: [],
      languages: [],
    };
  }

  let contactInfo: any = {};
  let experience: any[] = [];
  let education: any[] = [];
  let skills: any[] = [];
  let projects: any[] = [];
  let certifications: any[] = [];

  try { contactInfo = resumeRecord.contactInfo ? JSON.parse(resumeRecord.contactInfo) : {}; } catch { contactInfo = {}; }
  try { experience = resumeRecord.experience ? JSON.parse(resumeRecord.experience) : []; } catch { experience = []; }
  try { education = resumeRecord.education ? JSON.parse(resumeRecord.education) : []; } catch { education = []; }
  try { skills = resumeRecord.skills ? JSON.parse(resumeRecord.skills) : []; } catch { skills = []; }
  try { projects = resumeRecord.projects ? JSON.parse(resumeRecord.projects) : []; } catch { projects = []; }
  try { certifications = resumeRecord.certifications ? JSON.parse(resumeRecord.certifications) : []; } catch { certifications = []; }

  return {
    id: resumeRecord.id,
    target_role: resumeRecord.targetRole,
    personal_info: {
      full_name: contactInfo.full_name || contactInfo.name || user?.name || "Candidate",
      email: contactInfo.email || user?.email || "",
      phone: contactInfo.phone || user?.profile?.phone || "",
      location: contactInfo.location || user?.profile?.location || "",
      linkedin: contactInfo.linkedin || user?.profile?.linkedin || "",
      github: contactInfo.github || user?.profile?.github || "",
      portfolio: contactInfo.portfolio || user?.profile?.portfolio || "",
    },
    summary: resumeRecord.summary || "",
    experience,
    education,
    projects,
    certifications,
    technical_skills: Array.isArray(skills) ? skills : [],
    soft_skills: ["Communication", "Problem Solving", "Teamwork"],
    achievements: [],
    languages: ["English"],
    ats_score: resumeRecord.atsScore,
  };
}

// GET /api/profile
profileRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const user = await db.users.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User profile not found." });
    }

    const resumeRecord = await db.resumes.getPrimary(userId);
    const resume = formatResumeResponse(resumeRecord, user);
    const skills = await db.skills.listByUser(userId);

    const userProfile = {
      id: user.id,
      full_name: user.name,
      email: user.email,
      target_role: user.profile?.targetRole || "Software Engineer",
      target_salary: user.profile?.targetSalary ? `$${user.profile.targetSalary.toLocaleString()}` : "$140,000",
      experience_level: user.profile?.experienceLevel || "Mid-Level",
      bio: user.profile?.bio || "",
      location: user.profile?.location || "",
      phone: user.profile?.phone || "",
      github: user.profile?.github || "",
      linkedin: user.profile?.linkedin || "",
      portfolio: user.profile?.portfolio || "",
      onboarding_completed: true,
    };

    res.json({
      success: true,
      user: userProfile,
      resume,
      skills,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve user profile." });
  }
});

// PUT /api/profile
profileRouter.put(
  "/",
  authenticateToken,
  validateBody(ProfileUpdateSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const updatedProfile = await db.users.updateProfile(userId, req.body);
      const user = await db.users.findById(userId);

      res.json({
        success: true,
        message: "Profile updated successfully.",
        user: {
          id: user?.id,
          full_name: user?.name,
          email: user?.email,
          target_role: updatedProfile.targetRole,
          target_salary: updatedProfile.targetSalary ? `$${updatedProfile.targetSalary.toLocaleString()}` : "",
          experience_level: updatedProfile.experienceLevel,
          bio: updatedProfile.bio,
          location: updatedProfile.location,
          phone: updatedProfile.phone,
          github: updatedProfile.github,
          linkedin: updatedProfile.linkedin,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to update profile." });
    }
  }
);

// POST /api/onboarding
profileRouter.post(
  "/onboarding",
  authenticateToken,
  validateBody(OnboardingSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;
      const { target_role, experience_level, skills, target_salary } = req.body;

      await db.users.updateProfile(userId, {
        targetRole: target_role,
        experienceLevel: experience_level,
        targetSalary: target_salary ? parseInt(String(target_salary).replace(/\D/g, "")) : undefined,
      });

      if (Array.isArray(skills)) {
        for (const skillName of skills) {
          if (typeof skillName === "string" && skillName.trim()) {
            await db.skills.upsert(userId, {
              name: skillName.trim(),
              proficiency: 75,
              source: "Onboarding",
            });
          }
        }
      }

      const user = await db.users.findById(userId);
      res.json({ success: true, message: "Onboarding completed successfully!", user });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to complete onboarding." });
    }
  }
);
