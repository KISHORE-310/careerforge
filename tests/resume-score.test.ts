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
      summary: "Software engineer with a history of delivering reliable distributed services, measurable product outcomes, and maintainable developer platforms for cross-functional teams.",
      education: [{ degree: "BSc Computer Science" }],
      experience: [{ company: "Analytical Engines", role: "Engineer" }, { company: "Compute Co", role: "Senior Engineer" }],
      projects: [{ title: "Compiler" }, { title: "Data platform" }],
      technical_skills: ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker", "AWS", "Git", "SQL", "Redis", "Kafka"],
      certifications: ["Cloud certification"],
    });
    expect(result.resume_score).toBeGreaterThanOrEqual(75);
    expect(result.grade).toMatch(/Good|Excellent/);
  });
});
