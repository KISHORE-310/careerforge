import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, AuthenticatedRequest } from "../auth";
import { calculateResumeScore } from "./resume.routes";

export const analyticsRouter = Router();

/**
 * Generate 365-day activity calendar from real user records
 */
function buildActivityCalendar(params: {
  events: Array<{ eventType: string; category: string; timestamp: Date }>;
  dsaList: Array<{ status: string; updatedAt: Date }>;
  interviews: Array<{ createdAt: Date; overallScore: number | null }>;
  applications: Array<{ appliedDate: Date; createdAt: Date }>;
}) {
  const { events, dsaList, interviews, applications } = params;

  const today = new Date();
  today.setHours(23, 59, 59, 999);

  // Map to store date string "YYYY-MM-DD" -> { count, dsa, mock, apps }
  const dateCounts: Record<string, { count: number; dsa: number; mock: number; apps: number }> = {};

  const recordAction = (dateObj: Date | string | null | undefined, type: "dsa" | "mock" | "apps" | "other") => {
    if (!dateObj) return;
    const d = new Date(dateObj);
    if (isNaN(d.getTime())) return;
    const key = d.toISOString().split("T")[0];
    if (!dateCounts[key]) {
      dateCounts[key] = { count: 0, dsa: 0, mock: 0, apps: 0 };
    }
    dateCounts[key].count += 1;
    if (type === "dsa") dateCounts[key].dsa += 1;
    else if (type === "mock") dateCounts[key].mock += 1;
    else if (type === "apps") dateCounts[key].apps += 1;
  };

  // 1. Process explicit analytics events
  for (const ev of events) {
    let type: "dsa" | "mock" | "apps" | "other" = "other";
    const cat = (ev.category || "").toLowerCase();
    const evt = (ev.eventType || "").toLowerCase();

    if (cat.includes("dsa") || evt.includes("dsa")) type = "dsa";
    else if (cat.includes("interview") || evt.includes("interview")) type = "mock";
    else if (cat.includes("application") || evt.includes("application")) type = "apps";

    recordAction(ev.timestamp, type);
  }

  // 2. Process DSA activity timestamps.
  // The schema has no `solvedAt` column; `updatedAt` is the activity time.
  for (const d of dsaList) {
    if (d.updatedAt) {
      recordAction(d.updatedAt, "dsa");
    }
  }

  // 3. Process Interview timestamps
  for (const i of interviews) {
    if (i.createdAt) {
      recordAction(i.createdAt, "mock");
    }
  }

  // 4. Process Applications
  for (const a of applications) {
    if (a.appliedDate) {
      recordAction(a.appliedDate, "apps");
    }
  }

  // Build sequential 365-day array (52 weeks = 364 days + 1)
  const days: Array<{
    date: string;
    dayName: string;
    monthName: string;
    count: number;
    level: number;
    dsa: number;
    mock: number;
    apps: number;
  }> = [];

  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);
  startDate.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let longestStreak = 0;
  let runningStreak = 0;
  let totalActiveDays = 0;
  let totalActivities = 0;

  for (let i = 0; i < 365; i++) {
    const cur = new Date(startDate);
    cur.setDate(cur.getDate() + i);
    const key = cur.toISOString().split("T")[0];

    const data = dateCounts[key] || { count: 0, dsa: 0, mock: 0, apps: 0 };
    const count = data.count;

    let level = 0;
    if (count === 0) level = 0;
    else if (count <= 2) level = 1;
    else if (count <= 4) level = 2;
    else if (count <= 6) level = 3;
    else level = 4;

    if (count > 0) {
      totalActiveDays++;
      totalActivities += count;
      runningStreak++;
      if (runningStreak > longestStreak) {
        longestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }

    days.push({
      date: key,
      dayName: cur.toLocaleDateString("en-US", { weekday: "short" }),
      monthName: cur.toLocaleDateString("en-US", { month: "short" }),
      count,
      level,
      dsa: data.dsa,
      mock: data.mock,
      apps: data.apps,
    });
  }

  // Compute current streak from the end of the array
  const todayKey = today.toISOString().split("T")[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = yesterday.toISOString().split("T")[0];

  let streakIndex = days.length - 1;
  // If today has 0 activity, check if yesterday had activity to maintain streak
  if (days[streakIndex]?.count === 0) {
    streakIndex = days.length - 2;
  }

  while (streakIndex >= 0 && days[streakIndex]?.count > 0) {
    currentStreak++;
    streakIndex--;
  }

  return {
    days,
    stats: {
      currentStreak,
      longestStreak,
      totalActiveDays,
      totalActivities,
      completionRate: totalActiveDays > 0 ? `${Math.round((totalActiveDays / 365) * 100)}%` : "0%",
    },
  };
}

// GET /api/analytics, /api/analytics/dashboard, /api/progress, /api/progress/analytics
analyticsRouter.get(["/", "/dashboard", "/analytics", "/progress/analytics"], authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const recentEvents = await db.analytics.getEvents(userId, 50);
    const allEvents = await db.analytics.getEvents(userId, 1000);
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

    // Interview no longer carries `overallScore`; it lives on the
    // InterviewEvaluation relation, which listByUser now includes.
    const interviewScores = interviews
      .map((i: any) => i.evaluation?.overallScore)
      .filter((v: any) => v != null) as number[];
    const avgInterviewScore = interviewScores.length > 0
      ? Math.round(interviewScores.reduce((a, b) => a + b, 0) / interviewScores.length)
      : null;

    // ApplicationStatus enum values are: wishlist | applied | screening |
    // interview | offer | rejected | withdrawn. The previous filters looked for
    // "saved" and "interviewing", which are not enum members, so those buckets
    // were always 0. Response keys are unchanged for the frontend.
    const pipelineCounts = {
      saved: applications.filter((a) => a.status === "wishlist").length,
      applied: applications.filter((a) => a.status === "applied").length,
      screening: applications.filter((a) => a.status === "screening").length,
      interviewing: applications.filter((a) => a.status === "interview").length,
      offer: applications.filter((a) => a.status === "offer").length,
      rejected: applications.filter((a) => a.status === "rejected").length,
      withdrawn: applications.filter((a) => a.status === "withdrawn").length,
    };

    const dsaSolvedCount = dsaList.filter((d) => d.status === "solved" || d.status === "accepted").length;

    // Derived overall readiness score strictly based on real candidate assets
    const resumeWeight = parsedResume ? evaluation.resume_score * 0.35 : 0;
    const skillsWeight = Math.min(skills.length * 7, 100) * 0.25;
    const interviewWeight = avgInterviewScore !== null ? avgInterviewScore * 0.25 : 0;
    const dsaWeight = Math.min(dsaSolvedCount * 8, 100) * 0.15;

    const activeWeights = (parsedResume ? 0.35 : 0) + (skills.length > 0 ? 0.25 : 0) + (avgInterviewScore !== null ? 0.25 : 0) + (dsaSolvedCount > 0 ? 0.15 : 0);
    const overallReadiness = activeWeights > 0
      ? Math.round((resumeWeight + skillsWeight + interviewWeight + dsaWeight) / activeWeights)
      : 0;

    // Real 365-day activity calendar
    // AnalyticsEvent stores the event name in `type` and the category inside
    // the `payload` Json column, with `createdAt` as the timestamp.
    const activityData = buildActivityCalendar({
      events: allEvents.map((e: any) => ({
        eventType: e.type,
        category: e.payload?.category || "",
        timestamp: e.createdAt,
      })),
      dsaList: dsaList.map((d) => ({ status: d.status, updatedAt: d.updatedAt })),
      interviews: interviews.map((i: any) => ({
        createdAt: i.createdAt,
        overallScore: i.evaluation?.overallScore ?? null,
      })),
      applications: applications.map((a) => ({ appliedDate: a.appliedDate, createdAt: a.createdAt })),
    });

    res.json({
      success: true,
      analytics: {
        career_readiness_score: overallReadiness,
        resume_ats_score: parsedResume ? evaluation.resume_score : null,
        target_role: user?.profile?.targetRole || "Software Engineer",
        target_salary: user?.profile?.targetSalary ? `$${user.profile.targetSalary.toLocaleString()}` : null,
        applications_pipeline: {
          total: applications.length,
          ...pipelineCounts,
        },
        skills_overview: {
          total_skills: skills.length,
          verified_skills: skills.filter((s) => s.status === "verified").length,
          top_skills: skills.slice(0, 5).map((s) => s.name),
        },
        interview_metrics: {
          total_sessions: interviews.length,
          average_score: avgInterviewScore,
          latest_score: interviewScores[0] || null,
        },
        dsa_metrics: {
          solved_count: dsaSolvedCount,
          attempted_count: dsaList.length,
        },
        activity_calendar: activityData,
      },
      recent_events: recentEvents.map((e: any) => ({
        id: e.id,
        event_name: e.type,
        category: e.payload?.category || "",
        timestamp: e.createdAt.toISOString(),
      })),
    });
  } catch (error: any) {
    console.error("[Analytics Route Error]:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve analytics dashboard metrics." });
  }
});
