# Production remediation plan

## Release blockers — complete before production

1. **Secure AI review (SEC-001).** Authenticate and validate every code-review route, add user-aware quota/audit records, write 401/400/429 integration tests, and deploy.
2. **Protect exports (SEC-003).** Replace broad Prisma serialization with an explicit export DTO; prove password hashes, refresh tokens, and server metadata cannot leave the API.
3. **Rotate historical credentials (SEC-002).** Rotate all keys that ever appeared in the historical environment file, revoke old values, enable secret scanning, and record the response.
4. **Make schema deployment repeatable (OPS-001).** Test committed migrations against a clean PostgreSQL instance; add a single `prisma migrate deploy` release job; document backup/rollback.
5. **Establish a green validation gate.** Fix the Windows Vitest environment failure, make build/test complete in clean CI, and require the gate before merges.

## First production increment

6. Make roadmap replacement transactional and validate request bodies (DATA-004).
7. Rework analytics snapshots to a timezone-aware, unique, idempotent write (DATA-002).
8. Use a single match-score engine and return unavailable scores instead of invented defaults (DATA-003).
9. Define/persist the learning contract, including quiz/lesson state if advertised, and return 404 for unknown resources (DATA-001).
10. Introduce account deletion, retention, consent, and export audit controls (PRIV-001).
11. Restrict demo mode to non-production or provide tenant-isolated disposable demos (SEC-005).

## Hardening and operational maturity

12. Replace client-stored bearer sessions or formally accept the tradeoff with short lifetimes, CSP/XSS testing, and token-clearing tests (SEC-004).
13. Return only client-safe error messages; log a request ID and sanitized diagnostic context server-side (API-001).
14. Complete CSP/frame protection and resolve the remote company-logo policy (SEC-006).
15. Implement provider ingestion operations: schedules, expiry, dedupe, failure backoff, attribution, source-quality labels, and alerting (DATA-005).
16. Add production observability, backups/restore drill, migration runbook, and deployment checks (OPS-003).
17. Update README and archive/remove legacy implementation material through a separately reviewed cleanup change (DOC-001).
18. Pin dependencies and runtime/package-manager policy; reconcile environment model defaults (OPS-002).

## Definition of production ready

The product is ready only when release blockers are complete, clean CI is green, migration/rollback and backup restore have been rehearsed, security/privacy reviews are signed off, third-party failure paths are tested, operational ownership is assigned, and all user-visible “live” metrics are either attributable real data or explicitly marked unavailable/curated.
