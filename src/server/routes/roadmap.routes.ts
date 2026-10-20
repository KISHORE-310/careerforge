import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, AuthenticatedRequest } from "../auth";
import { validateBody } from "../security";
import { RoadmapMilestoneUpdateSchema } from "../schemas";

export const roadmapRouter = Router();

const ROLE_SKILLS: Array<{ match: RegExp; skills: string[] }> = [
  { match: /ai|machine learning|data scientist/i, skills: ["Python", "SQL", "Machine Learning", "Model Evaluation", "MLOps", "System Design"] },
  { match: /front.?end|ui|react/i, skills: ["JavaScript", "TypeScript", "React", "Testing", "Web Performance", "System Design"] },
  { match: /devops|cloud|platform/i, skills: ["Linux", "Docker", "Kubernetes", "CI/CD", "Terraform", "Observability"] },
  { match: /backend|distributed|java|node/i, skills: ["API Design", "SQL", "PostgreSQL", "Caching", "System Design", "Cloud"] },
];

function generatePersonalizedRoadmap(targetRole: string, savedSkills: string[]) {
  const targetSkills = ROLE_SKILLS.find((entry) => entry.match.test(targetRole))?.skills
    || ["TypeScript", "API Design", "SQL", "Testing", "System Design", "Cloud"];
  const known = new Set(savedSkills.map((skill) => skill.trim().toLowerCase()).filter(Boolean));
  const gaps = targetSkills.filter((skill) => !known.has(skill.toLowerCase()));
  const focus = [...gaps, ...targetSkills.filter((skill) => known.has(skill.toLowerCase()))].slice(0, 6);
  const chunk = (start: number) => focus.slice(start, start + 2);
  return [
    {
      week: 1,
      title: `Foundation for ${targetRole}`,
      duration: "30-Day Focus",
      status: "todo",
      progress: 0,
      description: `Build the two highest-priority skill gaps for your ${targetRole} target: ${chunk(0).join(", ") || "your saved stack"}.`,
      tasks: chunk(0).map((skill) => ({ title: `Complete one practical ${skill} exercise and document the result`, completed: false })),
    },
    {
      week: 2,
      title: "Applied Projects & Engineering Practice",
      duration: "30-Day Focus",
      status: "todo",
      progress: 0,
      description: `Turn priority gaps into portfolio evidence, focusing on ${chunk(2).join(" and ") || "your target role's core skills"}.`,
      tasks: chunk(2).map((skill) => ({ title: `Ship a small project improvement demonstrating ${skill}`, completed: false })),
    },
    {
      week: 3,
      title: "Interview-Ready Depth",
      duration: "60-Day Focus",
      status: "todo",
      progress: 0,
      description: `Practice explaining trade-offs and deepen ${chunk(4).join(" and ") || "your strongest role-relevant skills"}.`,
      tasks: chunk(4).map((skill) => ({ title: `Complete an interview-style exercise covering ${skill}`, completed: false })),
    },
    {
      week: 4,
      title: "Application Evidence & Interview Loop",
      duration: "90-Day Focus",
      status: "todo",
      progress: 0,
      description: "Convert completed work into resume evidence, targeted applications, and interview stories.",
      tasks: [
        { title: "Update one resume project with measurable technical impact", completed: false },
        { title: "Complete one mock interview and record the improvement areas", completed: false },
        { title: "Apply to roles aligned with the completed skill evidence", completed: false },
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
      const skills = await db.skills.listByUser(userId);
      const generated = generatePersonalizedRoadmap(user?.profile?.targetRole || "Software Engineer", skills.map((skill) => skill.name));
      roadmap = await db.roadmaps.createWithMilestones(userId, {
        targetRole: user?.profile?.targetRole || "Full Stack Engineer",
        milestones: generated,
        source: "rules_based_skill_gap",
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

// POST /api/roadmap/regenerate -- explicit user action; replaces only that
// user's saved roadmap with a fresh plan based on their current profile.
roadmapRouter.post("/regenerate", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const [user, skills] = await Promise.all([db.users.findById(userId), db.skills.listByUser(userId)]);
    const targetRole = user?.profile?.targetRole || "Software Engineer";
    const roadmap = await db.roadmaps.createWithMilestones(userId, {
      targetRole,
      milestones: generatePersonalizedRoadmap(targetRole, skills.map((skill) => skill.name)),
      source: "rules_based_skill_gap",
    });
    await db.analytics.recordEvent(userId, "roadmap_regenerated", "Roadmap", { targetRole, skillsCount: skills.length });
    res.json({ success: true, roadmap });
  } catch {
    res.status(500).json({ success: false, message: "Failed to regenerate career roadmap." });
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
