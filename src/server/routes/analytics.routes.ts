import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, AuthenticatedRequest } from "../auth";
import { calculateResumeScore } from "./resume.routes";

export const analyticsRouter = Router();

// GET /api/analytics/dashboard and /api/progress/analytics
analyticsRouter.get(["/dashboard", "/progress/analytics"], authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const recentEvents = await db.analytics.getEvents(userId, 10);
    const resumeRecord = await db.resumes.getPrimary(userId);
    const user = await db.users.findById(userId);

    let parsedResume: any = null;
    if (resumeRecord) {
      try {
        parsedResume = {
          contactInfo: resumeRecord.contactInfo ? JSON.parse(resumeRecord.contactInfo) : {},
          summary: resumeRecord.summary,
          experience: resumeRecord.experience ? JSON.parse(resumeRecord.experience) : [],
          education: resumeRecord.education ? JSON.parse(resumeRecord.education) : [],
          skills: resumeRecord.skills ? JSON.parse(resumeRecord.skills) : [],
          projects: resumeRecord.projects ? JSON.parse(resumeRecord.projects) : [],
          certifications: resumeRecord.certifications ? JSON.parse(resumeRecord.certifications) : [],
        };
      } catch {
        parsedResume = null;
      }
    }

    const evaluation = calculateResumeScore(parsedResume);
    const applications = await db.applications.listByUser(userId);
    const skills = await db.skills.listByUser(userId);
    const interviews = await db.interviews.listByUser(userId);
    const dsaList = await db.dsa.listByUser(userId);

    const interviewScores = interviews.filter((i) => i.overallScore != null).map((i) => i.overallScore as number);
    const avgInterviewScore = interviewScores.length > 0
      ? Math.round(interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length)
      : 82;

    const pipelineCounts = {
      saved: applications.filter((a) => a.status === "saved").length,
      applied: applications.filter((a) => a.status === "applied").length,
      interviewing: applications.filter((a) => a.status === "interviewing" || a.status === "interview").length,
      offer: applications.filter((a) => a.status === "offer").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
    };

    const overallReadiness = Math.round(
      evaluation.resume_score * 0.35 +
      Math.min(skills.length * 8, 95) * 0.25 +
      avgInterviewScore * 0.25 +
      Math.min(dsaList.length * 10, 95) * 0.15
    );

    res.json({
      success: true,
      analytics: {
        overall_readiness_score: Math.min(Math.max(overallReadiness, 20), 98),
        resume_ats_score: evaluation.resume_score,
        target_role: user?.profile?.targetRole || "Software Engineer",
        target_salary: user?.profile?.targetSalary ? `$${user.profile.targetSalary.toLocaleString()}` : "$140,000",
        applications_pipeline: {
          total: applications.length,
          ...pipelineCounts,
        },
        skills_overview: {
          total_skills: skills.length,
          verified_skills: skills.filter((s) => s.verified).length,
          top_skills: skills.slice(0, 5).map((s) => s.name),
        },
        interview_metrics: {
          total_sessions: interviews.length,
          average_score: avgInterviewScore,
          latest_score: interviewScores[0] || 85,
        },
        dsa_metrics: {
          solved_count: dsaList.filter((d) => d.status === "solved" || d.status === "accepted").length,
          attempted_count: dsaList.length,
        },
      },
      recent_events: recentEvents.map((e) => ({
        id: e.id,
        event_name: e.eventType,
        category: e.category,
        timestamp: e.timestamp.toISOString(),
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve analytics dashboard metrics." });
  }
});
