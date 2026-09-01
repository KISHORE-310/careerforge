export type ResumeContent = {
  personal_info?: {
    full_name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary?: string;
  education?: any[];
  experience?: any[];
  projects?: any[];
  certifications?: any[];
  technical_skills?: string[];
  soft_skills?: string[];
  achievements?: string[];
  languages?: string[];
};

export function emptyResume(fullName: string, email: string): ResumeContent {
  return {
    personal_info: {
      full_name: fullName,
      email,
      phone: "",
      location: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    summary: "",
    education: [],
    experience: [],
    projects: [],
    certifications: [],
    technical_skills: [],
    soft_skills: [],
    achievements: [],
    languages: [],
  };
}

function bulletsOf(exp: any): string[] {
  if (Array.isArray(exp?.description)) return exp.description.filter(Boolean);
  if (Array.isArray(exp?.bullets)) return exp.bullets.filter(Boolean);
  if (typeof exp?.description === "string" && exp.description.trim()) return [exp.description];
  return [];
}

export function calculateResumeScore(profile: ResumeContent | null | undefined) {
  if (!profile) {
    return {
      resume_score: 0,
      grade: "Not Started",
      strengths: [] as string[],
      weaknesses: ["No resume yet. Upload a PDF or fill in Resume Studio."],
      breakdown: {
        personal_information: 0,
        summary: 0,
        education: 0,
        experience: 0,
        projects: 0,
        technical_skills: 0,
        certifications: 0,
      },
      missing_sections: ["personal_info", "summary", "education", "experience", "projects", "technical_skills"],
    };
  }

  let score = 0;
  const breakdown: Record<string, number> = {};
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const missing_sections: string[] = [];

  const personal = profile.personal_info || {};
  let personalScore = 0;
  if (personal.full_name) personalScore += 3;
  if (personal.email) personalScore += 3;
  if (personal.phone) personalScore += 3;
  if (personal.linkedin) {
    personalScore += 3;
    strengths.push("LinkedIn profile linked");
  } else {
    weaknesses.push("Add a LinkedIn URL");
  }
  if (personal.github) {
    personalScore += 4;
    strengths.push("GitHub linked");
  } else {
    weaknesses.push("Add a GitHub URL");
  }
  if (!personal.full_name || !personal.email) missing_sections.push("personal_info");
  score += personalScore;
  breakdown.personal_information = personalScore;

  let summaryScore = 0;
  if (profile.summary && typeof profile.summary === "string") {
    const words = profile.summary.trim().split(/\s+/).filter(Boolean).length;
    if (words >= 35) {
      summaryScore = 10;
      strengths.push("Detailed professional summary");
    } else if (words >= 15) {
      summaryScore = 7;
    } else if (words > 0) {
      summaryScore = 4;
      weaknesses.push("Expand the summary with quantified outcomes");
    }
  }
  if (summaryScore === 0) {
    weaknesses.push("Add a professional summary");
    missing_sections.push("summary");
  }
  score += summaryScore;
  breakdown.summary = summaryScore;

  const education = Array.isArray(profile.education) ? profile.education.filter((e) => e && (e.degree || e.institution)) : [];
  const educationScore = Math.min(education.length * 5, 10);
  if (educationScore === 0) {
    weaknesses.push("Add education");
    missing_sections.push("education");
  } else strengths.push("Education documented");
  score += educationScore;
  breakdown.education = educationScore;

  const experience = Array.isArray(profile.experience) ? profile.experience.filter((e) => e && (e.company || e.role)) : [];
  const quantified = experience.some((e) => bulletsOf(e).some((b) => /\d/.test(b)));
  const experienceScore = Math.min(experience.length * 10, 20);
  if (experienceScore === 0) {
    weaknesses.push("Add work experience");
    missing_sections.push("experience");
  } else {
    strengths.push("Work experience listed");
    if (quantified) strengths.push("Experience includes measurable outcomes");
    else weaknesses.push("Quantify impact in experience bullets (numbers, %, time)");
  }
  score += experienceScore;
  breakdown.experience = experienceScore;

  const projects = Array.isArray(profile.projects) ? profile.projects.filter((p) => p && p.title) : [];
  const projectScore = Math.min(projects.length * 5, 20);
  if (projectScore < 10) {
    weaknesses.push("Add at least two projects with tech stack and links");
    if (projects.length === 0) missing_sections.push("projects");
  } else strengths.push(`${projects.length} project(s) listed`);
  score += projectScore;
  breakdown.projects = projectScore;

  const technicalSkills = Array.isArray(profile.technical_skills) ? profile.technical_skills.filter(Boolean) : [];
  const skillScore = Math.min(technicalSkills.length, 15);
  if (skillScore < 8) {
    weaknesses.push("Expand technical skills");
    if (technicalSkills.length === 0) missing_sections.push("technical_skills");
  } else strengths.push("Technical skills listed");
  score += skillScore;
  breakdown.technical_skills = skillScore;

  const certs = Array.isArray(profile.certifications) ? profile.certifications.filter((c) => c && (c.name || typeof c === "string")) : [];
  const certScore = Math.min(certs.length * 2.5, 5);
  if (certScore > 0) strengths.push("Certifications included");
  score += certScore;
  breakdown.certifications = certScore;

  const rawPercent = Math.round((score / 80) * 100);
  const normalizedScore = Math.min(Math.max(rawPercent, 0), 100);
  let grade = "Needs Improvement";
  if (normalizedScore >= 90) grade = "Excellent";
  else if (normalizedScore >= 75) grade = "Good";
  else if (normalizedScore >= 60) grade = "Average";
  else if (normalizedScore === 0) grade = "Not Started";

  return {
    resume_score: normalizedScore,
    grade,
    strengths,
    weaknesses,
    breakdown,
    missing_sections,
  };
}

export function flattenResumeText(profile: ResumeContent | null | undefined): string {
  if (!profile) return "";
  const chunks: string[] = [];
  const p = profile.personal_info || {};
  chunks.push(p.full_name || "", p.email || "", p.location || "");
  chunks.push(profile.summary || "");
  (profile.technical_skills || []).forEach((s) => chunks.push(String(s)));
  (profile.soft_skills || []).forEach((s) => chunks.push(String(s)));
  (profile.experience || []).forEach((e) => {
    chunks.push(e.company, e.role, ...bulletsOf(e));
  });
  (profile.projects || []).forEach((pr) => {
    chunks.push(pr.title, pr.description, ...(pr.technologies || []));
  });
  (profile.education || []).forEach((ed) => {
    chunks.push(ed.degree, ed.institution, ed.field_of_study);
  });
  (profile.certifications || []).forEach((c) => {
    chunks.push(typeof c === "string" ? c : c.name);
  });
  return chunks.filter(Boolean).join(" \n ");
}
