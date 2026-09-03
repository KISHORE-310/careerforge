import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { authenticateToken, AuthenticatedRequest } from "../auth";

export const skillsRouter = Router();

// GET /api/skills
skillsRouter.get("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const skills = await db.skills.listByUser(userId);

    const masteredCount = skills.filter((s) => s.proficiency >= 85).length;
    const totalCount = skills.length;
    const marketReadiness = totalCount > 0 ? Math.min(Math.round((masteredCount / totalCount) * 100), 98) : 0;

    const topStrengths = skills
      .filter((s) => s.proficiency >= 80)
      .map((s) => s.name)
      .slice(0, 4);

    const primaryGaps = skills
      .filter((s) => s.proficiency < 70)
      .map((s) => s.name)
      .slice(0, 3);

    res.json({
      success: true,
      skills: skills.map((s) => ({
        id: s.id,
        name: s.name,
        category: s.category,
        proficiency: s.proficiency,
        status: s.status,
        // Schema models skill provenance as a single `status` string
        // ("verified" | "learning" | source label) rather than separate
        // `verified` / `source` columns. Both keys are derived from it so the
        // existing response shape is preserved.
        verified: s.status === "verified",
        source: s.status,
      })),
      market_readiness_score: marketReadiness,
      top_strengths: topStrengths.length > 0 ? topStrengths : ["Add skills to see top strengths"],
      primary_gaps: primaryGaps.length > 0 ? primaryGaps : ["All listed skills are currently proficient"],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve skills." });
  }
});

// PUT /api/skills
skillsRouter.put("/", authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthenticatedRequest).userId;
    const { skills } = req.body;
    if (Array.isArray(skills)) {
      for (const s of skills) {
        if (s.name && typeof s.name === "string") {
          await db.skills.upsert(userId, {
            name: s.name.trim(),
            category: s.category,
            proficiency: typeof s.proficiency === "number" ? Math.min(Math.max(s.proficiency, 0), 100) : 75,
            verified: Boolean(s.verified),
          });
        }
      }
    }
    res.json({ success: true, message: "Skills updated successfully." });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to update skills." });
  }
});
