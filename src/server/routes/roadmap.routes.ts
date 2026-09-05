import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, AuthenticatedRequest } from "../auth";
import { validateBody } from "../security";
import { RoadmapMilestoneUpdateSchema } from "../schemas";

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
        // This is a static starter template, not a skill-gap analysis --
        // label its provenance honestly rather than falling back to the
        // repository's "skill_gap" default.
        source: "template",
      });
    }

    // Schema alignment: milestone week is `week` (was `weekNumber`), `tasks` is
    // a native Json column, and there are no `category` / `skills` / `resources`
    // milestone columns. Those keys are retained as empty values so the
    // response shape stays stable for existing frontend consumers.
    const formattedMilestones = (roadmap.milestones || []).map((m) => ({
      id: m.id,
      week: m.week,
      title: m.title,
      description: m.description,
      duration: m.duration,
      status: m.status,
      tasks: Array.isArray(m.tasks) ? m.tasks : [],
      category: null,
      skills: [],
      resources: [],
    }));

    // Roadmap has no `title`, `description` or `progress` column. The title is
    // derived exactly as it was previously stored, and progress is computed
    // from milestone statuses rather than read from a stale column.
    const completedCount = formattedMilestones.filter((m) => m.status === "completed").length;
    const progress = formattedMilestones.length
      ? Math.round((completedCount / formattedMilestones.length) * 100)
      : 0;

    res.json({
      success: true,
      roadmap: {
        id: roadmap.id,
        targetRole: roadmap.targetRole,
        source: roadmap.source,
        title: `Mastery Path for ${roadmap.targetRole}`,
        description: "",
        progress,
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

    const updated = await db.roadmaps.updateMilestone(milestoneId, effectiveStatus, userId);
    if (!updated) {
      return res.status(404).json({ success: false, message: "Milestone not found or unauthorized." });
    }

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

roadmapRouter.put("/milestones/:id", authenticateToken, validateBody(RoadmapMilestoneUpdateSchema), updateMilestoneHandler);
roadmapRouter.post("/milestones/:id", authenticateToken, validateBody(RoadmapMilestoneUpdateSchema), updateMilestoneHandler);
