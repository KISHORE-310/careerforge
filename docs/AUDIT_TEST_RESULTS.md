# Audit test results

**Date:** 2026-10-20  
**Mode:** read-only verification. No database, service, or source files were changed.

| Check | Result | Notes |
| --- | --- | --- |
| `npm run typecheck` | PASS | TypeScript completed successfully. |
| `npx prisma validate` | PASS | Prisma schema parsed and validated. |
| `docker compose config` | PASS | Compose configuration rendered; this does not prove Docker daemon/container health. |
| `npm test -- --reporter=verbose` | BLOCKED / non-zero | Vitest reported `3 failed | 2 passed` files and `7 passed` tests. The three failed files stopped during Vite module loading with Windows temporary-file `ENOENT`, not a product assertion. The complete suite must be rerun in a clean environment. |
| `npm run build` | INCONCLUSIVE | Prisma generation succeeded and Vite began transforming modules, but completion was not observed in the allotted execution window. Do not treat as a passing release build. |
| `npx prisma migrate status` | BLOCKED | Prisma targeted PostgreSQL at `localhost:5432` and ended with a schema-engine error; no reachable database was available for migration-state verification. |
| `npm audit --omit=dev --json` | BLOCKED | The registry could not be resolved (`ENOTFOUND registry.npmjs.org`), so no dependency advisory result is available. |

## Required rerun matrix

1. Start a clean disposable PostgreSQL instance and run `prisma migrate deploy`, `prisma migrate status`, and seeded integration tests.
2. Run `npm ci`, `npm run typecheck`, `npm test`, and `npm run build` on a clean Node 22 CI runner.
3. Add API integration coverage for authentication, cross-user access denial, refresh-token rotation/revocation, export redaction, AI endpoint auth/limits, uploads, ingestion retries, and transaction failure paths.
4. Run browser E2E flows against a production-like deployment: signup, login/logout, onboarding, resume review/confirm, job save/apply, learning persistence, DSA review, settings export/delete, and error/retry states.
5. Exercise Gemini and Jooble with safe test data for normal, timeout, quota, malformed-response, and outage conditions.
6. Run dependency, secret, SAST, container, and license scans with network access in CI.
