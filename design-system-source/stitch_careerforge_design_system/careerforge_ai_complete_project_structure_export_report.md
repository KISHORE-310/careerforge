# CareerForge AI: Complete Project Inventory & Export Manifest

This document provides a comprehensive inventory of the CareerForge AI full-stack application as implemented. The project is structured as a modern mono-repo ready for independent deployment, local development, and version control.

## 1. Project Root Configuration
- `package.json`: Main dependency manifest (Next.js, Tailwind, Prisma, NextAuth).
- `tsconfig.json`: TypeScript configuration.
- `next.config.js`: Next.js production routing & optimization config.
- `postcss.config.js` & `tailwind.config.ts`: Obsidian Gold design system implementation.
- `.env.example`: Template for environment-specific secrets.
- `.gitignore`: Configured to exclude node_modules, .env, and build artifacts.

## 2. Frontend Architecture (`/src`)
### Pages & Routing (`/src/app`)
- `layout.tsx`: Root layout with design system providers and Shell integration.
- `page.tsx`: Marketing Landing Page.
- `(auth)/`: Authentication routes (Login, Signup).
- `(dashboard)/`: Core authenticated experience.
  - `home/`: Career Command Center.
  - `discover/`: Job search and match engine.
  - `build/`: Resume Studio and Application AI.
  - `develop/`: Skill Intelligence and Roadmap.
  - `prepare/`: Interview Lab and Coding Lab.
  - `track/`: Application tracking board.
  - `profile/`: Unified profile management.

### Components (`/src/components`)
- `ui/`: Design system primitives (Buttons, Cards, Modals, Badges).
- `shared/`: Persistent Shell elements (Sidebar, Header, Notifications).
- `ai/`: Specialized AI UI components (Score gauges, insight callouts).
- `resume/`: Resume Studio editor and version manager.
- `kanban/`: Application tracking board implementation.

## 3. Backend & API Layer (`/src/api` & `/src/app/api`)
### API Routes
- `/api/auth/`: NextAuth configuration and session management.
- `/api/profile/`: CRUD for career profiles and onboarding data.
- `/api/jobs/`: Job discovery and match score calculation.
- `/api/resume/`: Resume persistence, versioning, and AI optimization.
- `/api/skills/`: Skill gap analysis and roadmap generation.
- `/api/ai/`: Centralized service for LLM-driven insights.

### Service Layer (`/src/lib/services`)
- `ai-service.ts`: Abstraction layer for OpenAI/Anthropic/Google providers.
- `match-engine.ts`: Multi-factor scoring logic (Skills, Exp, Edu).
- `ats-analyzer.ts`: Resume parsing and optimization logic.

## 4. Database & Persistence (`/prisma`)
- `schema.prisma`: The source of truth for the data model.
  - `User`: Identity and Auth.
  - `Profile`: Career goals, skills, and readiness scores.
  - `Job`: Indexed jobs and match scores.
  - `Resume` / `ResumeVersion`: Document content and history.
  - `Application`: Tracking state and generated content.
  - `Notification`: Smart alerts and logs.
- `migrations/`: Versioned SQL migration history.

## 5. Assets & Static Content (`/public`)
- `logo.svg`: CareerForge brand mark ({{DATA:IMAGE:IMAGE_54}}).
- `avatars/`: Default and generated profile imagery.
- `fonts/`: Newsreader and Geist typeface assets.

## 6. Environment Requirements
The following keys must be defined in the production/local `.env`:
- `DATABASE_URL`: PostgreSQL/Supabase connection string.
- `JWT_SECRET`: Security salt for session tokens.
- `AI_API_KEY`: API key for the chosen intelligence provider.
- `NEXTAUTH_URL`: Canonical URL of the application.

---

## Export & GitHub Integration Instructions

To move the CareerForge source code into your repository (`KISHORE-310/careerforge`) and maintain full ownership:

1. **Clone your repository locally**:
   `git clone https://github.com/KISHORE-310/careerforge.git`
2. **Download the Source Bundle**:
   Use the "Export Code" feature in the Stitch toolbar to download the complete `.zip` of the current working tree.
3. **Initialize the local working tree**:
   Extract the bundle into your local repository folder.
4. **Install Dependencies**:
   `npm install`
5. **Sync Database**:
   `npx prisma db push`
6. **Push to Main**:
   `git add . && git commit -m "feat: complete CareerForge AI full-stack implementation" && git push origin main`

The project is now fully independent of the design canvas and can be run, modified, and deployed using standard industry workflows.