import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, optionalAuth, AuthenticatedRequest } from "../auth";
import { aiLimiter, validateBody } from "../security";
import { ApplicationCreateSchema, ApplicationUpdateSchema, AICoverLetterSchema } from "../schemas";
import { aiService } from "../services/ai.service";

export const applicationsRouter = Router();

// GET /api/applications
applicationsRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const apps = await db.applications.listByUser(userId);
    const formatted = apps.map((a) => ({
      id: a.id,
      company: a.company,
      role: a.role,
      location: a.location || "Remote",
      salary: a.salary || "$150,000",
      status: a.status,
      applied_date: a.appliedDate.toISOString().split("T")[0],
      job_id: a.jobId,
      // No `matchScore` column in the schema; Phase 2 wires the real matching
      // engine here. Placeholder retained to preserve the response shape.
      match_score: 85,
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
      // or absent.
      if (req.body.jobId) {
        const linkedJob = await db.jobs.findById(req.body.jobId);
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
          match_score: 85,
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

      const updated = await db.applications.update(req.params.id, userId, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, message: "Application not found or unauthorized." });
      }

      await db.analytics.recordEvent(userId, "application_status_updated", "Applications", {
        id: updated.id,
        status: updated.status,
        company: updated.company,
      });

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
          match_score: 85,
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
