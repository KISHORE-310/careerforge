import { Router, Request, Response } from "express";
import { db } from "../../db/repositories";
import { optionalAuth } from "../auth";
import { buildCandidateContext, scoreJobMatch } from "../services/matching";
import { formatResumeResponse } from "../lib/resume";
import { parseSalaryRange } from "../lib/data";

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
    const jobs = await db.jobs.list({
      search: (query as string) || (role as string),
      type: type as string,
    });

    // Candidate context is built once per request (not once per job) from
    // the authenticated user's real skills/profile/resume, then reused by
    // scoreJobMatch for every job below. Unauthenticated requests never get
    // a fabricated score -- match_score stays null.
    const userId = (req as any).userId;
    let candidate: Awaited<ReturnType<typeof buildCandidateContext>> | null = null;
    if (userId) {
      const [user, skills, resumeRecord] = await Promise.all([
        db.users.findById(userId),
        db.skills.listByUser(userId),
        db.resumes.getPrimary(userId),
      ]);
      const resume = formatResumeResponse(resumeRecord, user);
      candidate = await buildCandidateContext({ skills, profile: user?.profile, resume });
    }

    const formatted = jobs.map((j) => {
      // `requirements` and `skillsRequired` are native Json columns and are
      // already parsed. The schema stores the company name on `companyName`
      // (`company` is now the Company relation) and a single `salary` string
      // (there are no salaryMin/salaryMax/salaryText columns).
      const skills = Array.isArray(j.skillsRequired) ? j.skillsRequired : [];
      const requirements = Array.isArray(j.requirements) ? j.requirements : [];
      const match_score = candidate
        ? scoreJobMatch(candidate, {
            title: j.title,
            description: j.description,
            skillsRequired: skills,
            experience: j.experience,
            location: j.location,
            workplace: j.workplace,
            salary: j.salary,
          }).overall
        : null;
      return {
        id: j.id,
        title: j.title,
        company: j.companyName,
        // No logo column in the schema. Placeholder retained; Phase 2 replaces it.
        company_logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
        location: j.location,
        type: j.type,
        workplace: j.workplace,
        salary_range: j.salary || "",
        description: j.description,
        requirements,
        skills_required: skills,
        match_score,
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
        company: job.companyName,
        location: job.location,
        type: job.type,
        workplace: job.workplace,
        salary_range: job.salary || "",
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

export const companiesRouter = Router();
export const marketRouter = Router();

// Maps a Company row (db.companies.list()'s `jobs` relation already filtered
// to isExpired: false) onto the response shape the frontend expects. Every
// field is sourced from a real column -- no per-company literal remains.
// `logo` is the one exception: the schema has no logo column, so the same
// placeholder used elsewhere in this file is kept as-is (Phase 2 replaces
// it) rather than solved here.
function formatCompany(c: Awaited<ReturnType<typeof db.companies.list>>[number]) {
  return {
    id: c.id,
    name: c.name,
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
    rating: c.rating,
    // Live count of this company's currently non-expired jobs rather than a
    // static column, so it can't go stale relative to the Job table.
    open_roles: c.jobs.length,
    culture_score: c.recommendRate,
    interview_difficulty: c.hiringVelocity,
    headquarters: c.headquarters,
    description: c.description,
    tech_stack: Array.isArray(c.techStack) ? c.techStack : [],
  };
}

// Derives a top-paying-skills signal from CareerForge's own stored Job
// catalog (skillsRequired + salary) instead of a static literal.
// `demand_index` and each skill's `growth_pct` are intentionally left null:
// an honest market-wide demand score or salary trend needs an external
// labor-market data source (real posting volume, historical salary
// snapshots) that this internal job catalog can't truthfully represent on
// its own -- computing an arbitrary function of our own handful of listings
// and labeling it "market demand" would just swap one fabricated number for
// another, not fix the underlying problem.
async function computeMarketInsights() {
  const jobs = await db.jobs.list({ limit: 200 });

  const bySkill = new Map<string, number[]>();
  for (const job of jobs) {
    const { min, max } = parseSalaryRange(job.salary);
    if (min == null) continue;
    const mid = max != null ? (min + max) / 2 : min;

    const skills = Array.isArray(job.skillsRequired) ? job.skillsRequired : [];
    for (const skill of skills) {
      if (typeof skill !== "string" || !skill.trim()) continue;
      const list = bySkill.get(skill) || [];
      list.push(mid);
      bySkill.set(skill, list);
    }
  }

  const top_paying_skills = [...bySkill.entries()]
    .map(([skill, salaries]) => ({
      skill,
      avgSalaryValue: salaries.reduce((a, b) => a + b, 0) / salaries.length,
    }))
    .sort((a, b) => b.avgSalaryValue - a.avgSalaryValue)
    .slice(0, 5)
    .map(({ skill, avgSalaryValue }) => ({
      skill,
      // Explicit "en-US" -- toLocaleString() with no locale argument follows
      // the host's default ICU locale, which on some systems groups digits
      // Indian-style ("2,60,000") instead of "260,000".
      avg_salary: `$${Math.round(avgSalaryValue).toLocaleString("en-US")}`,
      growth_pct: null,
    }));

  return {
    demand_index: null,
    top_paying_skills,
  };
}

companiesRouter.get(["/", "/companies"], async (_req: Request, res: Response) => {
  try {
    const companies = await db.companies.list();
    res.json({ success: true, companies: companies.map(formatCompany) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve companies." });
  }
});

marketRouter.get(["/", "/market"], async (_req: Request, res: Response) => {
  try {
    const market = await computeMarketInsights();
    res.json({ success: true, market });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve market intelligence." });
  }
});

// GET /api/companies (via jobs router fallback)
jobsRouter.get(["/meta/companies", "/companies"], async (_req: Request, res: Response) => {
  try {
    const companies = await db.companies.list();
    res.json({ success: true, companies: companies.map(formatCompany) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve companies." });
  }
});

// GET /api/market (via jobs router fallback)
jobsRouter.get(["/meta/market", "/market"], async (_req: Request, res: Response) => {
  try {
    const market = await computeMarketInsights();
    res.json({ success: true, market });
  } catch (error: any) {
    res.status(500).json({ success: false, message: "Failed to retrieve market intelligence." });
  }
});
