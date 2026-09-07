import { Router, Request, Response } from "express";
import { prisma } from "../../db/prisma";
import { db } from "../../db/repositories";
import { authenticateToken, AuthenticatedRequest } from "../auth";
import { validateBody } from "../security";
import { SettingsUpdateSchema } from "../schemas";

export const settingsRouter = Router();

function formatSettings(settings: { jobMatchAlerts: boolean; interviewReminders: boolean; weeklyDigest: boolean }) {
  return {
    job_match_alerts: settings.jobMatchAlerts,
    interview_reminders: settings.interviewReminders,
    weekly_digest: settings.weeklyDigest,
  };
}

settingsRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  const settings = await db.settings.get((req as AuthenticatedRequest).userId);
  res.json({ success: true, settings: formatSettings(settings) });
});

settingsRouter.put("/", authenticateToken, validateBody(SettingsUpdateSchema), async (req: Request, res: Response) => {
  const body = req.body;
  const settings = await db.settings.update((req as AuthenticatedRequest).userId, {
    jobMatchAlerts: body.job_match_alerts,
    interviewReminders: body.interview_reminders,
    weeklyDigest: body.weekly_digest,
  });
  res.json({ success: true, settings: formatSettings(settings) });
});

settingsRouter.get("/export", authenticateToken, async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).userId;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true, settings: true, resume: { include: { versions: { orderBy: { createdAt: "desc" } } } },
      skills: true, applications: true, interviews: { include: { messages: true, evaluation: true } },
      learningProgress: true, dsaProgress: true, notifications: true, roadmap: { include: { milestones: true } },
    },
  });
  if (!user) return res.status(404).json({ success: false, message: "User not found." });
  res.setHeader("Content-Disposition", 'attachment; filename="careerforge-data-export.json"');
  res.json({ exported_at: new Date().toISOString(), data: user });
});
