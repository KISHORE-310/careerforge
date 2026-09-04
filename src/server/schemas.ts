import { z } from "zod";
import { normalizeStatus } from "./lib/data";

// =====================================
// Auth Validation Schemas
// =====================================
export const SignupSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password is too long"),
  full_name: z.string().trim().max(100).optional(),
});

export const LoginSchema = z.object({
  email: z.string().trim().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required").max(128),
});

// =====================================
// Profile Validation Schemas
// =====================================
export const ProfileUpdateSchema = z.object({
  full_name: z.string().trim().max(100).optional(),
  targetRole: z.string().trim().max(100).optional(),
  target_role: z.string().trim().max(100).optional(),
  targetSalary: z.union([z.number(), z.string()]).optional(),
  target_salary: z.union([z.number(), z.string()]).optional(),
  experienceLevel: z.string().trim().max(50).optional(),
  experience_level: z.string().trim().max(50).optional(),
  bio: z.string().max(2000).optional(),
  location: z.string().trim().max(100).optional(),
  phone: z.string().trim().max(30).optional(),
  github: z.string().trim().max(255).optional(),
  linkedin: z.string().trim().max(255).optional(),
  portfolio: z.string().trim().max(255).optional(),
});

export const OnboardingSchema = z.object({
  target_role: z.string().trim().min(1, "Target role is required").max(100),
  experience_level: z.string().trim().max(50).optional(),
  skills: z.array(z.string().trim().max(50)).max(50).optional(),
  target_salary: z.union([z.number(), z.string()]).optional(),
});

// =====================================
// Resume Validation Schemas
// =====================================
export const ResumeSchema = z.object({
  personal_info: z
    .object({
      full_name: z.string().max(100).optional(),
      email: z.string().max(255).optional(),
      phone: z.string().max(50).optional(),
      location: z.string().max(100).optional(),
      linkedin: z.string().max(255).optional(),
      github: z.string().max(255).optional(),
      portfolio: z.string().max(255).optional(),
    })
    .optional(),
  summary: z.string().max(5000).optional(),
  education: z
    .array(
      z.object({
        degree: z.string().max(150).optional(),
        institution: z.string().max(150).optional(),
        field_of_study: z.string().max(150).optional(),
        start_year: z.union([z.number(), z.string(), z.null()]).optional(),
        end_year: z.union([z.number(), z.string(), z.null()]).optional(),
        cgpa: z.union([z.number(), z.string(), z.null()]).optional(),
      })
    )
    .optional(),
  experience: z
    .array(
      z.object({
        company: z.string().max(150).optional(),
        role: z.string().max(150).optional(),
        start_date: z.string().max(50).optional(),
        end_date: z.string().max(50).optional(),
        description: z.union([z.array(z.string().max(1000)), z.string().max(3000)]).optional(),
      })
    )
    .optional(),
  projects: z
    .array(
      z.object({
        title: z.string().max(150).optional(),
        name: z.string().max(150).optional(),
        description: z.string().max(2000).optional(),
        technologies: z.array(z.string().max(50)).optional(),
        github_url: z.string().max(255).nullable().optional(),
        live_url: z.string().max(255).nullable().optional(),
      })
    )
    .optional(),
  certifications: z
    .array(
      z.union([
        z.string().max(200),
        z.object({
          name: z.string().max(200).optional(),
          organization: z.string().max(200).optional(),
          year: z.union([z.number(), z.string(), z.null()]).optional(),
        }),
      ])
    )
    .optional(),
  technical_skills: z.array(z.string().max(80)).max(100).optional(),
  soft_skills: z.array(z.string().max(80)).max(50).optional(),
  achievements: z.array(z.string().max(500)).max(50).optional(),
  languages: z.array(z.string().max(50)).max(30).optional(),
});

// =====================================
// Job Application Validation Schemas
// =====================================

// Mirrors the ApplicationStatus enum in prisma/schema.prisma. The previous
// list omitted `screening` and `withdrawn`, which normalizeStatus can legally
// return, so those would have been rejected after normalization.
const APPLICATION_STATUSES = [
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
] as const;

// Base object (not a ZodEffects) so `.partial()` still works for the update
// schema. The alias transform is applied separately to each exported schema.
const ApplicationFieldsSchema = z.object({
  company: z.string().trim().min(1, "Company name is required").max(100),
  role: z.string().trim().min(1, "Role title is required").max(100),
  location: z.string().trim().max(100).optional(),
  salary: z.string().trim().max(100).optional(),
  // Alias accepted because the existing frontend sends `salary_range`
  // (src/pages/Jobs.jsx, src/pages/Applications.jsx). Normalized to `salary`
  // by the transform below so nothing downstream needs to know about it.
  salary_range: z.string().trim().max(100).optional(),
  // Normalized through the shared normalizeStatus helper so the frontend's
  // "Wishlist" / "Interviewing" casing and aliases are accepted.
  status: z
    .preprocess(
      (value) => (typeof value === "string" && value.trim() ? normalizeStatus(value) : value),
      z.enum(APPLICATION_STATUSES)
    )
    .optional(),
  // Optional link to a real Job row. Previously absent, which meant Zod
  // stripped it and Application.jobId was always null.
  jobId: z.string().trim().min(1).max(100).optional(),
  matchScore: z.number().min(0).max(100).optional(),
  notes: z.string().max(5000).optional(),
  nextStep: z.string().max(200).optional(),
});

/** Collapses the `salary_range` alias onto `salary`, preferring an explicit `salary`. */
function applySalaryAlias<T extends { salary?: string; salary_range?: string }>(data: T) {
  const { salary_range: salaryRange, ...rest } = data;
  const salary = rest.salary ?? salaryRange;
  return (salary === undefined ? rest : { ...rest, salary }) as Omit<T, "salary_range">;
}

export const ApplicationCreateSchema = ApplicationFieldsSchema.transform((data) => {
  const mapped = applySalaryAlias(data);
  // Preserves the previous `.default("applied")` behaviour.
  return { ...mapped, status: mapped.status ?? ("applied" as const) };
});

export const ApplicationUpdateSchema = ApplicationFieldsSchema.partial().transform(applySalaryAlias);

// =====================================
// Interview Validation Schemas
// =====================================
export const InterviewStartSchema = z.object({
  role: z.string().trim().max(100).optional(),
  type: z.string().trim().max(100).optional(),
  track: z.string().trim().max(100).optional(),
  company: z.string().trim().max(100).optional(),
  difficulty: z.string().trim().max(50).optional(),
});

export const InterviewMessageSchema = z.object({
  message: z.string().trim().min(1, "Message cannot be empty").max(4000, "Message exceeds 4000 characters limit"),
});

// =====================================
// AI Generation Validation Schemas
// =====================================
export const AIRewriteSchema = z.object({
  section: z.string().trim().max(100).optional(),
  content: z.string().trim().min(1, "Content to rewrite is required").max(3000, "Content exceeds character limit"),
  target_role: z.string().trim().max(100).optional(),
  instruction: z.string().trim().max(1000).optional(),
});

export const AICoverLetterSchema = z.object({
  type: z.string().trim().max(50).optional(),
  company: z.string().trim().max(100).optional(),
  role: z.string().trim().max(100).optional(),
  job_description: z.string().max(5000).optional(),
  tone: z.string().trim().max(50).optional(),
  key_points: z.string().max(2000).optional(),
});

// =====================================
// DSA & Code Review Validation Schemas
// =====================================
export const DsaSubmitSchema = z.object({
  problem_id: z.string().trim().max(100).optional(),
  problem_title: z.string().trim().max(150).optional(),
  code: z.string().min(1, "Code is required").max(10000, "Code exceeds character limit"),
  language: z.string().trim().max(50).optional(),
});

export const CodeReviewSchema = z.object({
  code: z.string().min(1, "Code is required").max(15000, "Code exceeds character limit"),
  language: z.string().trim().max(50).optional(),
  task_description: z.string().max(4000).optional(),
});

export const CareerCoachChatSchema = z.object({
  message: z.string().trim().min(1, "Message is required").max(4000, "Message exceeds character limit"),
  history: z.array(z.object({
    sender: z.string(),
    text: z.string(),
  })).optional(),
});

