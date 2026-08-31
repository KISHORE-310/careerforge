# CareerForge AI — Production Upgrade Implementation Plan

This implementation plan outlines the strict step-by-step roadmap to transform CareerForge AI from an MVP/demo into an enterprise-grade, genuinely functional production platform.

---

## Strict Execution Protocol
1. **Phase-Gated Execution**: Complete ONLY one phase at a time.
2. **Pre-inspection**: Inspect and verify existing behavior before making edits.
3. **Verification**: Run linter, compiler, and test suites after each phase.
4. **Approval Gate**: Stop and await user approval before commencing the next phase.

---

## Ordered Implementation Phases

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 0: AUDIT (Completed)                                  │
│ Comprehensive review, AUDIT.md & IMPLEMENTATION_PLAN.md     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: FOUNDATION / DATABASE                              │
│ PostgreSQL / Prisma ORM, Relational Schemas, Migrations     │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: SECURITY & AUTH HARDENING                          │
│ Secrets validation, eliminate bypasses, rate limit, CORS   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: REMOVE FAKE & HARDCODED DATA                       │
│ Strip mock scores, fake seeds, canned AI fallbacks         │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: REAL AI SYSTEM & STRUCTURED OUTPUT                 │
│ AIService, Context Builder, AST code review, strict JSON    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: REAL JOB SYSTEM & 7-FACTOR MATCHING                │
│ JobProvider abstraction, 7-factor weighted scoring engine   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 6: REAL CAREER INTELLIGENCE & ANALYTICS               │
│ Real skill gap analyzer, Next Best Action, event logging    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 7: BACKEND MODULAR REFACTOR                           │
│ Layered architecture: config, routes, controllers, services │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 8: FRONTEND DATA INTEGRITY & UI HARDENING             │
│ Connect live charts, eliminate fake hooks, 4 UI states      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 9: TESTING SUITE                                      │
│ Vitest/Jest unit, integration, and failure test suites      │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 10: PERFORMANCE & CODE SPLITTING                      │
│ Route lazy loading, bundle reduction, query indexing        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 11: DOCUMENTATION REWRITE                             │
│ Architecture specs, API documentation, honest setup guide   │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ PHASE 12: FINAL VERIFICATION & END-TO-END VALIDATION        │
│ Complete verification of main journey and final report      │
└─────────────────────────────────────────────────────────────┘
```

---

### Phase 1: Foundation / Database
- **Objective**: Replace in-memory `Map` storage and `store.json` with a robust relational database layer.
- **Tasks**:
  1. Set up Prisma ORM with relational schema (`prisma/schema.prisma`).
  2. Implement all models with proper constraints, foreign keys, timestamps, indexes:
     - `User`, `Profile`, `Resume`, `ResumeVersion`, `Skill`, `Job`, `JobMatch`, `Application`, `Interview`, `InterviewMessage`, `InterviewEvaluation`, `Roadmap`, `RoadmapMilestone`, `LearningResource`, `LearningProgress`, `DSAProgress`, `Notification`, `AnalyticsEvent`, `CareerSnapshot`.
  3. Create migration scripts (`npm run db:migrate`) and separate development seed script (`npm run db:seed`).
  4. Create a unified database client & repository layer.
  5. Connect existing API routes to the database layer and verify restart survival.
- **Verification**: `npm run build`, `npm run lint`, database persistence across server restarts.

### Phase 2: Security & Auth Hardening
- **Objective**: Fortify the application against unauthorized access, credential leakage, and abuse.
- **Tasks**:
  1. Remove hardcoded fallback secrets (`JWT_SECRET`, `ENCRYPTION_KEY`); enforce startup validation.
  2. Eliminate `"demo_jwt_token_careerforge"` authentication bypasses; isolate demo mode behind `DEMO_MODE=true`.
  3. Implement Zod request schema validation on all endpoints.
  4. Add `helmet` security headers, strict CORS, and `express-rate-limit` for general API & AI endpoints.
  5. Implement PDF file validation (MIME, magic bytes, size constraints).
- **Verification**: Unauthorized requests rejected with 401/403, malformed payloads rejected with 400.

### Phase 3: Remove Fake & Hardcoded Data
- **Objective**: Clean out misleading mock data, random formulas, and ungrounded placeholders.
- **Tasks**:
  1. Remove `evaluation?.resume_score || 94` fallback; display "Not analyzed yet" if no evaluation exists.
  2. Replace hardcoded "New Tech Corp" experience in `Resume.jsx` with a clean empty form.
  3. Eliminate `Math.random()` scoring in interview completion.
  4. Remove fake AI fallback responses across the platform (`{ success: false, code: "AI_UNAVAILABLE" }`).
  5. Eliminate hardcoded metrics in `Progress.jsx` and mock seed problems in `useDSAProgress.js`.
- **Verification**: No fake numbers or synthetic cards rendered across any view.

### Phase 4: Real AI System & Structured Output
- **Objective**: Implement a reliable, grounded, type-safe AI pipeline powered by Google GenAI.
- **Tasks**:
  1. Build a centralized `AIService` supporting structured JSON schemas (via `responseSchema`).
  2. Implement real Resume ATS parser & metric-driven bullet rewriter.
  3. Build 6-axis Interview AI Evaluator analyzing genuine transcripts against technical rubrics.
  4. Build `CareerContextBuilder` aggregating profile, skills, jobs, applications, and DSA progress for `CareerCoach`.
  5. Implement AI Code Lab review analyzing actual user code AST/logic with complexity analysis.
- **Verification**: Structured JSON outputs validated against schemas with clear error handling.

### Phase 5: Real Job System & Matching
- **Objective**: Replace 10 static jobs with a dynamic job feed and 7-factor career matching algorithm.
- **Tasks**:
  1. Create `JobProvider` abstraction supporting live job ingestion, deduplication, and expiration.
  2. Implement 7-factor `JobMatchService`:
     - Skills (30%), Experience (20%), Seniority (15%), Semantic Relevance (15%), Education (10%), Location (5%), Salary (5%).
  3. Return explainable match breakdown (strengths, missing skills, match explanation).
  4. Implement database pagination, search, role filters, and salary filtering.
- **Verification**: Accurate match scores dynamically computed from user resume and profile.

### Phase 6: Real Career Intelligence & Analytics
- **Objective**: Provide authentic trajectory analytics, skill gap analysis, and next best actions.
- **Tasks**:
  1. Implement Skill Gap Engine comparing candidate resume against target role market requirements.
  2. Build dynamic Next Best Action priority ranker.
  3. Implement AI-driven 90-day milestone Roadmap generator tied to candidate gaps.
  4. Replace synthetic 365-day heatmap generator with real event-sourced `AnalyticsEvent` aggregations.
- **Verification**: Heatmap, radar, and readiness charts render real user history and milestones.

### Phase 7: Backend Modular Refactor
- **Objective**: Split monolithic 2,065-line `server.ts` into clean, maintainable architectural layers.
- **Tasks**:
  1. Create directory structure:
     `server/` (`app.ts`, `server.ts`, `config/`, `routes/`, `controllers/`, `services/`, `repositories/`, `schemas/`, `middleware/`, `utils/`).
  2. Extract discrete services: `AIService`, `ResumeService`, `JobService`, `MatchingService`, `ApplicationService`, `InterviewService`, `CareerIntelligenceService`, `AnalyticsService`, `RoadmapService`, `LearningService`, `DSAService`.
  3. Create type-safe controllers and route definitions.
- **Verification**: Server builds cleanly, dev server starts on port 3000, and all API endpoints pass integration checks.

### Phase 8: Frontend Data Integrity & UI Hardening
- **Objective**: Connect all React views to live database models and handle all 4 UI states.
- **Tasks**:
  1. Audit and connect all 16 pages (`Dashboard`, `Jobs`, `Resume`, `Applications`, `Interviews`, `DSA`, etc.).
  2. Connect charts (`CompetencyRadarChart`, `ApplicationFunnelChart`, `ReadinessAreaChart`, `DSAPerformanceChart`) to live API data.
  3. Ensure every page handles Loading, Error, Empty, and Success states gracefully.
  4. Wire up dead buttons (Settings export & notifications, bookmark toggles, application notes).
- **Verification**: Every button and chart responds to real data with no unhandled errors.

### Phase 9: Testing Suite
- **Objective**: Implement comprehensive automated testing.
- **Tasks**:
  1. Configure Vitest test runner.
  2. Write unit tests for ATS scoring, 7-factor job matching, skill gap engine, and validation schemas.
  3. Write integration tests for signup/login, resume upload, job search, interview loop, and analytics.
  4. Write failure tests for AI unavailability, database failure, expired tokens, and invalid PDFs.
- **Verification**: `npm test` runs all test suites with 100% pass rate.

### Phase 10: Performance & Code Splitting
- **Objective**: Optimize application delivery, bundle sizes, and query execution.
- **Tasks**:
  1. Implement `React.lazy` and `Suspense` route code splitting across all page components.
  2. Optimize database query indexes for high-frequency queries (`userId`, `status`, `slug`).
  3. Implement caching for job listings and market trend queries.
- **Verification**: Vite production build bundle sizes reduced significantly below warning thresholds.

### Phase 11: Documentation Rewrite
- **Objective**: Produce an accurate, honest, and comprehensive technical README.
- **Tasks**:
  1. Document system architecture, directory layout, and technology stack.
  2. Provide environment variable reference, setup instructions, migration commands, and API documentation.
  3. Include architecture diagrams and acknowledge known limitations.
- **Verification**: README accurately reflects current codebase reality.

### Phase 12: Final Verification & End-to-End Validation
- **Objective**: Complete full user lifecycle validation and produce final project report.
- **Tasks**:
  1. Perform full codebase search for forbidden artifacts (`Math.random`, `demo_jwt_token`, mock data).
  2. Walk through the complete user journey: Signup → Profile → Resume Upload → ATS Analysis → Skill Gaps → Job Search → Job Match → Application Tracking → Mock Interview → Evaluation → Roadmap → DSA Practice → Career Coach.
  3. Generate final before/after comparison and production readiness scorecard.
- **Verification**: All build, lint, and test scripts exit with 0 errors.

---
