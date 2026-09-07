import { db } from "../../db/repositories";
import { config } from "../config";

const REMOTIVE_URL = "https://remotive.com/api/remote-jobs?category=software-dev";
const STALE_AFTER_MS = 8 * 24 * 60 * 60 * 1000;
const ADZUNA_INDIA_URL = "https://api.adzuna.com/v1/api/jobs/in/search/1";

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

type AdzunaJob = {
  id?: string | number;
  title?: string;
  company?: { display_name?: string };
  location?: { display_name?: string };
  description?: string;
  redirect_url?: string;
  salary_min?: number;
  salary_max?: number;
  contract_type?: string;
  contract_time?: string;
  created?: string;
  category?: { label?: string };
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

function formatInrSalary(min?: number, max?: number) {
  if (!Number.isFinite(min) && !Number.isFinite(max)) return "";
  const format = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;
  if (Number.isFinite(min) && Number.isFinite(max) && min !== max) return `${format(min!)} – ${format(max!)}`;
  return format((min ?? max)!);
}

function normalizeAdzunaJob(job: AdzunaJob) {
  if (!job.id || !job.title || !job.company?.display_name || !job.redirect_url) return null;
  const description = stripHtml(job.description || "");
  if (!description) return null;
  const category = job.category?.label?.trim();
  return {
    externalId: `adzuna:${job.id}`,
    title: job.title.trim(),
    companyName: job.company.display_name.trim(),
    location: job.location?.display_name?.trim() || "India",
    type: job.contract_time?.trim() || "Full-time",
    workplace: job.contract_type?.trim() || "Not specified",
    description,
    requirements: category ? [category] : [],
    skillsRequired: category ? [category] : [],
    benefits: [],
    salary: formatInrSalary(job.salary_min, job.salary_max),
    sourceUrl: job.redirect_url,
    expiresAt: null,
  };
}

/** Imports current India listings using the configured Adzuna publisher account. */
export async function syncAdzunaIndiaJobs(fetchImpl: typeof fetch = fetch) {
  if (!config.ADZUNA_APP_ID || !config.ADZUNA_APP_KEY) {
    throw new Error("Adzuna is not configured. Set ADZUNA_APP_ID and ADZUNA_APP_KEY in .env.");
  }
  const url = new URL(ADZUNA_INDIA_URL);
  url.searchParams.set("app_id", config.ADZUNA_APP_ID);
  url.searchParams.set("app_key", config.ADZUNA_APP_KEY);
  url.searchParams.set("results_per_page", "50");
  url.searchParams.set("category", "it-jobs");
  url.searchParams.set("content-type", "application/json");
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetchImpl(url, { headers: { Accept: "application/json", "User-Agent": "CareerForgeAI/1.0 job-sync" }, signal: controller.signal });
    if (!response.ok) throw new Error(`Adzuna responded with HTTP ${response.status}.`);
    const payload = await response.json() as { results?: AdzunaJob[] };
    const jobs = Array.isArray(payload.results) ? payload.results.map(normalizeAdzunaJob).filter(Boolean) : [];
    for (const job of jobs) await db.jobs.upsertLive(job);
    const expired = await db.jobs.expireStaleLive("adzuna:", new Date(Date.now() - STALE_AFTER_MS));
    return { provider: "Adzuna India", imported: jobs.length, expired: expired.count };
  } finally {
    clearTimeout(timeout);
  }
}
