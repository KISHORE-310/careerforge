import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, AuthenticatedRequest } from "../auth";
import { aiLimiter, sanitizeAiInput } from "../security";
import { aiService } from "../services/ai.service";

export const coachRouter = Router();

// POST /api/coach/chat
coachRouter.post("/chat", aiLimiter, authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { message } = req.body;
    const cleanMessage = sanitizeAiInput(message || "", 2000);

    if (!cleanMessage.trim()) {
      return res.status(400).json({ success: false, message: "Please provide a question or topic for the coach." });
    }

    const user = await db.users.findById(userId);
    const applications = await db.applications.listByUser(userId);
    const skills = await db.skills.listByUser(userId);

    const reply = await aiService.getCareerCoachAdvice({
      userName: user?.name || "Candidate",
      targetRole: user?.profile?.targetRole || "Software Engineer",
      skills: skills.map((s) => s.name),
      applications: applications.map((a) => ({ company: a.company, status: a.status })),
      targetSalary: user?.profile?.targetSalary,
      userQuestion: cleanMessage,
    });

    res.json({ success: true, reply });
  } catch (error: any) {
    console.error("[Coach Route Error]:", error?.message || error);
    const isMissingKey = error?.message?.includes("GEMINI_API_KEY");
    res.status(500).json({
      success: false,
      message: isMissingKey
        ? "AI Career Coach requires GEMINI_API_KEY to be configured in server environment."
        : error?.message || "Career coach service encountered an error.",
    });
  }
});

// POST /api/coding/review, /api/coach/coding-review
coachRouter.post(["/review", "/coding-review", "/"], aiLimiter, async (req: Request, res: Response) => {
  try {
    const { code, language = "JavaScript", problem_title = "Code Implementation" } = req.body;
    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: "No code provided for review." });
    }

    const review = await aiService.reviewDsaCode(code, problem_title, language);
    res.json({ success: true, ...review });
  } catch (error: any) {
    console.error("[Coding Review Error]:", error?.message || error);
    const isMissingKey = error?.message?.includes("GEMINI_API_KEY");
    res.status(500).json({
      success: false,
      message: isMissingKey
        ? "AI Code Review requires GEMINI_API_KEY to be configured in server environment."
        : error?.message || "Code review service encountered an error.",
    });
  }
});
