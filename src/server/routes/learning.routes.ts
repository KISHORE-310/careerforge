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
      const completedIds: string[] = Array.isArray(progress?.completedLessonIds)
        ? progress.completedLessonIds.map(String)
        : [];
      const completedSet = new Set(completedIds);

      const lessonsWithCompletion = lessonsList.map((les: any, idx: number) => {
        const lessonId = String(les.id ?? idx);
        const isCompleted =
          completedSet.has(lessonId) ||
          (les.title && completedSet.has(String(les.title))) ||
          Boolean(les.completed);
        return {
          ...les,
          id: lessonId,
          completed: isCompleted,
        };
      });

      return {
        id: r.id,
        title: r.title,
        skill: r.skill,
        target_skill: r.skill,
        category: r.category,
        difficulty: r.difficulty,
        type: r.type,
        duration: r.duration,
        estimated_hours: r.estimatedHours,
        description: r.description,
        rating: null,
        enrolled: null,
        icon: null,
        modules: lessonsWithCompletion,
        lessons: lessonsWithCompletion,
        quiz: r.quiz ?? null,
        status: progress ? (progress.completed ? "completed" : "in_progress") : "not_started",
        progress: pct,
        progress_percent: pct,
        completed_lesson_ids: completedIds,
        quiz_score: progress?.quizScore ?? null,
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
    const { status, progress_percent, progress, quiz_score, completed_lesson_ids, completedLessonIds, lessons } = req.body;
    const resourceId = req.params.id;

    const resource = await db.learning.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Learning resource not found." });
    }

    let completedIds: string[] | undefined = undefined;
    if (Array.isArray(completed_lesson_ids || completedLessonIds)) {
      completedIds = (completed_lesson_ids || completedLessonIds).map(String);
    } else if (Array.isArray(lessons)) {
      completedIds = lessons
        .filter((l: any) => Boolean(l.completed))
        .map((l: any, idx: number) => String(l.id ?? l.title ?? idx));
    }

    let pct: number;
    if (typeof progress === "number") {
      pct = Math.max(0, Math.min(100, progress));
    } else if (typeof progress_percent === "number") {
      pct = Math.max(0, Math.min(100, progress_percent));
    } else if (Array.isArray(lessons) && lessons.length > 0 && completedIds) {
      pct = Math.round((completedIds.length / lessons.length) * 100);
    } else {
      pct = status === "completed" ? 100 : 50;
    }

    await db.learning.updateProgress(userId, resourceId, pct, {
      completedLessonIds: completedIds,
      quizScore: quiz_score,
    });
    await db.analytics.recordEvent(userId, pct >= 100 ? "learning_completed" : "learning_progress", "Learning", {
      resourceId,
      progress: pct,
      quizScore: quiz_score,
    });

    res.json({
      success: true,
      message: "Learning progress updated.",
      progress: pct,
      progress_percent: pct,
      completed_lesson_ids: completedIds || [],
    });
  } catch (error: any) {
    console.error("Learning progress error:", error);
    res.status(500).json({ success: false, message: "Failed to update learning progress." });
  }
};

learningRouter.post("/:id/progress", authenticateToken, updateProgressHandler);
learningRouter.put("/:id/progress", authenticateToken, updateProgressHandler);
