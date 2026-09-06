import { db } from "../../db/repositories";

const REMOTIVE_URL = "https://remotive.com/api/remote-jobs?category=software-dev";
const STALE_AFTER_MS = 8 * 24 * 60 * 60 * 1000;

type RemotiveJob = {
  id?: number | string;
  title?: string;
  company_name?: string;
  candidate_required_location?: string;
  publication_date?: string;
  job_type?: string;
  description?: string;
  tags?: string[];
  url?: string;
};

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function normalizeRemotiveJob(job: RemotiveJob) {
  if (!job.id || !job.title || !job.company_name || !job.url) return null;
  const description = stripHtml(job.description || "");
  if (!description) return null;
  const skills = Array.isArray(job.tags) ? job.tags.filter((tag) => typeof tag === "string").slice(0, 25) : [];
  return {
    externalId: `remotive:${job.id}`,
    title: job.title.trim(),
    companyName: job.company_name.trim(),
    location: job.candidate_required_location?.trim() || "Remote",
    type: job.job_type?.trim() || "Full-time",
    workplace: "Remote",
    description,
    requirements: skills,
    skillsRequired: skills,
    benefits: [],
    sourceUrl: job.url,
    expiresAt: null,
  };
}

export async function syncRemotiveJobs(fetchImpl: typeof fetch = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetchImpl(REMOTIVE_URL, {
      headers: { Accept: "application/json", "User-Agent": "CareerForgeAI/1.0 job-sync" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Remotive responded with HTTP ${response.status}.`);
    const payload = await response.json() as { jobs?: RemotiveJob[] };
    const jobs = Array.isArray(payload.jobs) ? payload.jobs.map(normalizeRemotiveJob).filter(Boolean) : [];
    for (const job of jobs) await db.jobs.upsertLive(job);
    const expired = await db.jobs.expireStaleLive("remotive:", new Date(Date.now() - STALE_AFTER_MS));
    return { provider: "Remotive", imported: jobs.length, expired: expired.count };
  } finally {
    clearTimeout(timeout);
  }
}
