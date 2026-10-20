# CareerForge production-readiness audit

**Audit date:** 2026-10-20
**Scope:** active Express/Prisma API, React client, Docker/CI/deployment files, tests, repository hygiene, and tracked legacy material.
**Mode:** audit only. No application, schema, dependency, infrastructure, or deployment file was changed.

## Executive assessment

CareerForge has a credible active architecture: a React/Vite client, an Express API, Prisma/PostgreSQL persistence, bearer access tokens with rotated refresh tokens, and modular route ownership. Most user-owned resources are scoped by authenticated user ID. The application is **not production ready today** because a high-impact AI endpoint is unauthenticated, data export exposes password hashes, deployment migrations are not automated, and live end-to-end behavior could not be validated without PostgreSQL and provider credentials.

## Findings at a glance

| Severity | Count | Themes |
| --- | ---: | --- |
| Critical | 0 | — |
| High | 3 | unauthenticated AI spend endpoint, historical secret exposure, password-hash export |
| Medium | 8 | persistence correctness, privacy lifecycle, deployment, auth/session hardening, product-data integrity |
| Low | 6 | documentation drift, error hygiene, configuration determinism, monitoring and UX robustness |

The detailed register is in [AUDIT_FINDINGS.md](AUDIT_FINDINGS.md). The ordered engineering work is in [AUDIT_REMEDIATION_PLAN.md](AUDIT_REMEDIATION_PLAN.md).

## What was verified

- The active server starts from `server.ts`; the active database layer is `src/db/prisma.ts` and `src/db/repositories.ts`.
- Frontend routes are lazy loaded and protected through `src/routes/ProtectedRoute.jsx` except public entry routes.
- Access and refresh tokens use short-lived JWTs and hashed, rotating refresh-token records.
- Application, interview, roadmap, resume, notification, DSA, and learning repository calls are generally user-scoped.
- Job responses identify their provider/catalog source. Curated DSA and example/template content is distinguishable from user data in the current source.
- `npx prisma validate` and `npm run typecheck` passed.

## Important limitations

- PostgreSQL at `localhost:5432` was unavailable, so migrations, database integration tests, permissions under real persistence, and a full user journey could not be verified.
- Docker Desktop was unavailable earlier in this workspace; `docker compose config` was validated, but containers were not started.
- Gemini and Jooble were not invoked. AI/provider quota, timeout, malformed-response, and data-quality behavior remains unverified.
- The full Vitest command was blocked by a Windows/Vite temporary-file `ENOENT` failure; see [AUDIT_TEST_RESULTS.md](AUDIT_TEST_RESULTS.md).
- A production build began and completed Prisma generation/Vite transformation but did not finish within the execution window; it is not recorded as a pass.

## Immediate release gate

Do not release until the High findings are remediated, migration deployment is automated and tested against a clean PostgreSQL instance, and the complete test/build suite passes in CI. In particular, protect `POST /api/coding/review`, redact credential material from data exports, and rotate any historical secrets.
