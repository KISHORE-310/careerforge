import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding development data...");

  // 0. Company directory for the three companies already represented by the
  // seeded jobs below. GET /api/companies reads this table directly (see
  // src/server/routes/jobs.routes.ts's formatCompany) -- these are the only
  // companies referenced anywhere else in the seed data, so no additional
  // companies are invented here.
  const sampleCompanies = [
    {
      id: "company-stripe",
      name: "Stripe",
      industry: "Financial Infrastructure",
      headquarters: "San Francisco, CA",
      size: "5,000+",
      rating: 4.8,
      recommendRate: 94,
      hiringVelocity: "High",
      avgSalary: "$180k - $240k",
      techStack: ["Ruby", "TypeScript", "React", "Go", "PostgreSQL", "AWS"],
      culture: "Fast-paced, engineering-led, high ownership.",
      description: "Financial infrastructure for the internet. Stripe builds APIs powering payments globally.",
      openRolesCount: 1,
    },
    {
      id: "company-anthropic",
      name: "Anthropic",
      industry: "Artificial Intelligence",
      headquarters: "San Francisco, CA",
      size: "500-1,000",
      rating: 4.9,
      recommendRate: 98,
      hiringVelocity: "Very High",
      avgSalary: "$220k - $300k",
      techStack: ["Python", "PyTorch", "TypeScript", "Rust", "JAX", "Distributed Computing"],
      culture: "Research-driven, safety-focused, high technical bar.",
      description: "AI safety and research company dedicated to building reliable, interpretable, and steerable AI systems.",
      openRolesCount: 1,
    },
    {
      id: "company-vercel",
      name: "Vercel",
      industry: "Developer Tools / Cloud Infrastructure",
      headquarters: "San Francisco, CA",
      size: "300-500",
      rating: 4.7,
      recommendRate: 92,
      hiringVelocity: "High",
      avgSalary: "$165k - $215k",
      techStack: ["Next.js", "React", "TypeScript", "Rust", "Edge Infrastructure"],
      culture: "Remote-first, developer experience obsessed.",
      description: "The Frontend Cloud platform enabling developers to build and deploy high-speed web apps.",
      openRolesCount: 1,
    },
  ];

  const companyIdByName: Record<string, string> = {};
  for (const company of sampleCompanies) {
    const { id, ...rest } = company;
    await prisma.company.upsert({
      where: { id },
      update: rest,
      create: { id, ...rest },
    });
    companyIdByName[company.name] = id;
  }

  // 1. Job catalog.
  // Aligned to the schema: `companyName` (not `company`), a single `salary`
  // string (not salaryMin/salaryMax/salaryText), `skillsRequired` (not
  // `skills`), `sourceUrl` (not `applyUrl`), and `source` is the JobSource
  // enum ("catalog" | "live"), not a free-text value like "Direct".
  // `requirements` / `skillsRequired` / `benefits` are native Json columns and
  // are stored as arrays rather than JSON.stringify()d strings.
  const sampleJobs = [
    {
      id: "job-stripe-senior-full-stack-engineer",
      externalId: "seed-stripe-sse",
      title: "Senior Full Stack Engineer",
      companyName: "Stripe",
      location: "San Francisco, CA (Hybrid)",
      type: "Full-time",
      workplace: "Hybrid",
      salary: "$180k - $240k",
      experience: "5+ years",
      description:
        "Build robust, scalable financial infrastructure powering millions of global transactions.",
      requirements: [
        "5+ years of production experience with Node.js, TypeScript, and React",
        "Expertise in distributed systems, PostgreSQL, and high-throughput APIs",
        "Experience building mission-critical financial or SaaS systems",
      ],
      skillsRequired: ["React", "Node.js", "TypeScript", "PostgreSQL", "System Design", "AWS", "GraphQL"],
      benefits: ["Equity", "Health insurance", "Learning stipend"],
    },
    {
      id: "job-anthropic-ai-solutions-architect",
      externalId: "seed-anthropic-aisa",
      title: "AI Solutions Architect",
      companyName: "Anthropic",
      location: "San Francisco, CA (On-site)",
      type: "Full-time",
      workplace: "On-site",
      salary: "$220k - $300k",
      experience: "4+ years",
      description:
        "Design LLM workflows, context retrieval systems, and frontier AI safety evaluation architectures.",
      requirements: [
        "Deep familiarity with LLM orchestration, RAG patterns, and vector indexing",
        "Strong Python and TypeScript engineering capabilities",
        "Experience benchmarking model latency, tokens, and safety boundaries",
      ],
      skillsRequired: ["Python", "LLMs", "RAG", "Vector DBs", "TypeScript", "PyTorch"],
      benefits: ["Equity", "Health insurance", "Relocation support"],
    },
    {
      id: "job-vercel-frontend-platform-engineer",
      externalId: "seed-vercel-fpe",
      title: "Frontend Platform Engineer",
      companyName: "Vercel",
      location: "Remote (Global)",
      type: "Full-time",
      workplace: "Remote",
      salary: "$165k - $215k",
      experience: "3+ years",
      description:
        "Push the boundaries of web performance, edge rendering, and developer tooling frameworks.",
      requirements: [
        "Mastery of modern JavaScript/TypeScript, Next.js, and web standards",
        "Deep understanding of browser rendering performance, Core Web Vitals, and bundling",
        "Active open-source contributions or framework tooling experience",
      ],
      skillsRequired: ["React", "Next.js", "TypeScript", "Web Performance", "Tailwind CSS", "Vite"],
      benefits: ["Remote-first", "Equity", "Home office budget"],
    },
  ];

  for (const job of sampleJobs) {
    const { id, ...rest } = job;
    const companyId = companyIdByName[job.companyName];
    await prisma.job.upsert({
      where: { id },
      update: { ...rest, companyId },
      create: { id, ...rest, companyId },
    });
  }

  // 2. Learning catalog.
  // LearningResource requires skill / category / duration / estimatedHours /
  // difficulty / type / description / lessons. The previous seed referenced
  // estimatedHr, rating, enrolled, icon and modules -- none of which exist --
  // and the source objects did not define them, so every value was undefined.
  const learningModules = [
    {
      id: "mod-sys-design-1",
      skill: "System Design",
      title: "Distributed Systems Architecture",
      description:
        "Master CAP theorem, consensus algorithms, event-driven patterns, and multi-region data replication.",
      category: "System Design",
      duration: "6 weeks",
      estimatedHours: 24,
      difficulty: "Advanced",
      type: "course",
      lessons: [
        { id: "l1", title: "CAP theorem and consistency models" },
        { id: "l2", title: "Consensus: Raft and Paxos" },
        { id: "l3", title: "Event-driven architecture patterns" },
        { id: "l4", title: "Multi-region replication strategies" },
      ],
      quiz: null,
    },
  ];

  for (const mod of learningModules) {
    const { id, ...rest } = mod;
    await prisma.learningResource.upsert({
      where: { id },
      update: rest,
      create: { id, ...rest },
    });
  }

  // 3. Development test user.
  // User stores the display name in `fullName` and has no `role` column.
  // Profile has no `title` column; the equivalent field is `targetRole`, and
  // `targetSalary` is a String.
  const devPasswordHash = await bcrypt.hash("Password123!", 10);
  const devUser = await prisma.user.upsert({
    where: { email: "dev@careerforge.ai" },
    update: {},
    create: {
      id: "dev-user-001",
      email: "dev@careerforge.ai",
      passwordHash: devPasswordHash,
      fullName: "Alex Mercer",
      onboardingCompleted: true,
      profile: {
        create: {
          bio: "Building resilient distributed systems and intuitive AI interfaces.",
          location: "San Francisco, CA",
          targetRole: "Senior Full Stack Engineer",
          targetSalary: "195000",
          experienceLevel: "Senior",
          github: "https://github.com/alexmercer",
          linkedin: "https://linkedin.com/in/alexmercer",
        },
      },
    },
  });

  console.log(`Development database seeded successfully. Test user: ${devUser.email}`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
