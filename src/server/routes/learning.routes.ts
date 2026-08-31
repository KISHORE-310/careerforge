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
      let modulesList: string[] = [];
      try {
        modulesList = r.modules ? JSON.parse(r.modules) : [];
      } catch {
        modulesList = [];
      }

      let quizObj: any = null;
      try {
        quizObj = r.quiz ? JSON.parse(r.quiz) : null;
      } catch {
        quizObj = null;
      }

      return {
        id: r.id,
        title: r.title,
        category: r.category,
        difficulty: r.difficulty,
        estimated_hours: r.estimatedHr,
        rating: r.rating,
        enrolled: r.enrolled,
        icon: r.icon,
        description: r.description,
        modules: modulesList,
        quiz: quizObj,
        status: progressMap[r.id]?.status || "not_started",
        progress_percent: progressMap[r.id]?.progress || 0,
        quiz_score: progressMap[r.id]?.quizScore,
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

    res.json({ success: true, message: "Learning progress updated." });
  } catch (error: any) {
    console.error("Learning progress error:", error);
    res.status(500).json({ success: false, message: "Failed to update learning progress." });
  }
};

learningRouter.post("/:id/progress", authenticateToken, updateProgressHandler);
learningRouter.put("/:id/progress", authenticateToken, updateProgressHandler);
