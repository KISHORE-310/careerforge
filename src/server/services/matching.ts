import { asArray, parseSalaryRange, seniorityFromText, yearsFromExperience } from "../lib/data";

export type CandidateMatchContext = {
  skills: string[];
  experienceYears: number;
  seniority: string;
  location?: string | null;
  targetSalary?: number | null;
  resumeText?: string;
  education?: string[];
};

export type JobMatchBreakdown = {
  overall: number;
  skills: number;
  experience: number;
  seniority: number;
  semantic: number;
  education: number;
  location: number;
  salary: number;
  matched_skills: string[];
  missing_skills: string[];
  strengths: string[];
  explanation: string;
};

const WEIGHTS = {
  skills: 0.3,
  experience: 0.2,
  seniority: 0.15,
  semantic: 0.15,
  education: 0.1,
  location: 0.05,
  salary: 0.05,
};

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9+#.]/g, "");
}

function skillOverlap(candidate: string[], required: string[]) {
  const cand = new Set(candidate.map(norm).filter(Boolean));
  const matched: string[] = [];
  const missing: string[] = [];
  for (const skill of required) {
    const key = norm(skill);
    if (!key) continue;
    if ([...cand].some((c) => c === key || c.includes(key) || key.includes(c))) matched.push(skill);
    else missing.push(skill);
  }
  const pct = required.length === 0 ? 70 : Math.round((matched.length / required.length) * 100);
  return { pct, matched, missing };
}

function seniorityScore(candidate: string, jobTitle: string, jobExperience: string) {
  const order = ["intern", "junior", "mid", "senior", "staff", "principal"];
  const cand = seniorityFromText(candidate);
  const job = seniorityFromText(`${jobTitle} ${jobExperience}`);
  const delta = Math.abs(order.indexOf(cand) - order.indexOf(job));
  return Math.max(40, 100 - delta * 18);
}

function experienceScore(years: number, jobExperience: string) {
  const required = yearsFromExperience(jobExperience) || (seniorityFromText(jobExperience) === "senior" ? 5 : 3);
  if (required <= 0) return 80;
  if (years >= required) return Math.min(100, 80 + Math.round((years - required) * 4));
  const gap = required - years;
  return Math.max(35, 80 - gap * 12);
}

function semanticScore(resumeText: string, job: { title: string; description: string; skills: string[] }) {
  const hay = (resumeText || "").toLowerCase();
  if (!hay.trim()) return 50;
  const tokens = [job.title, ...job.skills, ...(job.description || "").split(/\s+/).slice(0, 40)]
    .join(" ")
    .toLowerCase()
    .split(/[^a-z0-9+#]+/)
    .filter((t) => t.length > 3);
  const unique = [...new Set(tokens)];
  if (unique.length === 0) return 50;
  const hits = unique.filter((t) => hay.includes(t)).length;
  return Math.min(100, Math.round((hits / unique.length) * 100));
}

function educationScore(candidateEducation: string[], jobText: string) {
  const hay = jobText.toLowerCase();
  const needsDegree = /bachelor|master|phd|degree|computer science/.test(hay);
  if (!needsDegree) return 85;
  const blob = candidateEducation.join(" ").toLowerCase();
  if (/phd|doctor/.test(blob)) return 100;
  if (/master|m\.s|msc/.test(blob)) return 95;
  if (/bachelor|b\.s|bsc|b\.tech|btech/.test(blob)) return 88;
  return candidateEducation.length > 0 ? 70 : 45;
}

function locationScore(candidateLocation: string | null | undefined, jobLocation: string, workplace: string) {
  const job = `${jobLocation} ${workplace}`.toLowerCase();
  if (/remote|global/.test(job)) return 100;
  const cand = (candidateLocation || "").toLowerCase();
  if (!cand) return 70;
  if (job.includes(cand.split(",")[0].trim()) || cand.includes(jobLocation.toLowerCase().split(",")[0])) return 95;
  if (/hybrid/.test(job)) return 75;
  return 55;
}

function salaryScore(target: number | null | undefined, salaryText: string) {
  if (!target) return 80;
  const { min, max } = parseSalaryRange(salaryText);
  if (min == null) return 75;
  const mid = max != null ? (min + max) / 2 : min;
  if (mid >= target * 0.9) return 95;
  if (mid >= target * 0.75) return 80;
  if (mid >= target * 0.6) return 65;
  return 45;
}

export function scoreJobMatch(candidate: CandidateMatchContext, job: {
  title: string;
  description?: string;
  skills?: unknown;
  skillsRequired?: unknown;
  experience?: string;
  location?: string;
  workplace?: string;
  salary?: string;
}): JobMatchBreakdown {
  const required = asArray(job.skillsRequired ?? job.skills);
  const skills = skillOverlap(candidate.skills, required);
  const experience = experienceScore(candidate.experienceYears, job.experience || job.title);
  const seniority = seniorityScore(candidate.seniority, job.title, job.experience || "");
  const semantic = semanticScore(candidate.resumeText || candidate.skills.join(" "), {
    title: job.title,
    description: job.description || "",
    skills: required,
  });
  const education = educationScore(candidate.education || [], `${job.title} ${job.description || ""}`);
  const location = locationScore(candidate.location, job.location || "", job.workplace || "");
  const salary = salaryScore(candidate.targetSalary, job.salary || "");

  const overall = Math.round(
    skills.pct * WEIGHTS.skills +
      experience * WEIGHTS.experience +
      seniority * WEIGHTS.seniority +
      semantic * WEIGHTS.semantic +
      education * WEIGHTS.education +
      location * WEIGHTS.location +
      salary * WEIGHTS.salary
  );

  const strengths: string[] = [];
  if (skills.matched.length) strengths.push(`Strong overlap on ${skills.matched.slice(0, 4).join(", ")}`);
  if (seniority >= 80) strengths.push("Seniority band aligns with the posting");
  if (experience >= 80) strengths.push("Experience depth meets the listed bar");

  const explanation = skills.missing.length
    ? `Fit is driven by ${skills.matched.length}/${required.length || skills.matched.length} required skills. Bridge ${skills.missing.slice(0, 3).join(", ")} to raise the score.`
    : "High technical alignment across required skills, seniority, and compensation band.";

  return {
    overall: Math.min(98, Math.max(28, overall)),
    skills: skills.pct,
    experience,
    seniority,
    semantic,
    education,
    location,
    salary,
    matched_skills: skills.matched,
    missing_skills: skills.missing,
    strengths: strengths.length ? strengths : ["Transferable software engineering foundation"],
    explanation,
  };
}

export async function buildCandidateContext(params: {
  skills: Array<{ name: string }>;
  profile?: any;
  resume?: any;
}): Promise<CandidateMatchContext> {
  const skillNames = (params.skills || []).map((s) => s.name).filter(Boolean);
  const resumeSkills = asArray(params.resume?.technical_skills || params.resume?.skills);
  const skills = [...new Set([...skillNames, ...resumeSkills])];
  const experience = asArray(params.resume?.experience).length
    ? params.resume.experience
    : [];
  const years = experience.reduce((acc: number, exp: any) => {
    const period = `${exp.start_date || ""} ${exp.end_date || exp.period || ""}`;
    const y = yearsFromExperience(period);
    return acc + (y || 1);
  }, 0);
  const education = (params.resume?.education || []).map((e: any) => `${e.degree || ""} ${e.institution || ""} ${e.field_of_study || ""}`);
  const resumeText = [
    params.resume?.summary,
    skills.join(" "),
    education.join(" "),
    ...(experience || []).flatMap((e: any) => [e.role, e.company, ...(e.bullets || e.description || [])]),
  ]
    .filter(Boolean)
    .join(" ");

  const salaryRaw = params.profile?.targetSalary;
  const targetSalary = typeof salaryRaw === "number" ? salaryRaw : Number(String(salaryRaw || "").replace(/[^\d]/g, "")) || null;

  return {
    skills,
    experienceYears: years || yearsFromExperience(params.profile?.experienceLevel) || 3,
    seniority: params.profile?.experienceLevel || params.resume?.title || "mid",
    location: params.profile?.location || params.resume?.personal_info?.location,
    targetSalary,
    resumeText,
    education,
  };
}
