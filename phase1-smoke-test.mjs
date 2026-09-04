#!/usr/bin/env node
/**
 * CareerForge — Phase 1 + Phase 2 Step 1 runtime verification harness.
 *
 * Read-only with respect to your source tree. It exercises the running backend
 * over HTTP against your local PostgreSQL database and prints a pass/fail
 * report for every endpoint listed in the Phase 1 verification scope, plus
 * the Phase 2 Step 1 application-schema-alignment behaviors (status casing
 * normalization, the salary_range alias, and jobId linking/validation).
 *
 * Usage:
 *   node phase1-smoke-test.mjs
 *   BASE_URL=http://localhost:3000 node phase1-smoke-test.mjs
 *
 * It creates ONE test user with a timestamped email address, plus a small
 * number of rows owned by that user (application, skill, DSA progress,
 * learning progress, interview, roadmap). Cleanup SQL is printed at the end.
 *
 * Requires Node 18+ (uses global fetch). No dependencies.
 */

const BASE = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");
const stamp = Date.now();
const EMAIL = `phase1.smoke.${stamp}@careerforge.test`;
const PASSWORD = "SmokeTest123!";

let token = null;
const results = [];
const ctx = {};

const C = {
  reset: "\x1b[0m", red: "\x1b[31m", green: "\x1b[32m",
  yellow: "\x1b[33m", dim: "\x1b[2m", bold: "\x1b[1m",
};

async function call(name, method, path, { body, auth = true, expect = [200, 201] } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  let res, text, json = null, err = null;
  const started = Date.now();
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    text = await res.text();
    try { json = JSON.parse(text); } catch { /* non-JSON body */ }
  } catch (e) {
    err = e.message;
  }
  const ms = Date.now() - started;

  const status = err ? "ERR" : res.status;
  const ok = !err && expect.includes(res.status);
  results.push({
    name, method, path, status, ok, ms,
    detail: err
      ? `network error: ${err}`
      : ok
        ? ""
        : (json?.message || json?.error || (text || "").slice(0, 300).replace(/\s+/g, " ")),
  });
  return { ok, status, json, text };
}

function section(t) {
  console.log(`\n${C.bold}── ${t} ${"─".repeat(Math.max(0, 58 - t.length))}${C.reset}`);
}

async function run() {
  console.log(`${C.bold}CareerForge Phase 1 runtime verification${C.reset}`);
  console.log(`${C.dim}target: ${BASE}${C.reset}`);
  console.log(`${C.dim}test user: ${EMAIL}${C.reset}`);

  // ---------- health ----------
  section("Health");
  {
    const r = await call("health", "GET", "/api/health", { auth: false });
    if (r.json) {
      console.log(`  database: ${r.json.database}   ai_engine: ${r.json.ai_engine}   env: ${r.json.environment}`);
      ctx.aiEnabled = r.json.ai_engine && r.json.ai_engine !== "fallback_mode";
      if (r.json.database !== "connected") {
        console.log(`${C.red}  database is not connected — remaining tests will fail.${C.reset}`);
      }
    }
  }

  // ---------- auth ----------
  section("Authentication");
  {
    const r = await call("signup", "POST", "/api/auth/signup", {
      auth: false,
      body: { email: EMAIL, password: PASSWORD, fullName: "Phase One Smoke" },
    });
    if (r.json?.access_token) token = r.json.access_token;
    if (r.json?.user?.id) ctx.userId = r.json.user.id;

    // signup should not be repeatable with the same email
    await call("signup duplicate rejected", "POST", "/api/auth/signup", {
      auth: false, body: { email: EMAIL, password: PASSWORD, fullName: "Dup" }, expect: [409, 400],
    });

    await call("login wrong password rejected", "POST", "/api/auth/login", {
      auth: false, body: { email: EMAIL, password: "WrongPassword123!" }, expect: [401],
    });

    const l = await call("login", "POST", "/api/auth/login", {
      auth: false, body: { email: EMAIL, password: PASSWORD },
    });
    if (l.json?.access_token) token = l.json.access_token;

    await call("auth/me (no token) rejected", "GET", "/api/auth/me", { auth: false, expect: [401] });
    const me = await call("auth/me", "GET", "/api/auth/me");
    if (me.json?.user?.id) ctx.userId = me.json.user.id;
  }

  if (!token) {
    console.log(`\n${C.red}No auth token obtained — running public endpoints only.${C.reset}`);
    section("Public endpoints (unauthenticated fallback)");
    await call("jobs list", "GET", "/api/jobs", { auth: false });
    await call("companies", "GET", "/api/companies", { auth: false });
    await call("market", "GET", "/api/market", { auth: false });
    await call("dsa problems", "GET", "/api/dsa/problems", { auth: false });
    await call("learning list", "GET", "/api/learning", { auth: false });
    console.log(
      `\n${C.yellow}Authenticated coverage was skipped. Fix signup/login first — the\n` +
      `signup failure above is the root cause to investigate.${C.reset}`
    );
    return report();
  }

  // ---------- profile ----------
  section("Profile");
  await call("profile get", "GET", "/api/profile");
  await call("profile update", "PUT", "/api/profile", {
    body: {
      bio: "Phase 1 smoke test bio",
      location: "Hyderabad, IN",
      targetRole: "Backend Engineer",
      experienceLevel: "Mid",
    },
  });
  await call("profile get after update", "GET", "/api/profile");

  // ---------- jobs ----------
  section("Jobs");
  {
    const r = await call("jobs list", "GET", "/api/jobs");
    const first = r.json?.jobs?.[0];
    if (first?.id) ctx.jobId = first.id;
    if (first) {
      const shape = [];
      if (first.company === undefined || first.company === null) shape.push("company missing");
      if (!Array.isArray(first.skills_required)) shape.push("skills_required not an array");
      if (!Array.isArray(first.requirements)) shape.push("requirements not an array");
      if (shape.length) {
        results.push({
          name: "jobs response shape",
          method: "GET",
          path: "/api/jobs",
          status: "SHAPE",
          ok: false,
          ms: 0,
          detail: shape.join("; ")
        });
      } else {
        results.push({
          name: "jobs response shape",
          method: "GET",
          path: "/api/jobs",
          status: "ok",
          ok: true,
          ms: 0,
          detail: ""
        });
      }
    }
    await call("jobs search filter", "GET", "/api/jobs?search=engineer");
    if (ctx.jobId) await call("job detail", "GET", `/api/jobs/${ctx.jobId}`);
    await call("companies", "GET", "/api/companies", { auth: false });
    await call("market", "GET", "/api/market", { auth: false });
  }

  // ---------- skills ----------
  section("Skills");
  await call("skills list", "GET", "/api/skills");
  await call("skills upsert", "PUT", "/api/skills", {
    body: { skills: [{ name: "TypeScript", proficiency: 80, category: "Languages" }] },
  });
  await call("skills list after upsert", "GET", "/api/skills");

  // ---------- applications ----------
  section("Applications");
  {
    const c = await call("application create", "POST", "/api/applications", {
      body: {
        company: "Smoke Test Corp",
        role: "Backend Engineer",
        location: "Remote",
        salary: "$100k",
        status: "applied",
        notes: "created by phase 1 smoke test",
        nextStep: "Follow up",
      },
      expect: [200, 201],
    });
    ctx.appId = c.json?.application?.id || c.json?.id;
    await call("applications list", "GET", "/api/applications");
    if (ctx.appId) {
      await call("application update (status)", "PUT", `/api/applications/${ctx.appId}`, {
        body: { status: "interview" },
      });
      await call("application delete", "DELETE", `/api/applications/${ctx.appId}`);
    } else {
      results.push({
        name: "application update/delete",
        method: "-",
        path: "-",
        status: "SKIP",
        ok: false,
        ms: 0,
        detail: "no application id returned from create"
      });
    }
  }

  // ---------- applications: Phase 2 Step 1 (schema alignment) ----------
  section("Applications — Phase 2 Step 1");
  {
    const INVALID_JOB_ID = "phase2-smoke-invalid-job-id-does-not-exist";
    const createdIds = [];

    async function fetchApplication(id) {
      const r = await call(`applications list (lookup ${id})`, "GET", "/api/applications");
      const app = r.json?.applications?.find((a) => a.id === id);
      return { r, app };
    }

    // 2. status "Wishlist" should be normalized to "wishlist".
    {
      const r = await call("application create (status 'Wishlist')", "POST", "/api/applications", {
        body: {
          company: "Phase2 Wishlist Co",
          role: "Backend Engineer",
          status: "Wishlist",
        },
        expect: [200, 201],
      });
      const id = r.json?.application?.id;
      if (id) createdIds.push(id);
      const status = r.json?.application?.status;
      results.push({
        name: "status 'Wishlist' normalized to 'wishlist'",
        method: "POST",
        path: "/api/applications",
        status: status ?? "MISSING",
        ok: status === "wishlist",
        ms: 0,
        detail: status === "wishlist" ? "" : `expected status "wishlist", got ${JSON.stringify(status)}`,
      });
    }

    // 3. salary_range alias should be persisted as `salary`.
    {
      const SALARY_RANGE = "$120,000 - $150,000";
      const r = await call("application create (salary_range alias)", "POST", "/api/applications", {
        body: {
          company: "Phase2 Salary Co",
          role: "Backend Engineer",
          salary_range: SALARY_RANGE,
        },
        expect: [200, 201],
      });
      const id = r.json?.application?.id;
      if (id) createdIds.push(id);
      const salary = r.json?.application?.salary;
      results.push({
        name: "salary_range persisted as salary",
        method: "POST",
        path: "/api/applications",
        status: salary ?? "MISSING",
        ok: salary === SALARY_RANGE,
        ms: 0,
        detail: salary === SALARY_RANGE ? "" : `expected salary ${JSON.stringify(SALARY_RANGE)}, got ${JSON.stringify(salary)}`,
      });
    }

    // 4. creation with a valid jobId should return/persist job_id.
    if (ctx.jobId) {
      const r = await call("application create (valid jobId)", "POST", "/api/applications", {
        body: {
          company: "Phase2 Job Link Co",
          role: "Backend Engineer",
          jobId: ctx.jobId,
        },
        expect: [200, 201],
      });
      const id = r.json?.application?.id;
      if (id) createdIds.push(id);
      const jobId = r.json?.application?.job_id;
      ctx.jobLinkedAppId = id;
      results.push({
        name: "application create with valid jobId returns job_id",
        method: "POST",
        path: "/api/applications",
        status: jobId ?? "MISSING",
        ok: jobId === ctx.jobId,
        ms: 0,
        detail: jobId === ctx.jobId ? "" : `expected job_id ${JSON.stringify(ctx.jobId)}, got ${JSON.stringify(jobId)}`,
      });
    } else {
      results.push({
        name: "application create with valid jobId returns job_id",
        method: "-",
        path: "-",
        status: "SKIP",
        ok: false,
        ms: 0,
        detail: "no job id available from jobs list — cannot exercise valid jobId linking",
      });
    }

    // 5. creation with an invalid jobId should be rejected with HTTP 400.
    await call("application create (invalid jobId) rejected", "POST", "/api/applications", {
      body: {
        company: "Phase2 Bad Job Co",
        role: "Backend Engineer",
        jobId: INVALID_JOB_ID,
      },
      expect: [400],
    });

    // 6/7/8. update with valid/invalid jobId, verified against a subsequent read.
    if (ctx.jobId) {
      const base = await call("application create (base for job update tests)", "POST", "/api/applications", {
        body: {
          company: "Phase2 Job Update Co",
          role: "Backend Engineer",
        },
        expect: [200, 201],
      });
      const baseId = base.json?.application?.id;
      if (baseId) {
        createdIds.push(baseId);

        // 6. update with a valid jobId must survive a subsequent read.
        await call("application update (valid jobId)", "PUT", `/api/applications/${baseId}`, {
          body: { jobId: ctx.jobId },
        });
        const afterValid = await fetchApplication(baseId);
        const validPersisted = afterValid.app?.job_id === ctx.jobId;
        results.push({
          name: "valid jobId update persists across subsequent read",
          method: "GET",
          path: "/api/applications",
          status: afterValid.app?.job_id ?? "MISSING",
          ok: validPersisted,
          ms: 0,
          detail: validPersisted
            ? ""
            : `expected job_id ${JSON.stringify(ctx.jobId)} on read-back, got ${JSON.stringify(afterValid.app?.job_id)}`,
        });

        // 7. update with an invalid jobId should be rejected with HTTP 400.
        await call("application update (invalid jobId) rejected", "PUT", `/api/applications/${baseId}`, {
          body: { jobId: INVALID_JOB_ID },
          expect: [400],
        });

        // 8. the rejected invalid-jobId update must not overwrite the
        // previously-valid jobId.
        const afterInvalid = await fetchApplication(baseId);
        const notOverwritten = afterInvalid.app?.job_id === ctx.jobId;
        results.push({
          name: "rejected invalid jobId update does not overwrite valid jobId",
          method: "GET",
          path: "/api/applications",
          status: afterInvalid.app?.job_id ?? "MISSING",
          ok: notOverwritten,
          ms: 0,
          detail: notOverwritten
            ? ""
            : `expected job_id to remain ${JSON.stringify(ctx.jobId)}, got ${JSON.stringify(afterInvalid.app?.job_id)}`,
        });
      } else {
        results.push({
          name: "application update jobId tests",
          method: "-",
          path: "-",
          status: "SKIP",
          ok: false,
          ms: 0,
          detail: "no application id returned from base create for job update tests",
        });
      }
    } else {
      results.push({
        name: "application update jobId tests",
        method: "-",
        path: "-",
        status: "SKIP",
        ok: false,
        ms: 0,
        detail: "no job id available from jobs list — cannot exercise jobId update tests",
      });
    }

    // Cleanup the Phase 2 Step 1 fixtures created above (the base test-user
    // deletion at the end would cascade to these anyway, but tidy up now so
    // a partial/aborted run doesn't leave orphaned rows for this user).
    for (const id of createdIds) {
      await call(`application cleanup delete (${id})`, "DELETE", `/api/applications/${id}`);
    }
  }

  // ---------- DSA ----------
  section("DSA");
  await call("dsa problems", "GET", "/api/dsa/problems", { auth: false });
  await call("dsa progress update", "PUT", "/api/dsa/progress/arrays/two-sum", {
    body: { status: "solved", notes: "smoke test" },
  });
  await call("dsa progress get", "GET", "/api/dsa/progress");
  await call("dsa progress idempotent re-solve", "PUT", "/api/dsa/progress/arrays/two-sum", {
    body: { status: "solved", notes: "smoke test again" },
  });

  // ---------- learning ----------
  section("Learning");
  {
    const r = await call("learning list", "GET", "/api/learning");
    const first = r.json?.resources?.[0];
    if (first?.id) ctx.resourceId = first.id;
    if (ctx.resourceId) {
      await call("learning progress update", "PUT", `/api/learning/${ctx.resourceId}/progress`, {
        body: { progress: 45 },
      });
      await call("learning list after progress", "GET", "/api/learning");
      await call("learning progress complete", "PUT", `/api/learning/${ctx.resourceId}/progress`, {
        body: { progress: 100 },
      });
    } else {
      results.push({
        name: "learning progress",
        method: "-",
        path: "-",
        status: "SKIP",
        ok: false,
        ms: 0,
        detail: "no learning resource found — did the seed run?"
      });
    }
  }

  // ---------- roadmap ----------
  section("Roadmap");
  {
    await call("roadmap get (may be empty)", "GET", "/api/roadmap", { expect: [200, 404] });

    // GET /api/roadmap auto-generates and persists a roadmap when none exists.
    const gen = await call("roadmap auto-generated on first GET", "GET", "/api/roadmap");

    const r = await call("roadmap get after generate", "GET", "/api/roadmap");
    const ms = r.json?.roadmap?.milestones;
    if (Array.isArray(ms) && ms.length) {
      ctx.milestoneId = ms[0].id;
      const tasksOk = Array.isArray(ms[0].tasks);
      results.push({
        name: "roadmap milestone tasks persisted",
        method: "GET",
        path: "/api/roadmap",
        status: tasksOk ? "ok" : "SHAPE",
        ok: tasksOk,
        ms: 0,
        detail: tasksOk ? "" : "milestone.tasks is not an array (Json column not persisted)",
      });

      await call(
        "milestone status update",
        "PUT",
        `/api/roadmap/milestones/${ctx.milestoneId}`,
        {
          body: { status: "completed" },
        }
      );

      const after = await call("roadmap progress recomputed", "GET", "/api/roadmap");
      const prog = after.json?.roadmap?.progress;
      results.push({
        name: "roadmap progress derived from milestones",
        method: "GET",
        path: "/api/roadmap",
        status: typeof prog === "number" ? "ok" : "SHAPE",
        ok: typeof prog === "number" && prog > 0,
        ms: 0,
        detail:
          typeof prog === "number"
            ? (prog > 0 ? "" : `progress still ${prog} after completing a milestone`)
            : "progress is not a number",
      });
    } else if (gen.ok) {
      results.push({
        name: "roadmap milestones",
        method: "-",
        path: "-",
        status: "SHAPE",
        ok: false,
        ms: 0,
        detail: "generate succeeded but no milestones returned"
      });
    }
  }

  // ---------- interviews ----------
  section("Interviews");
  {
    await call("interviews list", "GET", "/api/interviews");
    const s = await call("interview start", "POST", "/api/interviews/start", {
      body: {
        role: "Backend Engineer",
        track: "Technical",
        company: "Smoke Corp",
        difficulty: "Intermediate"
      },
      expect: [200, 201],
    });
    ctx.interviewId = s.json?.session?.id || s.json?.id;
    if (ctx.interviewId) {
      await call("interview message (AI)", "POST", `/api/interviews/${ctx.interviewId}/message`, {
        body: {
          message: "I would use a hash map for O(n) lookup.",
          conversation_history: []
        },
      });
      await call("interview evaluate (AI)", "POST", `/api/interviews/${ctx.interviewId}/evaluate`, {
        body: { conversation_history: [] },
      });
    }
    await call("interviews list after session", "GET", "/api/interviews");
  }

  // ---------- notifications ----------
  section("Notifications");
  {
    const r = await call("notifications list", "GET", "/api/notifications");
    const n = r.json?.notifications?.[0];
    if (n?.id) {
      await call("notification mark read", "POST", `/api/notifications/${n.id}/read`);
    } else {
      results.push({
        name: "notification mark read",
        method: "-",
        path: "-",
        status: "SKIP",
        ok: false,
        ms: 0,
        detail: "no notification found (signup should have created one)"
      });
    }
    await call("notifications mark all read", "PUT", "/api/notifications/read-all");
    await call("notifications list after read", "GET", "/api/notifications");
  }

  // ---------- analytics ----------
  section("Analytics");
  await call("analytics dashboard", "GET", "/api/analytics/dashboard");
  await call("analytics root", "GET", "/api/analytics");
  await call("progress alias", "GET", "/api/progress");

  report();
}

function report() {
  console.log(`\n${C.bold}${"=".repeat(78)}\nENDPOINT REPORT\n${"=".repeat(78)}${C.reset}`);
  console.log(
    `${C.dim}${"RESULT".padEnd(8)}${"CODE".padEnd(6)}${"METHOD".padEnd(7)}${"ENDPOINT".padEnd(40)}${C.reset}`
  );

  let pass = 0, fail = 0;
  for (const r of results) {
    const isPass = r.ok;
    isPass ? pass++ : fail++;
    const tag = isPass ? `${C.green}PASS${C.reset}    ` : `${C.red}FAIL${C.reset}    `;
    console.log(
      `${tag}${String(r.status).padEnd(6)}${r.method.padEnd(7)}${r.name.padEnd(40)}`
    );
    if (!isPass && r.detail) console.log(`        ${C.yellow}↳ ${r.detail}${C.reset}`);
  }

  console.log(`\n${C.bold}${pass} passed, ${fail} failed, ${results.length} total${C.reset}`);

  const aiFails = results.filter((r) => !r.ok && /AI/.test(r.name));
  if (aiFails.length) {
    console.log(
      `\n${C.dim}Note: ${aiFails.length} AI-dependent check(s) failed. If GEMINI_API_KEY is unset,\n` +
      `this is expected and is NOT a Phase 1 schema-alignment defect.${C.reset}`
    );
  }

  console.log(
    `\n${C.dim}Cleanup (removes only this run's test user and its cascaded rows):\n` +
    `  psql "$DATABASE_URL" -c "DELETE FROM \\"User\\" WHERE email = '${EMAIL}';"${C.reset}`
  );
}

run().catch((e) => {
  console.error("harness error:", e);
  process.exit(1);
});