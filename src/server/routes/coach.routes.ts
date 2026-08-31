import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, AuthenticatedRequest } from "../auth";
import { aiLimiter, sanitizeAiInput } from "../security";
import { aiService, getGeminiClient } from "../services/ai.service";
import { config } from "../config";

export const coachRouter = Router();

// POST /api/coach/chat
coachRouter.post("/chat", aiLimiter, authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { message } = req.body;
    const cleanMessage = sanitizeAiInput(message || "", 2000);
    const user = await db.users.findById(userId);
    const applications = await db.applications.listByUser(userId);
    const skills = await db.skills.listByUser(userId);

    const gemini = getGeminiClient();
    if (gemini && cleanMessage) {
      const systemContext = `You are CareerForge AI, a world-class Executive Career Coach and Technical Talent Strategist.
Candidate Context:
- Name: ${user?.name || "Candidate"}
- Target Role: ${user?.profile?.targetRole || "Software Engineer"}
- Top Skills: ${skills.map((s) => s.name).slice(0, 10).join(", ") || "None documented yet"}
- Active Applications: ${applications.length} (${applications.map((a) => `${a.company} - ${a.status}`).join(", ") || "None yet"})
- Target Salary: ${user?.profile?.targetSalary ? `$${user.profile.targetSalary.toLocaleString()}` : "Open"}

Respond directly to the candidate with sharp, strategic, actionable, and encouraging career advice based on their real profile. Avoid generic filler. Use clean formatting with bold headers and bullet points.`;

      try {
        const response = await gemini.models.generateContent({
          model: config.GEMINI_MODEL,
          contents: `${systemContext}\n\nCandidate Question: ${cleanMessage}`,
        });
        const reply = response.text || "";
        return res.json({ success: true, reply });
      } catch (err) {
        console.warn("AI Coach fallback triggered:", (err as any)?.message);
      }
    }

    res.json({
      success: true,
      reply: `Hi **${user?.name || "Candidate"}**, based on your goal to advance as a **${user?.profile?.targetRole || "Software Engineer"}**:\n\n1. **Profile & Resume Alignment**: Keep your skills and projects updated with measurable outcomes and clear tech stack details.\n2. **Active Pipeline**: You currently have **${applications.length}** tracked application(s). Aim to maintain 5-8 active high-alignment targets.\n3. **Continuous Practice**: Work through your customized Roadmap milestones and practice technical interview rounds in the Interview Lab.\n\nHow can I help you prepare for your next career milestone today?`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Career coach service encountered an error." });
  }
});

// POST /api/coding/review
coachRouter.post("/coding-review", aiLimiter, async (req: Request, res: Response) => {
  try {
    const { code, language = "JavaScript", problem_title = "Code Implementation" } = req.body;
    const review = await aiService.reviewDsaCode(code, problem_title, language);
    res.json({ success: true, ...review });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Code review service encountered an error." });
  }
});
