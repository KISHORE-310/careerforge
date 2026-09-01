import { flattenResumeText, ResumeContent, calculateResumeScore } from "./scoring.js";

function norm(s: string) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(text: string): string[] {
  return norm(text)
    .split(" ")
    .filter((t) => t.length > 2);
}

const STOP = new Set([
  "the", "and", "for", "with", "you", "your", "our", "are", "will", "this", "that",
  "from", "have", "has", "been", "using", "use", "into", "able", "who", "job",
  "role", "team", "work", "working", "experience", "years", "year", "plus",
]);

export type JobLike = {
  title?: string;
  companyName?: string;
  company?: string;
  description?: string;
  requirements?: string[] | unknown;
  skillsRequired?: string[] | unknown;
  skills_required?: string[] | unknown;
  experience?: string;
};

export function analyzeAts(resume: ResumeContent | null | undefined, job: JobLike) {
  const completeness = calculateResumeScore(resume);
  const resumeText = flattenResumeText(resume);
  const resumeNorm = norm(resumeText);
  const resumeTokens = new Set(tokenize(resumeText).filter((t) => !STOP.has(t)));

  const skills = Array.isArray(job.skillsRequired)
    ? job.skillsRequired
    : Array.isArray(job.skills_required)
      ? job.skills_required
      : [];
  const requirements = Array.isArray(job.requirements) ? job.requirements : [];

  const requiredSkills = skills.map((s) => String(s)).filter(Boolean);
  const matched_skills: string[] = [];
  const missing_skills: string[] = [];

  for (const skill of requiredSkills) {
    const n = norm(skill);
    if (!n) continue;
    const hit =
      resumeNorm.includes(n) ||
      n.split(" ").every((part) => part.length < 3 || resumeTokens.has(part) || resumeNorm.includes(part));
    if (hit) matched_skills.push(skill);
    else missing_skills.push(skill);
  }

  const skillsMatchPct =
    requiredSkills.length > 0 ? Math.round((matched_skills.length / requiredSkills.length) * 100) : completeness.resume_score;

  const jdBlob = [job.title, job.description, ...(requirements as string[])].filter(Boolean).join(" ");
  const jdTokens = [...new Set(tokenize(jdBlob).filter((t) => !STOP.has(t) && t.length > 3))];
  const keywordHits = jdTokens.filter((t) => resumeTokens.has(t) || resumeNorm.includes(t));
  const keywordMisses = jdTokens.filter((t) => !resumeTokens.has(t) && !resumeNorm.includes(t)).slice(0, 25);
  const keywordPct = jdTokens.length > 0 ? Math.round((keywordHits.length / jdTokens.length) * 100) : 0;

  const education = Array.isArray(resume?.education) ? resume!.education : [];
  const experience = Array.isArray(resume?.experience) ? resume!.experience : [];
  const projects = Array.isArray(resume?.projects) ? resume!.projects : [];

  const education_alignment = education.length > 0 ? 80 : 30;
  const experience_alignment = Math.min(100, experience.length * 35);
  const project_relevance =
    projects.length === 0
      ? 20
      : Math.min(
          100,
          40 +
            projects.filter((p) => {
              const blob = norm(`${p.title} ${p.description} ${(p.technologies || []).join(" ")}`);
              return requiredSkills.some((s) => blob.includes(norm(s))) || keywordHits.some((k) => blob.includes(k));
            }).length * 20
        );

  const formatting_risks: string[] = [];
  if (!resume?.personal_info?.email) formatting_risks.push("Missing email in contact section");
  if (!resume?.personal_info?.phone) formatting_risks.push("Missing phone number");
  if (experience.some((e) => !e.start_date && !e.startDate)) formatting_risks.push("Some roles are missing dates");
  const allBullets = experience.flatMap((e) => (e.description || e.bullets || []) as string[]);
  if (allBullets.length > 0 && !allBullets.some((b) => /\d/.test(String(b)))) {
    formatting_risks.push("Few or no quantified achievements (numbers, percentages)");
  }
  if ((resume?.summary || "").length > 800) formatting_risks.push("Summary may be too long for ATS parsers");

  const overall = Math.round(
    skillsMatchPct * 0.35 +
      keywordPct * 0.2 +
      completeness.resume_score * 0.2 +
      experience_alignment * 0.15 +
      project_relevance * 0.1
  );

  const recommendations: string[] = [];
  if (missing_skills.length) {
    recommendations.push(`Add evidence for: ${missing_skills.slice(0, 5).join(", ")}`);
  }
  if (keywordMisses.length) {
    recommendations.push(`Consider covering JD terms where truthful: ${keywordMisses.slice(0, 8).join(", ")}`);
  }
  recommendations.push(...completeness.weaknesses.slice(0, 3));

  return {
    overall_match: Math.min(100, Math.max(0, overall)),
    ats_score: Math.min(100, Math.max(0, overall)),
    skills_match: skillsMatchPct,
    keyword_match: keywordPct,
    experience_alignment,
    education_alignment,
    project_relevance,
    completeness_score: completeness.resume_score,
    matched_skills,
    missing_skills,
    matched_keywords: keywordHits.slice(0, 40),
    missing_keywords: keywordMisses,
    formatting_risks,
    missing_sections: completeness.missing_sections,
    recommendations: [...new Set(recommendations)],
    factors: {
      skills_weight: 0.35,
      keyword_weight: 0.2,
      completeness_weight: 0.2,
      experience_weight: 0.15,
      projects_weight: 0.1,
    },
    method: "deterministic_keyword_and_section_analysis",
  };
}
