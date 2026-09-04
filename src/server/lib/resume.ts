import { asArray } from "./data";

// Shared by resume.routes.ts (GET /api/resume) and profile.routes.ts (GET
// /api/profile) so both endpoints format the persisted Resume/ResumeVersion
// record identically instead of maintaining two copies.
export function formatResumeResponse(resumeRecord: any, user: any) {
  if (!resumeRecord) {
    return {
      personal_info: {
        full_name: user?.name || "Candidate",
        email: user?.email || "",
        phone: user?.profile?.phone || "",
        location: user?.profile?.location || "",
        linkedin: user?.profile?.linkedin || "",
        github: user?.profile?.github || "",
        portfolio: user?.profile?.portfolio || "",
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

  let contactInfo: any = {};
  let experience: any[] = [];
  let education: any[] = [];
  let skills: any[] = [];
  let projects: any[] = [];
  let certifications: any[] = [];

  try { contactInfo = resumeRecord.contactInfo ? JSON.parse(resumeRecord.contactInfo) : {}; } catch { contactInfo = {}; }
  try { experience = resumeRecord.experience ? JSON.parse(resumeRecord.experience) : []; } catch { experience = []; }
  try { education = resumeRecord.education ? JSON.parse(resumeRecord.education) : []; } catch { education = []; }
  try { skills = resumeRecord.skills ? JSON.parse(resumeRecord.skills) : []; } catch { skills = []; }
  try { projects = resumeRecord.projects ? JSON.parse(resumeRecord.projects) : []; } catch { projects = []; }
  try { certifications = resumeRecord.certifications ? JSON.parse(resumeRecord.certifications) : []; } catch { certifications = []; }

  // soft_skills / achievements / languages aren't extracted into their own
  // stringified fields by db.resumes.flattenRecord — they only live on the
  // raw content object it passes through. Read them from there instead of
  // fabricating placeholder values.
  const rawContent = resumeRecord.content && typeof resumeRecord.content === "object" ? resumeRecord.content : {};

  return {
    id: resumeRecord.id,
    target_role: resumeRecord.targetRole,
    personal_info: {
      full_name: contactInfo.full_name || contactInfo.name || user?.name || "Candidate",
      email: contactInfo.email || user?.email || "",
      phone: contactInfo.phone || user?.profile?.phone || "",
      location: contactInfo.location || user?.profile?.location || "",
      linkedin: contactInfo.linkedin || user?.profile?.linkedin || "",
      github: contactInfo.github || user?.profile?.github || "",
      portfolio: contactInfo.portfolio || user?.profile?.portfolio || "",
    },
    summary: resumeRecord.summary || "",
    experience,
    education,
    projects,
    certifications,
    technical_skills: Array.isArray(skills) ? skills : [],
    soft_skills: asArray(rawContent.soft_skills),
    achievements: asArray(rawContent.achievements),
    languages: asArray(rawContent.languages),
    ats_score: resumeRecord.atsScore,
  };
}
