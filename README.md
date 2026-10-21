# CareerForge AI

CareerForge AI is an enterprise-grade platform for resume intelligence, ATS compatibility scoring, role-based skill gap evaluation, live tech job matching, technical interview simulation, and DSA coding preparation.

---

## Architecture & Technology Stack

The platform is designed as a unified, high-throughput, full-stack TypeScript application:

- **Backend Runtime**: Node.js 18+ with TypeScript and [Express](server.ts)
- **Frontend SPA**: React 19 + [Vite](vite.config.js) + Tailwind CSS v4 + Framer Motion + Lucide React + Recharts
- **Database & ORM**: PostgreSQL 16 managed via [Prisma ORM](prisma/schema.prisma) with typed repository pattern abstractions
- **AI Engine**: Google Gemini API via `@google/genai` (default: `gemini-2.5-flash`) for ATS resume parsing, career roadmaps, AI code reviews, and mock interview evaluation
- **Testing**: [Vitest](vitest.config.ts) + Supertest (44 automated tests across 5 test suites)
- **Security & Hardening**:
  - Strict JWT session tokens (HMAC-SHA256) authenticated exclusively by subject ID (`jwt.sub`)
  - Atomic refresh token rotation in database transactions (`prisma.$transaction`)
  - Bcrypt password hashing; data export explicitly scrubs `passwordHash`
  - Helmet security headers, CORS origin verification, and rate limiting
  - Protected runtime observability (`/metrics`) secured via `METRICS_TOKEN`

> [!NOTE]
> The `backend/` directory preserves an earlier Python FastAPI + MongoDB prototype for historical reference. The active production platform runs on Express + Prisma + React.

---

## Key Features

1. **ATS Resume Evaluation & Scoring**
   - High-throughput PDF text extraction and structured parsing.
   - Mathematically grounded 96-point rubric evaluating contact metadata, professional summaries, education, work experience, projects, technical skills, and certifications.
   - Actionable strengths, weaknesses, and structural recommendations.

2. **Unified Job Matching Engine**
   - Evaluates job listings against candidate skills, target role, and seniority level.
   - Anonymous visitors receive clear `"Sign in to calculate"` prompts without fabricated placeholder scores.

3. **DSA Practice Tracker & AI Code Lab**
   - Curated problem sets across core interview patterns (Arrays & Two Pointers, Sliding Window, Monotonic Stack, Trees, Graphs, Dynamic Programming).
   - In-browser AI code review assessing time/space complexities, edge cases, and code quality.
   - Persisted candidate progress and mastery velocity tracking.

4. **Dynamic Career Roadmaps & Learning Hub**
   - Generates 30/60/90-day execution roadmaps calibrated to candidate target roles and identified skill gaps.
   - Modular learning units with knowledge checks, quiz evaluation, and milestone tracking.

5. **Application Pipeline & Funnel Tracking**
   - Kanban-style pipeline tracking across application stages (*Wishlist*, *Applied*, *Screening*, *Interview*, *Offer*, *Rejected*).
   - Server-side skill alignment calculation and activity audit trails.

6. **Interactive AI Mock Interviews**
   - Real-time technical interview simulator with role-specific questions and follow-ups.
   - Post-session multi-dimensional evaluations (technical depth, communication, problem-solving).

7. **Macro Market Intelligence**
   - Real-time compensation percentiles across metros (SF Bay Area, NYC, US Remote) by seniority band.
   - In-demand skill premium indices and hiring demand indicators.

8. **Privacy, Compliance & Data Portability**
   - Full GDPR-compliant data export (`GET /api/settings/export`) scrubbed of credentials and password hashes.
   - Account erasure and session revocation controls.

---

## Directory Structure

```text
careerforge/
├── start.ts                  # Runtime entrypoint — binds port, loads Vite (dev) or serves dist/ (prod)
├── server.ts                 # Express app factory — registers all routes and middleware (no port binding)
├── vite.config.js            # Vite configuration with Windows cache locking fix
├── vitest.config.ts          # Vitest test runner configuration
├── package.json              # Project dependencies, build, and test scripts
├── docker-compose.yml        # PostgreSQL 16 container definition
├── docs/                     # Architectural, audit, and planning documentation
│   ├── AUDIT.md              # Production readiness audit
│   ├── AUDIT_FINDINGS.md     # Security & correctness findings
│   ├── AUDIT_REMEDIATION_PLAN.md # Step-by-step remediation plan
│   └── IMPLEMENTATION_PLAN.md    # Multi-phase roadmap
├── prisma/
│   ├── schema.prisma         # Relational database schema
│   ├── migrations/           # Committed Prisma migration history
│   └── seed.ts               # Database seed script (jobs, companies, catalogs)
├── src/
│   ├── server/               # Modular Express backend
│   │   ├── routes/           # Domain API routers (auth, resume, jobs, dsa, coach, etc.)
│   │   ├── services/         # AIService (Gemini) and matching engine
│   │   ├── security.ts       # Helmet, CORS, and rate limiting middleware
│   │   ├── auth.ts           # JWT authentication and session validation
│   │   └── config.ts         # Environment validation
│   ├── db/                   # Prisma client singleton and repository abstraction
│   ├── pages/                # React pages (Dashboard, Resume, Jobs, DSA, Interviews, etc.)
│   ├── components/           # UI components, error boundaries, and Recharts charts
│   ├── hooks/                # Custom hooks (DSA progress, auth state)
│   └── services/api.js       # Client API client with auth handling
├── tests/                    # Automated test suites (44 tests)
│   ├── auth-api.test.ts      # Session validation, demo token rejection tests
│   ├── feature-routes.test.ts# Applications, DSA, Coach, Interviews API tests
│   ├── resume-score.test.ts  # ATS scoring rubric validation
│   ├── job-ingestion.test.ts # Job aggregator integration tests
│   └── frontend-api.test.js  # Frontend client contract tests
└── scripts/
    └── ingest-jobs.ts        # External job ingestion script
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Docker**: Docker Desktop or Docker engine (for PostgreSQL)
- **Google Gemini API Key**: [Google AI Studio](https://aistudio.google.com/) (platform operates in fallback mode if omitted)

### 1. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Configure your variables in `.env`:

```env
# Database & Authentication
DATABASE_URL=postgresql://careerforge:careerforge@localhost:5432/careerforge
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
NODE_ENV=development

# Google Gemini AI Key
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Optional: Live Job Aggregator & Metrics
JOOBLE_API_KEY=
METRICS_TOKEN=internal_secret_metrics_token
```

### 2. Start PostgreSQL Database

Launch the PostgreSQL container using Docker Compose:

```bash
docker compose up -d
```

### 3. Initialize Database & Seed Catalog

```bash
# Install Node dependencies
npm install

# Deploy committed migrations to database
npm run db:migrate

# Seed curated jobs, companies, DSA problems, and learning modules
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing & Quality Assurance

The codebase includes comprehensive unit and integration test coverage:

```bash
# Run the complete test suite (45 tests, 5 test suites)
npm test

# Run tests in watch mode during development
npm run test:watch

# Verify TypeScript compilation with zero errors
npm run typecheck

# Verify frontend and backend production build
npm run build
```

---

## Production Build & Launch

```bash
# 1. Build frontend (Vite) + server bundle (esbuild)
npm run build

# 2. Apply pending migrations to production database
npx prisma migrate deploy

# 3. Start production server (reads NODE_ENV, DATABASE_URL, JWT_SECRET, etc. from environment)
npm start

# 4. Smoke-test health endpoints
curl http://localhost:3000/health   # → { "status": "ok", "database": "connected" }
curl http://localhost:3000/ready    # → { "status": "ready" }

# 5. Verify /metrics is locked (should return 401 without token)
curl http://localhost:3000/metrics
# Authenticated access:
curl -H "Authorization: Bearer $METRICS_TOKEN" http://localhost:3000/metrics
```

> **Server architecture:** `start.ts` is the runtime entrypoint — it dynamically loads the Vite dev middleware in development and serves the pre-built `dist/` in production. `server.ts` is the pure Express app factory (no port binding) and is safe to import in tests without spawning Vite.

---

## Core API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/health`, `/api/health` | System and database health status | No |
| `GET` | `/ready`, `/api/ready` | Kubernetes/container readiness probe | No |
| `GET` | `/metrics`, `/api/metrics` | Process uptime, memory, and request counters | Token (`METRICS_TOKEN`) |
| `POST` | `/api/auth/signup` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT + refresh cookie | No |
| `POST` | `/api/auth/refresh` | Atomically rotate refresh token and issue new session | Cookie / Body |
| `GET` | `/api/auth/me` | Retrieve current authenticated user | Yes |
| `GET` | `/api/profile` | Retrieve candidate profile and preferences | Yes |
| `POST` | `/api/upload-resume` | Upload PDF resume for ATS parsing & scoring | Yes |
| `GET` | `/api/jobs` | Search & filter jobs with match scores | Optional |
| `GET` | `/api/jobs/:id` | Job details with skill fit analysis | Optional (null if anon) |
| `GET` | `/api/applications` | Retrieve user job application pipeline | Yes |
| `POST` | `/api/applications` | Track new job application | Yes |
| `GET` | `/api/dsa/catalog` | Curated DSA problem catalog | No |
| `GET` | `/api/dsa/progress` | Fetch DSA topic progress & solved status | Yes |
| `POST` | `/api/coding/review` | AI code review evaluating complexity & edge cases | Yes |
| `GET` | `/api/interviews` | List mock interview practice sessions | Yes |
| `POST` | `/api/interviews/start` | Start interactive AI interview session | Yes |
| `POST` | `/api/interviews/:id/complete` | Conclude interview and compute evaluation report | Yes |
| `GET` | `/api/roadmap` | Personalized 30/60/90-day career roadmap | Yes |
| `GET` | `/api/learning` | Curated learning modules and practice quizzes | Yes |
| `GET` | `/api/settings/export` | Export GDPR-compliant account archive (hashes scrubbed) | Yes |
| `GET` | `/api/market` | Market trends, skill premiums & salary distributions | No |

---

## License

MIT
