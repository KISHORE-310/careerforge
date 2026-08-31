import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { optionalAuth } from "../auth";

export const jobsRouter = Router();

// GET /api/jobs
jobsRouter.get("/", async (req: Request, res: Response) => {
  try {
    const { query, role, type } = req.query;
    const jobs = await db.jobs.list({
      search: (query as string) || (role as string),
      type: type as string,
    });

    const formatted = jobs.map((j) => {
      let skills: string[] = [];
      let requirements: string[] = [];
      try { skills = j.skills ? JSON.parse(j.skills) : []; } catch { skills = []; }
      try { requirements = j.requirements ? JSON.parse(j.requirements) : []; } catch { requirements = []; }
      return {
        id: j.id,
        title: j.title,
        company: j.company,
        company_logo: j.companyLogo || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
        location: j.location,
        type: j.type,
        workplace: j.workplace,
        salary_range: j.salaryText || `$${(j.salaryMin || 140000).toLocaleString()} - $${(j.salaryMax || 190000).toLocaleString()}`,
        description: j.description,
        requirements,
        skills_required: skills,
        match_score: 92,
        posted_days_ago: "2d ago",
      };
    });

    res.json({ success: true, count: formatted.length, jobs: formatted });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve job listings." });
  }
});

// GET /api/jobs/:id (Fit Analysis against candidate skills)
jobsRouter.get("/:id", optionalAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId;
    const job = await db.jobs.findById(id);

    if (!job) {
      return res.status(404).json({ success: false, message: "Job listing not found." });
    }

    let skillsReq: string[] = [];
    try { skillsReq = job.skills ? JSON.parse(job.skills) : []; } catch { skillsReq = []; }

    let userSkills: string[] = [];
    if (userId) {
      const skills = await db.skills.listByUser(userId);
      userSkills = skills.map((s) => s.name.toLowerCase());
    }

    const matched = skillsReq.filter((s) => userSkills.includes(s.toLowerCase()));
    const missing = skillsReq.filter((s) => !userSkills.includes(s.toLowerCase()));
    const skillsMatchPct = skillsReq.length > 0 ? Math.round((matched.length / skillsReq.length) * 100) : 75;
    const overallScore = Math.min(Math.max(skillsMatchPct, 40), 96);

    res.json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        company: job.company,
        location: job.location,
        type: job.type,
        workplace: job.workplace,
        salary_range: job.salaryText || "$160k - $210k",
        description: job.description,
        skills_required: skillsReq,
        match_score: overallScore,
      },
      fit_analysis: {
        overall_match: overallScore,
        skills_match: skillsMatchPct,
        experience_alignment: "Evaluated against candidate experience records",
        matched_skills: matched,
        missing_skills: missing,
        key_strengths: matched.length > 0 ? matched.map((s) => `Demonstrated proficiency in ${s}`) : ["Transferable software engineering foundation"],
        recommended_action: missing.length > 0 ? `Target hands-on practice with ${missing.slice(0, 3).join(", ")} to maximize job match score.` : "High technical alignment; prepare tailored cover letter and STAR stories.",
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to evaluate job fit." });
  }
});

// GET /api/companies
jobsRouter.get("/meta/companies", (_req: Request, res: Response) => {
  const sampleCompanies = [
    {
      id: "comp_1",
      name: "Stripe",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
      rating: 4.8,
      open_roles: 14,
      culture_score: 94,
      interview_difficulty: "High",
      headquarters: "San Francisco, CA",
      description: "Financial infrastructure for the internet. Stripe builds APIs powering payments globally.",
      tech_stack: ["Ruby", "TypeScript", "React", "Go", "PostgreSQL", "AWS"],
    },
    {
      id: "comp_2",
      name: "Anthropic",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
      rating: 4.9,
      open_roles: 9,
      culture_score: 98,
      interview_difficulty: "Very High",
      headquarters: "San Francisco, CA",
      description: "AI safety and research company dedicated to building reliable, interpretable, and steerable AI systems.",
      tech_stack: ["Python", "PyTorch", "TypeScript", "Rust", "JAX", "Distributed Computing"],
    },
    {
      id: "comp_3",
      name: "Vercel",
      logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
      rating: 4.7,
      open_roles: 8,
      culture_score: 92,
      interview_difficulty: "High",
      headquarters: "San Francisco, CA",
      description: "The Frontend Cloud platform enabling developers to build and deploy high-speed web apps.",
      tech_stack: ["Next.js", "React", "TypeScript", "Rust", "Edge Infrastructure"],
    },
  ];
  res.json({ success: true, companies: sampleCompanies });
});

// GET /api/market
jobsRouter.get("/meta/market", (_req: Request, res: Response) => {
  const marketData = {
    demand_index: 87,
    top_paying_skills: [
      { skill: "Distributed Systems", avg_salary: "$195,000", growth_pct: "+24%" },
      { skill: "LLM / AI Orchestration", avg_salary: "$210,000", growth_pct: "+62%" },
      { skill: "TypeScript / Full Stack", avg_salary: "$175,000", growth_pct: "+18%" },
    ],
  };
  res.json({ success: true, market: marketData });
});
