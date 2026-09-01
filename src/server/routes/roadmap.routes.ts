import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, AuthenticatedRequest } from "../auth";

export const roadmapRouter = Router();

function generateFreshRoadmap(targetRole: string = "Full Stack Engineer") {
  return [
    {
      week: 1,
      title: "Core Architecture & Modern Stack Foundations",
      duration: "30-Day Focus",
      status: "todo",
      progress: 0,
      description: `Establish production-grade foundations and key patterns for ${targetRole}.`,
      skills: ["TypeScript", "API Design", "Architecture"],
      tasks: [
        { title: "Review Core Language Fundamentals & Type System", completed: false },
        { title: "Architect Clean Component and API Layer Interfaces", completed: false },
        { title: "Benchmark and Profile Runtime Performance", completed: false },
      ],
    },
    {
      week: 2,
      title: "System Design & Distributed Data Layers",
      duration: "30-Day Focus",
      status: "todo",
      progress: 0,
      description: "Master caching, database indexing, rate limiting, and event patterns.",
      skills: ["PostgreSQL", "Redis", "Distributed Systems"],
      tasks: [
        { title: "Implement Redis Caching & Invalidation Logic", completed: false },
        { title: "Design High-Availability Data Storage Schemas", completed: false },
        { title: "Simulate Concurrency and Bottleneck Scenarios", completed: false },
      ],
    },
    {
      week: 3,
      title: "Cloud Infrastructure & Containerization",
      duration: "60-Day Focus",
      status: "todo",
      progress: 0,
      description: "Deploy robust cloud containers, automated CI/CD pipelines, and health monitoring.",
      skills: ["Docker", "CI/CD", "Cloud Run"],
      tasks: [
        { title: "Write Multi-Stage Production Container Specs", completed: false },
        { title: "Configure Continuous Delivery Pipeline", completed: false },
        { title: "Instrument Telemetry & Error Tracking", completed: false },
      ],
    },
    {
      week: 4,
      title: "Interview Simulation & Portfolio Capstone",
      duration: "90-Day Focus",
      status: "todo",
      progress: 0,
      description: "Complete mock system design and behavioral rounds to maximize offer rates.",
      skills: ["System Design", "Behavioral STAR", "Mock Interviews"],
      tasks: [
        { title: "Conduct 3 Full System Design Practice Sessions", completed: false },
        { title: "Refine STAR Stories for Behavioral Rounds", completed: false },
        { title: "Publish End-to-End Capstone with Live Demo", completed: false },
      ],
    },
  ];
}

// GET /api/roadmap
roadmapRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const user = await db.users.findById(userId);
    let roadmap = await db.roadmaps.getActiveByUser(userId);

    if (!roadmap) {
      const generated = generateFreshRoadmap(user?.profile?.targetRole || "Full Stack Engineer");
      roadmap = await db.roadmaps.createWithMilestones(userId, {
        targetRole: user?.profile?.targetRole || "Full Stack Engineer",
        milestones: generated,
      });
    }

    const formattedMilestones = (roadmap.milestones || []).map((m) => {
      let skills: string[] = [];
      let resources: string[] = [];
      try { skills = m.skills ? JSON.parse(m.skills) : []; } catch { skills = []; }
      try { resources = m.resources ? JSON.parse(m.resources) : []; } catch { resources = []; }
      return {
        id: m.id,
        week: m.weekNumber,
        title: m.title,
        description: m.description,
        category: m.category,
        status: m.status,
        skills,
        resources,
      };
    });

    res.json({
      success: true,
      roadmap: {
        id: roadmap.id,
        targetRole: roadmap.targetRole,
        title: roadmap.title,
        description: roadmap.description,
        progress: roadmap.progress,
        milestones: formattedMilestones,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve career roadmap." });
  }
});

// PUT /api/roadmap
roadmapRouter.put("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { roadmap } = req.body;
    if (roadmap && roadmap.milestones) {
      await db.roadmaps.createWithMilestones(userId, {
        targetRole: roadmap.targetRole || "Software Engineer",
        milestones: roadmap.milestones,
      });
      await db.analytics.recordEvent(userId, "roadmap_updated", "Roadmap", {
        targetRole: roadmap.targetRole,
        milestonesCount: roadmap.milestones.length,
      });
    }
    res.json({ success: true, message: "Roadmap updated successfully." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to update roadmap." });
  }
});

// PUT & POST /api/roadmap/milestones/:id
const updateMilestoneHandler = async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const milestoneId = req.params.id;
    const { status } = req.body;
    const effectiveStatus = status || "completed";

    const updated = await db.roadmaps.updateMilestone(milestoneId, effectiveStatus);
    await db.analytics.recordEvent(userId, effectiveStatus === "completed" ? "milestone_completed" : "milestone_updated", "Roadmap", {
      milestoneId,
      status: effectiveStatus,
      title: updated.title,
    });

    res.json({ success: true, message: "Milestone status updated.", milestone: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to update milestone status." });
  }
};

roadmapRouter.put("/milestones/:id", authenticateToken, updateMilestoneHandler);
roadmapRouter.post("/milestones/:id", authenticateToken, updateMilestoneHandler);
