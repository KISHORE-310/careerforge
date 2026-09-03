import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, optionalAuth, AuthenticatedRequest } from "../auth";

export const learningRouter = Router();

// GET /api/learning
learningRouter.get("/", optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const resources = await db.learning.listResources();

    let progressMap: Record<string, any> = {};
    if (userId) {
      const progressList = await db.learning.getUserProgress(userId);
      if (Array.isArray(progressList)) {
        progressList.forEach((p) => {
          progressMap[p.resourceId] = p;
        });
      }
    }

    const formatted = resources.map((r) => {
      // `lessons` and `quiz` are native Json columns in the schema, so they are
      // already parsed values and must not be JSON.parse()d again.
      const lessonsList = Array.isArray(r.lessons) ? r.lessons : [];
      const progress = progressMap[r.id];
      const pct = progress?.progressPct ?? 0;

      return {
        id: r.id,
        title: r.title,
        skill: r.skill,
        category: r.category,
        difficulty: r.difficulty,
        type: r.type,
        duration: r.duration,
        estimated_hours: r.estimatedHours,
        description: r.description,
        // Schema has no `rating`, `enrolled` or `icon` column; keys retained
        // as null so the response shape stays stable for the frontend.
        rating: null,
        enrolled: null,
        icon: null,
        modules: lessonsList,
        lessons: lessonsList,
        quiz: r.quiz ?? null,
        status: progress ? (progress.completed ? "completed" : "in_progress") : "not_started",
        progress_percent: pct,
        // No `quizScore` column in the schema.
        quiz_score: null,
      };
    });

    res.json({ success: true, count: formatted.length, resources: formatted });
  } catch (error: any) {
    console.error("Learning list error:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve learning resources.", error: error?.message });
  }
});

// POST & PUT /api/learning/:id/progress
const updateProgressHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { status, progress_percent, progress, quiz_score } = req.body;
    const resourceId = req.params.id;
    const pct = typeof progress_percent === "number" ? progress_percent : (typeof progress === "number" ? progress : (status === "completed" ? 100 : 50));

    await db.learning.updateProgress(userId, resourceId, pct, quiz_score);
    await db.analytics.recordEvent(userId, pct >= 100 ? "learning_completed" : "learning_progress", "Learning", {
      resourceId,
      progress: pct,
      quizScore: quiz_score,
    });

    res.json({ success: true, message: "Learning progress updated." });
  } catch (error: any) {
    console.error("Learning progress error:", error);
    res.status(500).json({ success: false, message: "Failed to update learning progress." });
  }
};

learningRouter.post("/:id/progress", authenticateToken, updateProgressHandler);
learningRouter.put("/:id/progress", authenticateToken, updateProgressHandler);
