import { describe, expect, it } from "vitest";
import { normalizeJoobleJob, normalizeRemotiveJob } from "../src/server/services/job-ingestion";

describe("Remotive job normalization", () => {
  it("preserves stable attribution and removes HTML from descriptions", () => {
    const job = normalizeRemotiveJob({
      id: 42, title: "Platform Engineer", company_name: "Acme", candidate_required_location: "India", job_type: "Full-time",
      description: "<p>Build <strong>reliable</strong> systems.</p>", tags: ["TypeScript", "PostgreSQL"], url: "https://remotive.com/job/42",
    });
    expect(job).toMatchObject({ externalId: "remotive:42", companyName: "Acme", sourceUrl: "https://remotive.com/job/42" });
    expect(job?.description).toBe("Build reliable systems.");
  });

  it("rejects incomplete provider records instead of fabricating listing data", () => {
    expect(normalizeRemotiveJob({ id: 1, title: "Engineer" })).toBeNull();
  });
});

describe("Jooble job normalization", () => {
  it("keeps India attribution and derives skills only from provider text", () => {
    const job = normalizeJoobleJob({
      id: "abc", title: "Backend Engineer", company: "Acme India", location: "Bengaluru, India",
      snippet: "Build APIs with Node.js, PostgreSQL, Docker, and React.", salary: "₹12,00,000", type: "Full-time", link: "https://jooble.org/jdp/abc",
    });
    expect(job).toMatchObject({ externalId: "jooble:abc", companyName: "Acme India", location: "Bengaluru, India", sourceUrl: "https://jooble.org/jdp/abc" });
    expect(job?.skillsRequired).toEqual(expect.arrayContaining(["React", "Node.js", "PostgreSQL", "Docker"]));
  });

  it("rejects incomplete provider records", () => {
    expect(normalizeJoobleJob({ id: "abc", title: "Engineer" })).toBeNull();
  });
});
