import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, optionalAuth, AuthenticatedRequest } from "../auth";
import { aiLimiter, validateBody } from "../security";
import { ApplicationCreateSchema, ApplicationUpdateSchema, AICoverLetterSchema } from "../schemas";
import { aiService } from "../services/ai.service";

export const applicationsRouter = Router();

// Real match score for an application, computed from its linked Job's
// skillsRequired against the authenticated user's actual Skill records.
// Same skill-overlap formula and 40-96 clamp used by jobs.routes.ts's
// GET /api/jobs/:id fit analysis, applied here to Applications. Returns null
// when there is no linked job or the job has no usable skillsRequired list --
// never a fabricated number. `job` and `userSkillNames` are always
// server-derived (the linked Job row and the user's own Skill rows);
// client-supplied `matchScore` on the request body is never read or trusted.
function calculateApplicationMatchScore(job: any, userSkillNames: string[]): number | null {
  const skillsReq: string[] = Array.isArray(job?.skillsRequired) ? job.skillsRequired : [];
  if (!job || skillsReq.length === 0) return null;

  const matched = skillsReq.filter((s) => userSkillNames.includes(s.toLowerCase()));
  const skillsMatchPct = Math.round((matched.length / skillsReq.length) * 100);
  return Math.min(Math.max(skillsMatchPct, 40), 96);
}

// GET /api/applications
applicationsRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const apps = await db.applications.listByUser(userId);
    const skills = await db.skills.listByUser(userId);
    const userSkillNames = skills.map((s) => s.name.toLowerCase());

    const formatted = apps.map((a: any) => ({
      id: a.id,
      company: a.company,
      role: a.role,
      location: a.location || "",
      salary: a.salary || "",
      status: a.status,
      applied_date: a.appliedDate.toISOString().split("T")[0],
      job_id: a.jobId,
      match_score: calculateApplicationMatchScore(a.job, userSkillNames),
      notes: a.notes || "",
      next_step: a.nextStep || "Application Review",
    }));

    res.json({ success: true, count: formatted.length, applications: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve job applications." });
  }
});

// POST /api/applications
applicationsRouter.post(
  "/",
  authenticateToken,
  validateBody(ApplicationCreateSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      // `jobId` is optional. When supplied it must reference a real Job row --
      // otherwise the insert would fail on the foreign key and surface as a 500.
      // No heuristic company/role matching is attempted: the link is explicit
      // or absent. The fetched row is reused below to compute match_score so
      // no second lookup is needed.
      let linkedJob: any = null;
      if (req.body.jobId) {
        linkedJob = await db.jobs.findById(req.body.jobId);
        if (!linkedJob) {
          return res.status(400).json({
            success: false,
            message: "jobId does not reference a known job listing.",
          });
        }
      }

      const newApp = await db.applications.create(userId, req.body);

      await db.notifications.create(userId, {
        title: `Application Tracked: ${newApp.company}`,
        message: `Added ${newApp.role} at ${newApp.company} to your tracker.`,
        type: "system",
        link: "/applications",
      });

      await db.analytics.recordEvent(userId, "application_created", "Applications", {
        company: newApp.company,
        role: newApp.role,
      });

      const skills = await db.skills.listByUser(userId);
      const userSkillNames = skills.map((s) => s.name.toLowerCase());

      res.status(201).json({
        success: true,
        application: {
          id: newApp.id,
          company: newApp.company,
          role: newApp.role,
          location: newApp.location,
          salary: newApp.salary,
          status: newApp.status,
          applied_date: newApp.appliedDate.toISOString().split("T")[0],
          job_id: newApp.jobId,
          match_score: calculateApplicationMatchScore(linkedJob, userSkillNames),
          notes: newApp.notes,
          next_step: newApp.nextStep,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to create application entry." });
    }
  }
);

// PUT /api/applications/:id
applicationsRouter.put(
  "/:id",
  authenticateToken,
  validateBody(ApplicationUpdateSchema),
  async (req: Request, res: Response) => {
    try {
      const userId = (req as AuthenticatedRequest).userId;

      if (req.body.jobId) {
        const linkedJob = await db.jobs.findById(req.body.jobId);
        if (!linkedJob) {
          return res.status(400).json({
            success: false,
            message: "jobId does not reference a known job listing.",
          });
        }
      }

      const updated: any = await db.applications.update(req.params.id, userId, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Application not found or unauthorized." });
      }

      await db.analytics.recordEvent(userId, "application_status_updated", "Applications", {
        id: updated.id,
        status: updated.status,
        company: updated.company,
      });

      const skills = await db.skills.listByUser(userId);
      const userSkillNames = skills.map((s) => s.name.toLowerCase());

      res.json({
        success: true,
        application: {
          id: updated.id,
          company: updated.company,
          role: updated.role,
          location: updated.location,
          salary: updated.salary,
          status: updated.status,
          applied_date: updated.appliedDate.toISOString().split("T")[0],
          job_id: updated.jobId,
          // `updated.job` reflects the currently-linked job regardless of
          // whether this PUT body included jobId, since db.applications.update
          // includes the job relation unconditionally.
          match_score: calculateApplicationMatchScore(updated.job, userSkillNames),
          notes: updated.notes,
          next_step: updated.nextStep,
        },
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to update application." });
    }
  }
);

// DELETE /api/applications/:id
applicationsRouter.delete("/:id", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    await db.applications.delete(req.params.id, userId);
    res.json({ success: true, message: "Application deleted successfully." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to delete application." });
  }
});

// POST /api/application-ai/generate, /api/applications/ai/generate, /api/applications/generate
applicationsRouter.post(
  ["/ai/generate", "/generate", "/ai-generate", "/"],
  aiLimiter,
  optionalAuth,
  validateBody(AICoverLetterSchema),
  async (req: Request, res: Response) => {
    try {
      const { type, company, role, job_description, tone, key_points } = req.body;
      const userId = (req as any).userId;
      const user = userId ? await db.users.findById(userId) : null;

      const result = await aiService.generateApplicationDocument({
        type,
        company,
        role,
        jobDescription: job_description,
        tone,
        keyPoints: key_points,
        candidateName: user?.name || "Candidate",
      });

      res.json({ success: true, ...result });
    } catch (error: any) {
      console.error("[Application Document AI Error]:", error?.message || error);
      const isMissingKey = error?.message?.includes("GEMINI_API_KEY");
      res.status(500).json({
        success: false,
        message: isMissingKey
          ? "Document AI Generator requires GEMINI_API_KEY to be configured in server environment."
          : error?.message || "AI generation encountered an error.",
      });
    }
  }
);
