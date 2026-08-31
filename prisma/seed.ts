import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding development data...");

  // 1. Seed Initial Job Catalog for dev exploration
  const sampleJobs = [
    {
      title: "Senior Full Stack Engineer",
      company: "Stripe",
      companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
      location: "San Francisco, CA (Hybrid)",
      type: "Full-time",
      workplace: "Hybrid",
      salaryMin: 180000,
      salaryMax: 240000,
      salaryText: "$180k - $240k",
      description: "Build robust, scalable financial infrastructure powering millions of global transactions.",
      requirements: JSON.stringify([
        "5+ years of production experience with Node.js, TypeScript, and React",
        "Expertise in distributed systems, PostgreSQL, and high-throughput APIs",
        "Experience building mission-critical financial or SaaS systems",
      ]),
      skills: JSON.stringify(["React", "Node.js", "TypeScript", "PostgreSQL", "System Design", "AWS", "GraphQL"]),
      experience: "5+ years",
      source: "Direct",
    },
    {
      title: "AI Solutions Architect",
      company: "Anthropic",
      companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
      location: "San Francisco, CA (On-site)",
      type: "Full-time",
      workplace: "On-site",
      salaryMin: 220000,
      salaryMax: 300000,
      salaryText: "$220k - $300k",
      description: "Design LLM workflows, context retrieval systems, and frontier AI safety evaluation architectures.",
      requirements: JSON.stringify([
        "Deep familiarity with LLM orchestration, RAG patterns, and vector indexing",
        "Strong Python and TypeScript engineering capabilities",
        "Experience benchmarking model latency, tokens, and safety boundaries",
      ]),
      skills: JSON.stringify(["Python", "LLMs", "RAG", "Vector DBs", "TypeScript", "PyTorch"]),
      experience: "4+ years",
      source: "Direct",
    },
    {
      title: "Frontend Platform Engineer",
      company: "Vercel",
      companyLogo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=60",
      location: "Remote (Global)",
      type: "Full-time",
      workplace: "Remote",
      salaryMin: 165000,
      salaryMax: 215000,
      salaryText: "$165k - $215k",
      description: "Push the boundaries of web performance, edge rendering, and developer tooling frameworks.",
      requirements: JSON.stringify([
        "Mastery of modern JavaScript/TypeScript, Next.js, and web standards",
        "Deep understanding of browser rendering performance, Core Web Vitals, and bundling",
        "Active open-source contributions or framework tooling experience",
      ]),
      skills: JSON.stringify(["React", "Next.js", "TypeScript", "Web Performance", "Tailwind CSS", "Vite"]),
      experience: "3+ years",
      source: "Direct",
    },
  ];

  for (const job of sampleJobs) {
    await prisma.job.upsert({
      where: { id: `job-${job.company.toLowerCase()}-${job.title.toLowerCase().replace(/\s+/g, "-")}` },
      update: job,
      create: {
        id: `job-${job.company.toLowerCase()}-${job.title.toLowerCase().replace(/\s+/g, "-")}`,
        ...job,
      },
    });
  }

  // 2. Seed Standard Learning Catalog
  const learningModules = [
    {
      id: "mod-sys-design-1",
      title: "Distributed Systems Architecture",
      description: "Master CAP theorem, consensus algorithms, event-driven patterns, and multi-region data replication.",
      category: "System Design",
      difficulty: "Advanced",
      estimatedHr: 8,
      rating: 4.9,
      enrolled: 1420,
      icon: "cpu",
      modules: JSON.stringify([
        "Fundamentals of High Availability & Fault Tolerance",
        "Consistent Hashing & Distributed Caching",
        "Message Queues, Kafka & Idempotency",
        "Database Partitioning & Read Replicas",
      ]),
      quiz: JSON.stringify([
        {
          question: "Which isolation level prevents phantom reads?",
          options: ["Read Committed", "Repeatable Read", "Serializable", "Read Uncommitted"],
          correct: 2,
        },
      ]),
    },
    {
      id: "mod-dsa-patterns",
      title: "Advanced Data Structures & Algorithms",
      description: "Crack FAANG coding rounds with sliding windows, monotonic stacks, graph DP, and trie structures.",
      category: "Algorithms",
      difficulty: "Intermediate",
      estimatedHr: 12,
      rating: 4.85,
      enrolled: 2850,
      icon: "code",
      modules: [
        "Two Pointer & Sliding Window Patterns",
        "Binary Search on Answer Space",
        "Graph Traversal & Topological Sort",
        "Dynamic Programming on Trees",
      ],
      quiz: JSON.stringify([
        {
          question: "What is the amortized time complexity of finding an item in a balanced Trie?",
          options: ["O(N)", "O(L) where L is key length", "O(log N)", "O(1)"],
          correct: 1,
        },
      ]),
    },
    {
      id: "mod-react-perf",
      title: "React 19 & High Performance Web",
      description: "Deep dive into concurrent mode, server components, compiler memoization, and Web Vitals.",
      category: "Frontend",
      difficulty: "Intermediate",
      estimatedHr: 6,
      rating: 4.92,
      enrolled: 1980,
      icon: "layers",
      modules: JSON.stringify([
        "Concurrent Rendering & Transitions",
        "React Server Components & Streaming",
        "Memory Leak Detection & Profiling",
        "Custom Hooks Architecture",
      ]),
    },
  ];

  for (const mod of learningModules) {
    await prisma.learningResource.upsert({
      where: { id: mod.id },
      update: {
        title: mod.title,
        description: mod.description,
        category: mod.category,
        difficulty: mod.difficulty,
        estimatedHr: mod.estimatedHr,
        rating: mod.rating,
        enrolled: mod.enrolled,
        icon: mod.icon,
        modules: typeof mod.modules === "string" ? mod.modules : JSON.stringify(mod.modules),
        quiz: mod.quiz || null,
      },
      create: {
        id: mod.id,
        title: mod.title,
        description: mod.description,
        category: mod.category,
        difficulty: mod.difficulty,
        estimatedHr: mod.estimatedHr,
        rating: mod.rating,
        enrolled: mod.enrolled,
        icon: mod.icon,
        modules: typeof mod.modules === "string" ? mod.modules : JSON.stringify(mod.modules),
        quiz: mod.quiz || null,
      },
    });
  }

  // 3. Seed Development Test User (only in seed, not on production startup)
  const devPasswordHash = await bcrypt.hash("Password123!", 10);
  const devUser = await prisma.user.upsert({
    where: { email: "dev@careerforge.ai" },
    update: {},
    create: {
      id: "dev-user-001",
      email: "dev@careerforge.ai",
      passwordHash: devPasswordHash,
      name: "Alex Mercer",
      role: "user",
      profile: {
        create: {
          title: "Senior Full Stack Engineer",
          bio: "Building resilient distributed systems and intuitive AI interfaces.",
          location: "San Francisco, CA",
          targetRole: "Senior Full Stack Engineer",
          targetSalary: 195000,
          experienceLevel: "Senior",
          github: "https://github.com/alexmercer",
          linkedin: "https://linkedin.com/in/alexmercer",
        },
      },
    },
  });

  console.log(`✅ Development database seeded successfully. Test user: ${devUser.email}`);
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
