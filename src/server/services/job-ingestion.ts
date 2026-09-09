import { db } from "../../db/repositories";
import { config } from "../config";

const REMOTIVE_URL = "https://remotive.com/api/remote-jobs?category=software-dev";
const STALE_AFTER_MS = 8 * 24 * 60 * 60 * 1000;
const JOOBLE_URL = "https://jooble.org/api";

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

type JoobleJob = {
  id?: string | number;
  title?: string;
  company?: string;
  location?: string;
  snippet?: string;
  salary?: string;
  type?: string;
  link?: string;
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

function normalizeJoobleJob(job: JoobleJob) {
  if (!job.id || !job.title || !job.company || !job.link) return null;
  return {
    externalId: `jooble:${job.id}`,
    title: job.title.trim(),
    companyName: job.company.trim(),
    location: job.location?.trim() || "India",
    type: job.type?.trim() || "Not specified",
    workplace: "Not specified",
    description: stripHtml(job.snippet || ""),
    requirements: [],
    skillsRequired: [],
    benefits: [],
    salary: job.salary?.trim() || "",
    sourceUrl: job.link,
    expiresAt: null,
  };
}

/** Imports current India tech listings using the configured Jooble publisher account. */
export async function syncJoobleIndiaJobs(fetchImpl: typeof fetch = fetch) {
  if (!config.JOOBLE_API_KEY) {
    throw new Error("Jooble is not configured. Set JOOBLE_API_KEY in .env.");
  }
  const url = `${JOOBLE_URL}/${encodeURIComponent(config.JOOBLE_API_KEY)}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetchImpl(url, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "CareerForgeAI/1.0 job-sync" },
      body: JSON.stringify({ keywords: "software engineer developer", location: "India", page: "1", ResultOnPage: 50 }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Jooble responded with HTTP ${response.status}.`);
    const payload = await response.json() as { jobs?: JoobleJob[] };
    const jobs = Array.isArray(payload.jobs) ? payload.jobs.map(normalizeJoobleJob).filter(Boolean) : [];
    for (const job of jobs) await db.jobs.upsertLive(job);
    const expired = await db.jobs.expireStaleLive("jooble:", new Date(Date.now() - STALE_AFTER_MS));
    return { provider: "Jooble India", imported: jobs.length, expired: expired.count };
  } finally {
    clearTimeout(timeout);
  }
}
