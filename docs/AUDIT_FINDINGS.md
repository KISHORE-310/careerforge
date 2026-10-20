# Detailed audit findings

## High

### SEC-001 — Unauthenticated AI code review endpoint

**Location:** `src/server/routes/coach.routes.ts:48`  
**Evidence:** `POST /api/coach/chat` applies `authenticateToken` and request validation, while `POST ["/review", "/coding-review", "/"]` applies only `aiLimiter`. `server.ts` mounts this router at both `/api/coach` and `/api/coding`.

Any unauthenticated caller can request a provider-backed code review. This permits AI-cost abuse, makes per-user auditing impossible, and allows loosely typed/unbounded route input to reach the AI service.

**Required fix:** require `authenticateToken`; add a dedicated Zod schema with maximum code, language, and title lengths; attach request/user correlation to audit logs; apply a user-aware quota in addition to IP throttling. Return a generic provider-failure message to clients.

**Acceptance:** requests without a valid bearer token receive 401; malformed and oversized payloads receive 400; a valid authenticated request is rate-limited and audit-attributed.

### SEC-002 — Historical secrets were committed

**Evidence:** Git history contains `backend/.env` in earlier revisions, even though it is no longer tracked in the current checkout.

Removal from the current tree does not invalidate credentials exposed in history or cached clones/forks.

**Required fix:** rotate every credential that existed in that file (database, JWT, AI, job provider, and any third-party key); enable GitHub secret scanning; invalidate old deployments; use a history-rewrite process if the repository access model requires it; document the incident without publishing secret values.

**Acceptance:** old keys fail, replacement keys are held only by the secret manager/deployment environment, and secret scanning reports no active leak.

### SEC-003 — Data export returns `passwordHash`

**Location:** `src/server/routes/settings.routes.ts:33-46`  
**Evidence:** `prisma.user.findUnique({ include: ... })` returns the User scalar fields as well as relations, and the response serializes the full user object.

The export therefore includes the bcrypt password hash. It is not needed for a portability export and unnecessarily increases credential exposure through downloaded files, backups, or support transfers.

**Required fix:** replace `include`-only retrieval with an explicit `select` allowlist; exclude `passwordHash`, refresh-token records, internal IDs where unnecessary, and provider/internal metadata. Add export audit logging and a retention notice.

**Acceptance:** an export-schema test asserts that no password hash, refresh token, or internal credential field is present.

## Medium

### DATA-001 — Learning progress does not persist all advertised progress

**Location:** `src/server/routes/learning.routes.ts:51-75`, `src/db/repositories.ts` learning repository  
**Evidence:** the route accepts `quiz_score` and client lesson progress, but the API response always sets `quiz_score: null`; the schema/repository persists percentage only. The route also upserts progress without first confirming the resource exists.

This makes quiz/lesson completion misleading and invalid resource IDs may surface as database failures.

**Required fix:** define the product contract (percentage-only or lesson/quiz persistence), add schema fields/migration if needed, validate the payload, check resource existence and return 404, and make completion event writes transactional/idempotent.

### DATA-002 — Analytics read endpoint writes non-atomic readiness snapshots

**Location:** `src/server/routes/analytics.routes.ts:238-242`  
**Evidence:** a GET checks for a snapshot and then creates one for the day. Concurrent reads can both create records because no date uniqueness constraint is enforced.

Reads should not have surprising writes, and duplicate daily snapshots corrupt a trend graph.

**Required fix:** move snapshot creation to a scheduled/idempotent write operation or use a transaction/upsert backed by a unique `(userId, snapshotDate)` constraint. Store an explicit date in the user’s reporting timezone.

### DATA-003 — Job match score is inconsistent and fabricates a default

**Location:** `src/server/routes/jobs.routes.ts:31-70`, `:90-141`  
**Evidence:** the list endpoint uses `scoreJobMatch`, but the detail endpoint uses a separate skill-only algorithm, defaults no-required-skill jobs to `75`, then clamps the result to `40..96`.

The same user/job can receive different scores and the fallback looks like measured fit.

**Required fix:** use one shared scoring function and breakdown for list/detail; return `null`/`not available` when input evidence is insufficient; version the algorithm and disclose its inputs.

### DATA-004 — Roadmap regeneration is not transactional

**Location:** `src/db/repositories.ts:598`  
**Evidence:** replacement roadmap milestones are deleted and recreated as separate persistence operations.

A request failure or concurrent regeneration can leave partial/empty roadmap data.

**Required fix:** use a Prisma transaction, optimistic versioning, and body validation on roadmap updates. Test concurrent regeneration and recovery after a forced failure.

### SEC-004 — Access tokens in browser storage retain XSS blast radius

**Location:** `src/services/api.js` and frontend auth flow  
**Evidence:** bearer access-token handling is client-side storage based; refresh tokens are protected cookies.

An XSS issue could exfiltrate a live access token. This is a common SPA tradeoff but should be consciously accepted or redesigned.

**Required fix:** prefer a BFF/httpOnly-cookie session model for the highest-risk deployment, or minimize token lifetime, rigorously harden CSP, prevent dangerous HTML injection, and test token clearing on 401.

### SEC-005 — Demo mode is unsafe if enabled publicly

**Location:** `src/server/routes/auth.routes.ts`  
**Evidence:** demo mode relies on a shared persistent demo identity when `DEMO_MODE=true`.

If enabled in public production, unrelated visitors can access and alter the same demo data.

**Required fix:** make demo mode non-production only, use isolated disposable demo tenants/sessions, and prevent production configuration from enabling it.

### PRIV-001 — No complete privacy lifecycle

**Evidence:** resumes retain parsed raw content; exports include broad profile/resume/interview data; there is no verified account-deletion/retention workflow.

The product handles substantial PII. Export alone does not meet a complete data-lifecycle commitment.

**Required fix:** add authenticated account deletion with grace period, cascade/soft-delete policy, retention schedule for originals and AI artifacts, consent/processing notices, audit trail, and restore/deletion tests.

### OPS-001 — Deployment does not run migrations

**Location:** `Dockerfile`, `docker-compose.yml`  
**Evidence:** the image builds/runs the app but does not run `prisma migrate deploy`. Compose exposes PostgreSQL on host port 5432 and has local default credentials.

Application startup against a fresh production database can fail or run an incompatible schema.

**Required fix:** run migrations as a single controlled deploy step/job, not by every replica; make it observable and rollback-aware; remove host DB exposure from production compose/deployment; provide secret-backed credentials.

## Low

### DOC-001 — Documentation describes a different application

**Location:** `README.md`, legacy `backend/`, root `server/`  
**Evidence:** README refers to FastAPI/MongoDB and a `frontend` application that is not the active start path. The active system is root Express/Prisma/Vite.

Update the README, local setup, environment reference, architecture diagram, migration/backup/runbook, and remove or archive legacy files after a separate approved cleanup.

### API-001 — Internal errors can be returned to clients

**Locations:** `src/server/routes/learning.routes.ts`, AI/resume-related routes  
**Evidence:** selected catch blocks return `error?.message`.

Use structured server logs with a request ID and client-safe fixed error codes/messages. Do not expose provider, SQL, filesystem, or parsing details.

### SEC-006 — Content security policy/frame protection needs completion

**Location:** `src/server/security.ts`  
**Evidence:** `frameguard` is disabled and CSP does not set `frame-ancestors`; `img-src` permits only self/data/blob while company formatting supplies an Unsplash image URL.

Add `frame-ancestors 'none'` (or approved origins), decide whether remote image hosts are allowed, and test CSP in the deployed browser.

### OPS-002 — Dependency/config determinism needs tightening

**Evidence:** `@google/genai` uses a `*` version range; `.env.example` and server default Gemini model differ; package manager artifacts and legacy runtime material coexist.

Pin direct dependency ranges, define supported Node version in `engines`/tooling, pick a package manager, and make one documented configuration source of truth.

### OPS-003 — Observability and recovery are incomplete

Add structured logs/redaction, request IDs, error reporting, provider latency/error metrics, database backup/restore drills, migration rollback playbook, uptime/ready checks, and alert thresholds. The unauthenticated metrics endpoint should be protected or limited to trusted infrastructure.

### DATA-005 — Job/company source quality needs operational controls

Jooble/provider ingestion is a real integration, but production quality still needs scheduled ingestion, expiry policy, deduplication, provider failure handling, attribution retention, and monitoring. Company details and logos must be sourced/attributed or presented as catalog data, not live intelligence.
