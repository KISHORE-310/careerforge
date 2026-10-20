import test from "node:test";
import assert from "node:assert/strict";

import { isAllowedOrigin, sanitizeAiInput, validatePdfFile } from "../src/server/security.ts";
import { scoreJobMatch } from "../src/server/services/matching.ts";
import { calculateResumeScore } from "../src/server/routes/resume.routes.ts";
import {
  CodeReviewSchema,
  DsaSubmitSchema,
  ApplicationCreateSchema,
  SignupSchema,
} from "../src/server/schemas.ts";

test("Security: isAllowedOrigin whitelist policy", () => {
  // Empty or same-origin requests should always pass
  assert.equal(isAllowedOrigin(undefined, "production", null), true);
  assert.equal(isAllowedOrigin(null, "production", null), true);

  // Localhost and known domains allowed in any environment
  assert.equal(isAllowedOrigin("http://localhost:3000", "production", null), true);
  assert.equal(isAllowedOrigin("https://preview.run.app", "production", null), true);

  // Configured frontend URL allowed
  assert.equal(isAllowedOrigin("https://careerforge.ai", "production", "https://careerforge.ai"), true);

  // Arbitrary third party origin rejected in production
  assert.equal(isAllowedOrigin("https://malicious-site.com", "production", "https://careerforge.ai"), false);

  // Permissive in non-production
  assert.equal(isAllowedOrigin("https://any-dev-preview.org", "development", null), true);
});

test("Security: sanitizeAiInput control characters removal and truncation", () => {
  const dirty = "Hello\u0000World\u001F Test!";
  const clean = sanitizeAiInput(dirty, 50);
  assert.equal(clean, "HelloWorld Test!");

  const longText = "a".repeat(100);
  const truncated = sanitizeAiInput(longText, 10);
  assert.equal(truncated.length, 10);
});

test("Security: validatePdfFile validation", () => {
  assert.equal(validatePdfFile(undefined).isValid, false);

  const nonPdf = {
    originalname: "document.txt",
    mimetype: "text/plain",
    size: 100,
    buffer: Buffer.from("plain text content"),
  };
  assert.equal(validatePdfFile(nonPdf).isValid, false);

  const fakePdf = {
    originalname: "resume.pdf",
    mimetype: "application/pdf",
    size: 100,
    buffer: Buffer.from("not a real pdf header"),
  };
  assert.equal(validatePdfFile(fakePdf).isValid, false);

  const validPdf = {
    originalname: "resume.pdf",
    mimetype: "application/pdf",
    size: 1000,
    buffer: Buffer.from("%PDF-1.4 real pdf header content"),
  };
  assert.equal(validatePdfFile(validPdf).isValid, true);
});

test("Matching Engine: 7-factor job scoring calculation", () => {
  const candidate = {
    skills: ["TypeScript", "React", "Node.js", "PostgreSQL"],
    experienceYears: 5,
    seniority: "Senior",
    location: "San Francisco, CA",
    targetSalary: 180000,
    resumeText: "Senior full stack engineer experienced with TypeScript, React, and cloud architectures.",
    education: ["B.S. in Computer Science"],
  };

  const job = {
    title: "Senior Full Stack Engineer",
    company: "Stripe",
    skillsRequired: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],
    salary: "$170,000 - $210,000",
    location: "San Francisco, CA",
    workplace: "Hybrid",
    experience: "5+ years",
    description: "Build payment APIs with TypeScript and distributed systems.",
  };

  const result = scoreJobMatch(candidate, job);
  assert.ok(result.overall >= 70, `Expected score >= 70, got ${result.overall}`);
  assert.equal(result.matched_skills.includes("TypeScript"), true);
  assert.equal(result.missing_skills.includes("AWS"), true);
  assert.ok(result.explanation.length > 0);
});

test("Resume Evaluator: calculateResumeScore structured output", () => {
  const emptyEvaluation = calculateResumeScore(null);
  assert.equal(emptyEvaluation.resume_score, 0);
  assert.equal(emptyEvaluation.grade, "Incomplete");

  const fullResume = {
    personal_info: {
      full_name: "Alex Morgan",
      email: "alex@example.com",
      phone: "555-0100",
      linkedin: "https://linkedin.com/in/alex",
      github: "https://github.com/alex",
    },
    summary: "Senior software engineer with 6+ years specializing in distributed systems, high throughput event streaming, cloud infrastructure, and highly scalable microservices architecture.",
    education: [
      { degree: "B.S. Computer Science", institution: "UC Berkeley" },
      { degree: "M.S. Software Engineering", institution: "Stanford" },
    ],
    experience: [
      { company: "Tech Corp", role: "Senior Software Engineer", bullets: ["Led payments platform team"] },
      { company: "Cloud Inc", role: "Software Engineer", bullets: ["Built real-time messaging pipeline"] },
    ],
    projects: [
      { title: "Distributed Cache", technologies: ["Go", "Redis"] },
      { title: "Search Engine", technologies: ["TypeScript", "Elasticsearch"] },
    ],
    technical_skills: ["Go", "TypeScript", "PostgreSQL", "Docker", "Kubernetes", "Redis", "Kafka", "React", "Node.js", "AWS"],
    certifications: [{ name: "AWS Solutions Architect" }],
  };

  const evaluation = calculateResumeScore(fullResume);
  assert.ok(evaluation.resume_score >= 80, `Expected score >= 80, got ${evaluation.resume_score}`);
  assert.ok(evaluation.strengths.length > 0);
  assert.ok(evaluation.breakdown.personal_information > 0);
});

test("Validation Schemas: CodeReviewSchema requires non-empty code", () => {
  assert.equal(CodeReviewSchema.safeParse({ code: "" }).success, false);
  assert.equal(CodeReviewSchema.safeParse({ code: "function test() {}" }).success, true);
});

test("Validation Schemas: SignupSchema validates email and minimum password length", () => {
  assert.equal(SignupSchema.safeParse({ email: "invalid", password: "short" }).success, false);
  assert.equal(SignupSchema.safeParse({ email: "valid@example.com", password: "SecurePassword123!" }).success, true);
});
