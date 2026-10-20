import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { optionalAuth, AuthenticatedRequest } from "../auth";
import { scoreJobMatch, getCandidateContextForUser } from "../services/matching";

export const jobsRouter = Router();

// Time since CareerForge fetched/ingested this listing (Job.fetchedAt) --
// not a claim about the employer's original posting date, which this schema
// does not track.
function formatPostedDaysAgo(fetchedAt: Date): string {
  const diffDays = Math.max(0, Math.floor((Date.now() - new Date(fetchedAt).getTime()) / (1000 * 60 * 60 * 24)));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1d ago";
  return `${diffDays}d ago`;
}

// GET /api/jobs
jobsRouter.get("/", optionalAuth, async (req: Request, res: Response) => {
  try {
    const { query, role, type } = req.query;
    const userId = (req as any).userId;
    const jobs = await db.jobs.list({
      search: (query as string) || (role as string),
      type: type as string,
    });

    const candidate = userId ? await getCandidateContextForUser(userId) : null;

    const formatted = jobs.map((j) => {
      const skills = Array.isArray(j.skillsRequired) ? (j.skillsRequired as string[]) : [];
      const requirements = Array.isArray(j.requirements) ? j.requirements : [];

      let matchScore: number | null = null;
      if (candidate && skills.length > 0) {
        const match = scoreJobMatch(candidate, j);
        matchScore = match.overall;
      }

      return {
        id: j.id,
        title: j.title,
        company: j.companyName,
        company_logo: (j as any).company?.logo || null,
        location: j.location,
        type: j.type,
        workplace: j.workplace,
        salary_range: j.salary || "",
        description: j.description,
        requirements,
        skills_required: skills,
        match_score: matchScore,
        posted_days_ago: formatPostedDaysAgo(j.fetchedAt),
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

    const skillsReq: string[] = Array.isArray(job.skillsRequired) ? (job.skillsRequired as string[]) : [];
    const candidate = userId ? await getCandidateContextForUser(userId) : null;

    let overallScore: number | null = null;
    let fitAnalysis: any = null;

    if (candidate) {
      if (skillsReq.length === 0) {
        overallScore = null;
        fitAnalysis = {
          overall_match: null,
          skills_match: null,
          status: "Not available",
          experience_alignment: "Listing does not specify required technical skills.",
          matched_skills: [],
          missing_skills: [],
          key_strengths: ["Review job description directly for role expectations."],
          recommended_action: "Examine detailed job description for team-specific requirements.",
        };
      } else {
        const match = scoreJobMatch(candidate, job);
        overallScore = match.overall;
        fitAnalysis = {
          overall_match: match.overall,
          skills_match: match.skills,
          experience_alignment: match.seniority >= 80 ? "Aligned with listed experience level" : "Requires additional domain seniority",
          matched_skills: match.matched_skills,
          missing_skills: match.missing_skills,
          key_strengths: match.strengths,
          recommended_action: match.explanation,
        };
      }
    }

    res.json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        company: job.companyName,
        company_logo: (job as any).company?.logo || null,
        location: job.location,
        type: job.type,
        workplace: job.workplace,
        salary_range: job.salary || "",
        description: job.description,
        skills_required: skillsReq,
        match_score: overallScore,
      },
      fit_analysis: fitAnalysis,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to evaluate job fit." });
  }
});

export const companiesRouter = Router();
export const marketRouter = Router();

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

const sampleMarketData = {
  demand_index: 87,
  top_paying_skills: [
    { skill: "Distributed Systems", avg_salary: "$195,000", growth_pct: "+24%" },
    { skill: "LLM / AI Orchestration", avg_salary: "$210,000", growth_pct: "+62%" },
    { skill: "TypeScript / Full Stack", avg_salary: "$175,000", growth_pct: "+18%" },
  ],
  trending_roles: [
    {
      role: "Distributed Systems Engineer",
      demand_growth: "+38% YoY",
      avg_salary: "$185,000 - $240,000",
      top_skills: ["Go", "Kafka", "Kubernetes"],
    },
    {
      role: "AI / ML Infrastructure Engineer",
      demand_growth: "+45% YoY",
      avg_salary: "$195,000 - $265,000",
      top_skills: ["PyTorch", "CUDA", "Ray"],
    },
    {
      role: "Senior Full Stack Architect",
      demand_growth: "+28% YoY",
      avg_salary: "$170,000 - $225,000",
      top_skills: ["TypeScript", "Next.js", "PostgreSQL"],
    },
    {
      role: "Cloud & Platform Security Lead",
      demand_growth: "+31% YoY",
      avg_salary: "$180,000 - $235,000",
      top_skills: ["Terraform", "AWS", "Zero Trust"],
    },
  ],
  in_demand_skills: [
    { skill: "Kafka & Flink", growth: 42, premium: "+22%", category: "Streaming" },
    { skill: "Rust Systems", growth: 38, premium: "+25%", category: "Languages" },
    { skill: "Distributed AI Infra", growth: 48, premium: "+30%", category: "AI/ML" },
    { skill: "Kubernetes & Istio", growth: 31, premium: "+18%", category: "DevOps" },
    { skill: "GraphQL & gRPC", growth: 26, premium: "+14%", category: "Backend" },
    { skill: "PostgreSQL & Raft", growth: 29, premium: "+16%", category: "Databases" },
  ],
  salary_by_location: {
    sf: [
      { level: "Mid-Level (L4)", base: 145, equity: 45, bonus: 20, total: 210 },
      { level: "Senior (L5)", base: 185, equity: 95, bonus: 35, total: 315 },
      { level: "Staff (L6)", base: 235, equity: 180, bonus: 55, total: 470 },
      { level: "Principal (L7)", base: 285, equity: 320, bonus: 85, total: 690 },
    ],
    nyc: [
      { level: "Mid-Level (L4)", base: 140, equity: 40, bonus: 20, total: 200 },
      { level: "Senior (L5)", base: 175, equity: 85, bonus: 35, total: 295 },
      { level: "Staff (L6)", base: 220, equity: 165, bonus: 50, total: 435 },
      { level: "Principal (L7)", base: 270, equity: 290, bonus: 80, total: 640 },
    ],
    remote: [
      { level: "Mid-Level (L4)", base: 135, equity: 35, bonus: 15, total: 185 },
      { level: "Senior (L5)", base: 170, equity: 75, bonus: 30, total: 275 },
      { level: "Staff (L6)", base: 210, equity: 150, bonus: 45, total: 405 },
      { level: "Principal (L7)", base: 255, equity: 260, bonus: 70, total: 585 },
    ],
  },
};

companiesRouter.get(["/", "/companies"], (_req: Request, res: Response) => {
  res.json({ success: true, companies: sampleCompanies });
});

marketRouter.get(["/", "/market"], (_req: Request, res: Response) => {
  res.json({ success: true, market: sampleMarketData });
});

// GET /api/companies (via jobs router fallback)
jobsRouter.get(["/meta/companies", "/companies"], (_req: Request, res: Response) => {
  res.json({ success: true, companies: sampleCompanies });
});

// GET /api/market (via jobs router fallback)
jobsRouter.get(["/meta/market", "/market"], (_req: Request, res: Response) => {
  res.json({ success: true, market: sampleMarketData });
});
