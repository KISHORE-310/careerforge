# CareerForge AI: Product Redesign & UX Architecture Blueprint

## A. Final Sitemap

### 1. Public / Marketing
- **Landing Page (Home)**: "Build the career you're aiming for"
- **Onboarding (Multi-step)**: Welcome → Goal → Target Role → Profile Build → Initial Career Score

### 2. Core Platform (Authenticated)
- **HOME**: Career Command Center (Overview, Next Actions, Insights)
- **DISCOVER**
    - **Jobs**: AI-powered search, recommendations, saved jobs.
    - **Companies**: Company Intelligence, culture, tech stacks, "Is this a fit?".
    - **Market Intelligence**: Growing roles, trending skills, hiring demand.
- **BUILD**
    - **Resume Studio**: Professional workspace, versions, job-specific optimization.
    - **Application AI**: Writing tools (Cover letters, recruiter messages, follow-ups).
- **DEVELOP**
    - **Skill Intelligence**: Capability matrix, gap analysis, proficiency tracking.
    - **Career Roadmap**: 30/60/90 day personalized growth plans.
    - **Learning Intelligence**: Personalized resources, progress tracking, assessments.
- **PREPARE**
    - **Interview Lab**: AI mock interviews (Behavioral, Technical, HR).
    - **Coding Lab**: Practice environment, AI code review, complexity analysis.
- **APPLICATIONS**: Tracking board (Kanban/List), timeline, status management.
- **CAREER COACH**: Contextual AI advisor (not a generic chatbot).
- **PROGRESS**: Analytics dashboard, response rates, skill growth trends.
- **PROFILE**: Unified source of truth (Identity, Experience, Skills, Goals).
- **NOTIFICATIONS**: Smart alerts for jobs, roadmap milestones, and follow-ups.

---

## B. User Journeys

### 1. The New User (Onboarding to Value)
- **Entry**: Lands on Home, clicks "Get Your Career Score".
- **Discovery**: Completes guided onboarding, uploads resume.
- **Aha! Moment**: Sees 74% Career Readiness score with specific gaps (e.g., "SQL", "AWS").
- **Activation**: Clicks "Build My Career Plan" and lands on the Career Command Center.

### 2. The Job Seeker (Discovery to Preparation)
- **Search**: Explores "Jobs" with AI Match highlighting 92% fit.
- **Detail**: Reviews "Your fit for this job" breakdown.
- **Action**: Clicks "Optimize Resume" (opens Resume Studio with job-specific suggestions).
- **Preparation**: Launches "Interview Lab" focused specifically on that company's culture.

---

## C. Navigation Architecture

### Sidebar (Desktop)
- **Global Groups**:
    - **Main**: Home, Career Coach
    - **Discover**: Jobs, Companies, Market
    - **Build**: Resume Studio, Application AI
    - **Develop**: Skill Intelligence, Roadmap, Learning
    - **Prepare**: Interview Lab, Coding Lab
    - **Track**: Applications, Progress
- **Footer**: Profile, Settings, Notifications (Badge)

### Mobile Navigation
- **Bottom Tab Bar**: Home, Jobs, Build, Coach, Profile.
- **Menu (Drawer)**: Full navigation hierarchy for deep tools.

---

## D. Evolved Obsidian Gold Design System

### Visual Language
- **Base**: Obsidian (#0B0B0B) to Charcoal (#1A1A1A).
- **Accent**: Burnished Gold (#D4AF37) for primary actions, scores, and AI highlights.
- **Typography**: 
    - *Newsreader*: Large headings, scores, expressive narrative.
    - *Inter/Geist*: UI labels, body text, data tables (Monospace for Coding Lab).
- **Components**: Rounded-md (8px), subtle borders (Obsidian-Light), generous whitespace.

### AI UX Patterns
- **AI Score**: Gold circular progress or large numerical value with "AI Verified" badge.
- **AI Insight**: A distinct, subtle gold-tinted callout box explaining *why* a recommendation is made.
- **AI Action**: Buttons with a subtle sparkle icon (e.g., "✨ Optimize for Job").

---

## E. Implementation Phases

- **PHASE 1: Foundation**: Redesign Landing Page, Navigation Shell, and Unified Profile.
- **PHASE 2: Command Center**: Build the Home "Career Command Center" and Career Coach interface.
- **PHASE 3: Discover & Apply**: Transform Job Search into "Discover" and create the Job Detail/Fit Analysis.
- **PHASE 4: Build**: Evolve Resume Builder into "Resume Studio" and launch Application AI.
- **PHASE 5: Develop & Learn**: Implement Skill Intelligence matrix and the Career Roadmap.
- **PHASE 6: Prepare**: Launch Interview Lab and Coding Lab.
- **PHASE 7: Analytics**: Finalize Career Progress and Market Intelligence dashboards.