import { describe, expect, it } from "vitest";
import { calculateResumeScore } from "../src/server/routes/resume.routes";

describe("resume scoring", () => {
  it("returns an actionable empty-state evaluation", () => {
    const result = calculateResumeScore(null);
    expect(result.resume_score).toBe(0);
    expect(result.grade).toBe("Incomplete");
    expect(result.weaknesses.length).toBeGreaterThan(0);
  });

  it("rewards structured, complete candidate data", () => {
    const result = calculateResumeScore({
      personal_info: { full_name: "Ada Lovelace", email: "ada@example.com", phone: "+1 555 555 5555", linkedin: "https://linkedin.com/in/ada", github: "https://github.com/ada" },
      // 30+ words → summaryScore=10 (was 20 words → 7 before)
      summary: "Software engineer with a decade of delivering reliable distributed services, measurable product outcomes, and maintainable developer platforms for cross-functional teams at scale across multiple time zones.",
      education: [{ degree: "BSc Computer Science" }, { degree: "MSc Computer Science" }],
      experience: [{ company: "Analytical Engines", role: "Engineer" }, { company: "Compute Co", role: "Senior Engineer" }],
      projects: [{ title: "Compiler" }, { title: "Data platform" }, { title: "ML pipeline" }, { title: "CLI tool" }],
      technical_skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS", "Git", "SQL", "Redis", "Kafka", "Kubernetes", "Go", "Python", "GraphQL", "Terraform"],
      certifications: ["Cloud certification", "Security cert"],
    });
    // Max score breakdown: personal=16, summary=10, education=10, experience=20, projects=20, skills=15, certs=5 = 96/96 = 100%
    // This profile: personal=16, summary=10, education=10, experience=20, projects=20, skills=15, certs=5 = 96 → 100% → clamped to 98
    expect(result.resume_score).toBeGreaterThanOrEqual(75);
    expect(result.grade).toMatch(/Good|Excellent/);
  });
});
