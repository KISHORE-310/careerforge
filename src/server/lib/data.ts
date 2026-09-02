export function asArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => (typeof item === "string" ? item : String(item?.name || item || ""))).filter(Boolean);
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      const parsed = JSON.parse(trimmed);
      return asArray(parsed);
    } catch {
      return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  if (value && typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map((v) => String(v || ""))
      .filter(Boolean);
  }
  return [];
}

export function parseSalaryRange(text?: string | null): { min: number | null; max: number | null } {
  if (!text) return { min: null, max: null };
  const nums = [...String(text).matchAll(/\$?\s*(\d+(?:\.\d+)?)\s*(k|m)?/gi)].map((m) => {
    let n = Number(m[1]);
    const suffix = (m[2] || "").toLowerCase();
    if (suffix === "k") n *= 1000;
    if (suffix === "m") n *= 1_000_000;
    if (n > 0 && n < 1000) n *= 1000;
    return n;
  });
  if (nums.length === 0) return { min: null, max: null };
  return { min: Math.min(...nums), max: Math.max(...nums) };
}

export function formatUsd(value?: number | null): string | null {
  if (value == null || Number.isNaN(Number(value))) return null;
  return `$${Math.round(Number(value)).toLocaleString()}`;
}

export function normalizeStatus(status?: string | null): string {
  const raw = String(status || "applied").trim().toLowerCase();
  if (raw === "wishlist" || raw === "saved") return "wishlist";
  if (raw === "interviewing" || raw === "interview") return "interview";
  if (["applied", "screening", "offer", "rejected", "withdrawn"].includes(raw)) return raw;
  return "applied";
}

export function yearsFromExperience(experience: unknown): number {
  if (typeof experience === "number" && Number.isFinite(experience)) return experience;
  const text = String(experience || "");
  const match = text.match(/(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)/i);
  if (match) return Number(match[1]);
  const first = text.match(/(\d+)/);
  return first ? Number(first[1]) : 0;
}

export function seniorityFromText(text?: string | null): "intern" | "junior" | "mid" | "senior" | "staff" | "principal" {
  const hay = String(text || "").toLowerCase();
  if (/\bintern\b|internship/.test(hay)) return "intern";
  if (/\bprincipal\b|\bfellow\b/.test(hay)) return "principal";
  if (/\bstaff\b|\barchitect\b/.test(hay)) return "staff";
  if (/\bsenior\b|\bsr\.?\b|lead /.test(hay)) return "senior";
  if (/\bjunior\b|\bjr\.?\b|entry/.test(hay)) return "junior";
  return "mid";
}
