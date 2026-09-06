import { describe, expect, it } from "vitest";
import { normalizeRemotiveJob } from "../src/server/services/job-ingestion";

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
