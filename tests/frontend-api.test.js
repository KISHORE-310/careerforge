import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCurrentUser, getSettings, reviewCode, updateSettings } from "../src/services/api.js";

const storage = new Map();
globalThis.localStorage = { getItem: (key) => storage.get(key) || null, setItem: (key, value) => storage.set(key, String(value)), removeItem: (key) => storage.delete(key) };

function jsonResponse(body, status = 200) {
  return { ok: status >= 200 && status < 300, status, headers: { get: () => "application/json" }, text: async () => JSON.stringify(body) };
}

describe("frontend API contracts", () => {
  beforeEach(() => {
    storage.clear();
    globalThis.window = globalThis;
    globalThis.fetch = vi.fn();
  });

  it("clears a stale route-protection token after a failed session check", async () => {
    storage.set("token", "expired"); storage.set("user", "candidate");
    fetch.mockResolvedValueOnce(jsonResponse({ success: false }, 401)).mockResolvedValueOnce(jsonResponse({ success: false }, 401));
    await getCurrentUser();
    expect(storage.get("token")).toBeUndefined();
  });

  it("returns API validation failures for Settings instead of pretending to save", async () => {
    fetch.mockResolvedValue(jsonResponse({ success: false, message: "Invalid preference value" }, 400));
    await expect(updateSettings({ job_match_alerts: true })).resolves.toMatchObject({ success: false, message: "Invalid preference value" });
  });

  it("uses authenticated settings and code-review endpoints", async () => {
    storage.set("token", "session-token");
    fetch.mockResolvedValueOnce(jsonResponse({ success: true, settings: {} })).mockResolvedValueOnce(jsonResponse({ success: true, score: 80 }));
    await getSettings(); await reviewCode({ code: "const a = 1;", language: "JavaScript" });
    expect(fetch.mock.calls[0][0]).toBe("/api/settings");
    expect(fetch.mock.calls[1][0]).toBe("/api/coding/review");
    expect(fetch.mock.calls[1][1].headers.Authorization).toBe("Bearer session-token");
  });
});
