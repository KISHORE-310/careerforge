import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, optionalAuth, AuthenticatedRequest } from "../auth";
import { aiLimiter, validateBody, sanitizeAiInput } from "../security";
import { InterviewStartSchema, InterviewMessageSchema } from "../schemas";
import { aiService } from "../services/ai.service";

export const interviewsRouter = Router();

// GET /api/interviews
interviewsRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const sessions = await db.interviews.listByUser(userId);

    const formatted = sessions.map((s) => {
      let breakdown: any = {};
      const evalObj = s.evaluations?.[0];
      if (evalObj?.rubricScores) {
        try { breakdown = JSON.parse(evalObj.rubricScores); } catch { breakdown = {}; }
      }
      return {
        id: s.id,
        role: s.targetRole,
        track: s.type,
        difficulty: s.difficulty,
        status: s.status,
        score: s.overallScore || evalObj?.overallScore,
        duration_minutes: 25,
        created_at: s.startedAt.toISOString(),
        score_breakdown: breakdown,
      };
    });

    res.json({ success: true, count: formatted.length, sessions: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve interview sessions." });
  }
});

// POST /api/interviews/start
interviewsRouter.post(
  "/start",
  aiLimiter,
  optionalAuth,
  validateBody(InterviewStartSchema),
  async (req: Request, res: Response) => {
    try {
      const { role, track, difficulty, company } = req.body;
      const userId = (req as any).userId;

      let session = null;
      if (userId) {
        session = await db.interviews.create(userId, {
          targetRole: role,
          type: track,
          difficulty,
          companyFocus: company || "Top Tech Company",
        });
      }

      const sessionId = session ? session.id : `session_${Date.now()}`;
      const initialGreeting = `Hello! I'll be your lead interviewer today for the ${role} (${track}) position. We'll explore architectural patterns, trade-offs, and scalability. To begin, could you walk me through an end-to-end system or feature you recently architected, emphasizing how you handled scalability and fault tolerance?`;

      if (userId && session) {
        await db.interviews.addMessage(session.id, "ai", initialGreeting);

        await db.analytics.recordEvent(userId, "interview_started", "Interviews", {
          role,
          track,
          difficulty,
        });
      }

      res.status(201).json({
        success: true,
        session_id: sessionId,
        role,
        track,
        difficulty,
        initial_message: initialGreeting,
        suggested_starters: [
          "I designed a distributed event pipeline handling 50k events/sec using Kafka and Redis.",
          "I led the migration from a monolithic backend to modular microservices with zero downtime.",
          "I built an end-to-end real-time collaboration canvas with conflict resolution.",
        ],
      });
    } catch (error: any) {
      res.status(500).json({ success: false, message: "Failed to initialize interview session." });
    }
  }
);

// POST /api/interviews/:id/message and /api/interviews/:id/respond
const handleInterviewMessageHandler = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const { message, answer, conversation_history, history: hist, role, track, difficulty } = req.body;
    const userMsg = message || answer || "";
    const userId = (req as any).userId;

    if (!userMsg.trim()) {
      return res.status(400).json({ success: false, message: "Response text is required." });
    }

    if (userId && sessionId && !sessionId.startsWith("session_")) {
      await db.interviews.addMessage(sessionId, "user", sanitizeAiInput(userMsg, 4000));
    }

    const conversationHistory = Array.isArray(conversation_history)
      ? conversation_history
      : Array.isArray(hist)
      ? hist
      : [];

    const aiResponse = await aiService.generateInterviewResponse({
      role: role || "Senior Software Engineer",
      track: track || "System Design",
      difficulty: difficulty || "Medium",
      conversationHistory,
      latestUserMessage: userMsg,
    });

    if (userId && sessionId && !sessionId.startsWith("session_")) {
      await db.interviews.addMessage(
        sessionId,
        "ai",
        aiResponse.reply,
        { feedbackSnippet: aiResponse.feedback_snippet }
      );
    }

    res.json({
      success: true,
      reply: aiResponse.reply,
      feedback: aiResponse.feedback_snippet,
      feedback_snippet: aiResponse.feedback_snippet,
      suggested_topics: aiResponse.suggested_topics || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to generate interviewer reply." });
  }
};

interviewsRouter.post("/:id/message", aiLimiter, optionalAuth, handleInterviewMessageHandler);
interviewsRouter.post("/:id/respond", aiLimiter, optionalAuth, handleInterviewMessageHandler);

// POST /api/interviews/:id/evaluate & /api/interviews/:id/complete
const evaluateInterviewHandler = async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const { messages, role = "Full Stack Engineer", track = "System Design" } = req.body;
    const userId = (req as any).userId;

    let evalMessages = Array.isArray(messages) ? messages : [];
    if (userId && sessionId && !sessionId.startsWith("session_") && evalMessages.length === 0) {
      const stored = await db.interviews.findById(sessionId, userId);
      if (stored?.messages) {
        evalMessages = stored.messages.map((m) => ({ sender: m.sender, message: m.content }));
      }
    }

    const evaluation = await aiService.evaluateInterviewSession({
      role,
      track,
      messages: evalMessages,
    });

    if (userId && sessionId && !sessionId.startsWith("session_")) {
      await db.interviews.saveEvaluation(sessionId, {
        overallScore: evaluation.overall_score,
        summary: evaluation.summary,
        rubrics: {
          technical: evaluation.technical_score,
          communication: evaluation.communication_score,
          problemSolving: evaluation.problem_solving_score,
        },
        strengths: evaluation.strengths,
        improvements: evaluation.improvements,
      });

      await db.analytics.recordEvent(userId, "interview_completed", "Interviews", {
        score: evaluation.overall_score,
        track,
      });
    }

    res.json({
      success: true,
      evaluation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to evaluate interview." });
  }
};

interviewsRouter.post("/:id/evaluate", aiLimiter, optionalAuth, evaluateInterviewHandler);
interviewsRouter.post("/:id/complete", aiLimiter, optionalAuth, evaluateInterviewHandler);
