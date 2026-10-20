# CareerForge AI

CareerForge AI is an enterprise-grade platform for resume intelligence, ATS compatibility scoring, role-based skill gap evaluation, tech job matching, and technical interview preparation.

---

## Architecture & Technology Stack

The platform is built as a unified, high-performance full-stack application:

- **Backend Runtime**: Node.js with TypeScript and [Express](server.ts)
- **Frontend SPA**: React 19 + [Vite](vite.config.js) + Tailwind CSS v4 + Framer Motion + Lucide React + Recharts
- **Database & ORM**: PostgreSQL 16 managed via [Prisma ORM](prisma/schema.prisma) with repository pattern abstractions
- **AI Engine**: Google Gemini API via `@google/genai` for ATS resume analysis, structured career roadmaps, AI code reviews, and mock interview evaluation
- **Security & Hardening**: Strict JWT session tokens (HMAC-SHA256), bcrypt password hashing, Helmet HTTP protection, CORS whitelisting, rate limiting, and password hash leakage prevention

> [!NOTE]
> The `backend/` directory contains an earlier Python FastAPI + MongoDB prototype preserved for reference. The active, production-hardened platform is driven by the root Express + Prisma + React stack.

---

## Key Features

1. **ATS Resume Evaluation & Scoring**
   - High-throughput PDF text extraction and structured parsing.
   - Computes ATS compatibility scores, quantifiable impact metrics, and structural recommendations.
   - Tailored keyword alignment against target engineering roles.

2. **7-Factor Job Matching Engine**
   - Evaluates job opportunities using a weighted 7-factor engine: technical skills (40%), experience level (20%), domain relevance, seniority, and salary expectations.

3. **DSA Practice Tracker & AI Code Lab**
   - Curated problem sets across core patterns (Arrays, Two Pointers, Sliding Window, Monotonic Stack, Trees, Dynamic Programming).
   - Dynamic difficulty breakdowns, pattern mastery velocity charts, and personal notes.
   - In-browser AI code review assessing time/space complexities and edge case handling.

4. **Dynamic Career Roadmaps & Learning Hub**
   - Generates 30/60/90-day execution roadmaps calibrated to candidate target roles and identified skill gaps.
   - Modular learning units with knowledge checks and milestone tracking.

5. **Application Pipeline & Funnel Tracking**
   - Kanban-style pipeline tracking across application stages (*Wishlist*, *Applied*, *Screening*, *Interview*, *Offer*, *Rejected*).
   - Dynamic conversion rates and throughput analytics.

6. **Macro Market Intelligence**
   - Real-time compensation percentiles across metros (SF Bay Area, NYC, US Remote) by seniority band.
   - In-demand skill premium indices and YoY hiring growth indicators.

---

## Directory Structure

```text
careerforge/
├── server.ts                 # Full-stack server entrypoint (Express API + Vite SPA)
├── src/
│   ├── server/               # Modular Express backend
│   │   ├── routes/           # Domain API routers (auth, profile, resume, jobs, dsa, etc.)
│   │   ├── services/         # AIService (Gemini) and 7-Factor matching engine
│   │   ├── security.ts       # Helmet, CORS, and rate limiting middleware
│   │   ├── auth.ts           # JWT authentication and user session validation
│   │   └── config.ts         # Environment validation
│   ├── db/                   # Prisma client singleton and database repositories
│   ├── pages/                # React pages (Dashboard, Resume, Jobs, DSA, Interviews, etc.)
│   ├── components/           # Reusable UI components and Recharts visual widgets
│   ├── hooks/                # React custom hooks (DSA progress, auth state)
│   └── services/api.js       # Client API client with auth headers
├── prisma/
│   ├── schema.prisma         # Relational database schema
│   └── seed.ts               # Database seed script
├── docker-compose.yml        # PostgreSQL 16 container definition
├── AUDIT.md                  # Comprehensive production audit
├── IMPLEMENTATION_PLAN.md    # Multi-phase engineering roadmap
└── phase1-smoke-test.mjs     # Automated HTTP and security integration smoke test
```

---

## Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **Docker**: Docker Desktop or Docker engine (for PostgreSQL)
- **Google Gemini API Key** (optional in development; platform operates in fallback mode if omitted)

### 1. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Verify or configure the variables in `.env`:

```env
DATABASE_URL=postgresql://careerforge:careerforge@localhost:5432/careerforge
JWT_SECRET=your_super_secret_jwt_key_here
PORT=3000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key
```

### 2. Start PostgreSQL Database

Launch the PostgreSQL container using Docker Compose:

```bash
docker compose up -d
```

### 3. Install Dependencies & Initialize Database

```bash
# Install Node dependencies
npm install

# Push database schema to PostgreSQL
npm run db:migrate

# Seed initial jobs, companies, and catalogs
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## Production Build & Tests

```bash
# Typecheck backend
npm run typecheck

# Build frontend and bundle server
npm run build

# Start production server
npm run start

# Run automated integration smoke tests
node phase1-smoke-test.mjs
```

---

## Core API Reference

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/health`, `/api/health` | System and database health status | No |
| `POST` | `/api/auth/signup` | Register new user account | No |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | No |
| `GET` | `/api/profile` | Retrieve user profile & settings | Yes |
| `POST` | `/api/upload-resume` | Upload PDF resume for ATS parsing & scoring | Yes |
| `GET` | `/api/jobs` | Search & filter jobs with 7-factor match scores | Optional |
| `GET` | `/api/applications` | Retrieve user job application pipeline | Yes |
| `GET` | `/api/dsa/progress` | Fetch DSA topic progress & stats | Yes |
| `POST` | `/api/coding/review` | AI code review for DSA solution | Yes |
| `GET` | `/api/market` | Market trends, skill premiums & salary distributions | No |
| `GET` | `/api/progress/analytics` | 365-day activity calendar & readiness index | Yes |
