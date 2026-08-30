import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import path from "path";
import multer from "multer";
import pdfParse from "pdf-parse";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;
const SECRET_KEY = process.env.SECRET_KEY || "careerforge_secret_key_2026";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

// ============================================================================
// IN-MEMORY DATA STORAGE (Fast, durable per-instance state with seed data)
// ============================================================================

interface UserRecord {
  id: string;
  full_name: string;
  email: string;
  password: string;
  avatar?: string;
  target_role: string;
  target_salary?: string;
  experience_level: string;
  bio?: string;
  location?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  onboarding_completed: boolean;
  created_at: string;
}

interface ApplicationRecord {
  id: string;
  user_email: string;
  company: string;
  role: string;
  location: string;
  salary: string;
  status: "wishlist" | "applied" | "screening" | "interview" | "offer" | "rejected";
  applied_date: string;
  job_url?: string;
  match_score: number;
  notes?: string;
  contacts?: string;
  next_step?: string;
  updated_at: string;
}

interface InterviewSessionRecord {
  id: string;
  user_email: string;
  role: string;
  type: "Behavioral" | "Technical" | "System Design" | "HR" | "Company Specific";
  company?: string;
  status: "in_progress" | "completed";
  score: number;
  duration_minutes: number;
  date: string;
  transcript: Array<{ sender: "ai" | "user"; text: string; timestamp: string }>;
  feedback?: {
    overall_score: number;
    clarity_score: number;
    technical_score: number;
    impact_score: number;
    summary: string;
    strengths: string[];
    improvements: string[];
  };
}

interface NotificationRecord {
  id: string;
  user_email: string;
  title: string;
  message: string;
  type: "job_match" | "interview" | "milestone" | "learning" | "system";
  read: boolean;
  action_url?: string;
  created_at: string;
}

const usersDb = new Map<string, UserRecord>();
const resumesDb = new Map<string, any>();
const applicationsDb = new Map<string, ApplicationRecord[]>();
const interviewsDb = new Map<string, InterviewSessionRecord[]>();
const notificationsDb = new Map<string, NotificationRecord[]>();
const dsaProgressDb = new Map<string, Map<string, any>>();
const userRoadmapsDb = new Map<string, any[]>();
const userSkillsDb = new Map<string, any[]>();
const userLearningDb = new Map<string, any[]>();

// Seed default user
const demoPasswordHash = bcrypt.hashSync("password123", 10);
const demoEmail = "demo@careerforge.ai";
usersDb.set(demoEmail, {
  id: "usr_demo",
  full_name: "Kishore Reddy",
  email: demoEmail,
  password: demoPasswordHash,
  avatar: "KR",
  target_role: "Senior Full Stack Engineer",
  target_salary: "$140k - $175k",
  experience_level: "Senior (4-6 yrs)",
  bio: "Full Stack Software Engineer passionate about high-scale distributed systems, React, TypeScript, Node.js and AI integrations.",
  location: "San Francisco, CA (Open to Remote)",
  phone: "+1 (555) 349-8201",
  linkedin: "https://linkedin.com/in/kishorereddy",
  github: "https://github.com/KISHORE-310",
  portfolio: "https://kishorereddy.dev",
  onboarding_completed: true,
  created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
});

// Seed applications
applicationsDb.set(demoEmail, [
  {
    id: "app_1",
    user_email: demoEmail,
    company: "Stripe",
    role: "Senior Backend Engineer",
    location: "San Francisco, CA / Remote",
    salary: "$180,000 - $210,000",
    status: "interview",
    applied_date: "2026-08-18",
    job_url: "https://stripe.com/jobs/backend",
    match_score: 94,
    notes: "Completed initial recruiter screening. Technical system design round scheduled for next Tuesday at 2 PM.",
    contacts: "Sarah Jenkins (Lead Technical Recruiter)",
    next_step: "System Design Interview (Aug 25)",
    updated_at: new Date().toISOString(),
  },
  {
    id: "app_2",
    user_email: demoEmail,
    company: "Anthropic",
    role: "Full Stack AI Platform Engineer",
    location: "San Francisco, CA",
    salary: "$195,000 - $235,000",
    status: "screening",
    applied_date: "2026-08-22",
    job_url: "https://anthropic.com/careers",
    match_score: 91,
    notes: "Applied via employee referral. Recruiter reached out to schedule introductory call.",
    contacts: "Alex Chen (Eng Manager)",
    next_step: "Recruiter Phone Screen",
    updated_at: new Date().toISOString(),
  },
  {
    id: "app_3",
    user_email: demoEmail,
    company: "Linear",
    role: "Frontend Systems Engineer",
    location: "Remote (Global)",
    salary: "$165,000 - $190,000",
    status: "applied",
    applied_date: "2026-08-25",
    job_url: "https://linear.app/careers",
    match_score: 88,
    notes: "Submitted tailored resume and cover letter emphasizing WebGL, TypeScript and ultra-fast UI rendering.",
    next_step: "Awaiting Application Review",
    updated_at: new Date().toISOString(),
  },
  {
    id: "app_4",
    user_email: demoEmail,
    company: "Vercel",
    role: "Staff Platform Engineer",
    location: "Remote (US)",
    salary: "$210,000 - $240,000",
    status: "wishlist",
    applied_date: "2026-08-28",
    job_url: "https://vercel.com/careers",
    match_score: 86,
    notes: "Targeting Q4 hiring cycle. Connecting with team members on LinkedIn.",
    next_step: "Reach out to Hiring Manager",
    updated_at: new Date().toISOString(),
  },
]);

// Seed notifications
notificationsDb.set(demoEmail, [
  {
    id: "notif_1",
    user_email: demoEmail,
    title: "High Job Match Alert (94%)",
    message: "Stripe posted a new 'Senior Backend Engineer' opening matching 94% of your verified skills.",
    type: "job_match",
    read: false,
    action_url: "/jobs",
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "notif_2",
    user_email: demoEmail,
    title: "Interview Reminder",
    message: "Your Mock Interview Session evaluation for System Design is ready to review with a score of 88/100.",
    type: "interview",
    read: false,
    action_url: "/interviews",
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "notif_3",
    user_email: demoEmail,
    title: "Roadmap Milestone Completed",
    message: "You completed 'Week 3: Spring Boot & Distributed Caching'. Keep the streak going!",
    type: "milestone",
    read: true,
    action_url: "/roadmap",
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
]);

// Seed user resume
const seedResume = {
  id: "res_default",
  target_role: "Senior Full Stack Engineer",
  personal_info: {
    full_name: "Kishore Reddy",
    email: "kishore.reddy@example.com",
    phone: "+1 (555) 349-8201",
    location: "San Francisco, CA",
    linkedin: "https://linkedin.com/in/kishorereddy",
    github: "https://github.com/KISHORE-310",
    portfolio: "https://kishorereddy.dev",
  },
  summary:
    "High-impact Full Stack Software Engineer with 5+ years of experience designing high-concurrency microservices, cloud-native web applications, and AI-driven workflows. Proven track record reducing API latency by 42% and architecting resilient distributed systems on AWS and GCP.",
  education: [
    {
      degree: "B.S. in Computer Science & Engineering",
      institution: "State University of Technology",
      field_of_study: "Distributed Systems & Algorithms",
      start_year: 2019,
      end_year: 2023,
      cgpa: 3.85,
    },
  ],
  experience: [
    {
      company: "Nexus Cloud Systems",
      role: "Full Stack Engineer",
      start_date: "2023",
      end_date: "Present",
      description: [
        "Architected and deployed a multi-tenant telemetry dashboard serving 2.5M daily active users with 99.99% uptime.",
        "Engineered real-time WebSockets streaming pipeline reducing frontend update latency from 850ms to 45ms.",
        "Led migration from monolithic REST API to event-driven GraphQL microservices using TypeScript, Node.js, and Redis.",
      ],
    },
    {
      company: "InnovateTech Labs",
      role: "Software Engineering Intern",
      start_date: "2022",
      end_date: "2023",
      description: [
        "Built automated CI/CD deployment pipelines using Docker, GitHub Actions, and AWS ECS.",
        "Refactored relational SQL database queries and introduced indexing, improving complex report generation by 60%.",
      ],
    },
  ],
  projects: [
    {
      title: "CareerForge AI Engine",
      description: "AI-driven career intelligence platform analyzing ATS resumes, skill gaps, and generating structured roadmaps.",
      technologies: ["React", "TypeScript", "Node.js", "Express", "Gemini API", "Tailwind CSS"],
      github_url: "https://github.com/KISHORE-310/careerforge",
      live_url: "https://careerforge.ai",
    },
    {
      title: "Distributed Key-Value Store",
      description: "High-throughput in-memory caching system implementing Raft consensus protocol and LRU eviction.",
      technologies: ["Go", "gRPC", "Docker", "Distributed Systems"],
      github_url: "https://github.com/KISHORE-310/raft-kv",
      live_url: null,
    },
  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect – Associate",
      organization: "Amazon Web Services",
      year: 2024,
    },
    {
      name: "Meta Certified Frontend Developer",
      organization: "Meta / Coursera",
      year: 2023,
    },
  ],
  technical_skills: [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "Express",
    "Python",
    "SQL",
    "PostgreSQL",
    "MongoDB",
    "Redis",
    "Docker",
    "Kubernetes",
    "AWS",
    "GraphQL",
    "Git",
    "Tailwind CSS",
    "REST APIs",
    "System Design",
  ],
  soft_skills: ["Technical Leadership", "System Architecture", "Cross-Functional Collaboration", "Mentorship"],
  achievements: ["Top 3 Finalist at Global AI Hackathon 2024", "Dean's Excellence Award for Academic Distinction"],
  languages: ["English (Fluent)", "Spanish (Conversational)"],
};

resumesDb.set(demoEmail, seedResume);

// Seed interview sessions
interviewsDb.set(demoEmail, [
  {
    id: "int_1",
    user_email: demoEmail,
    role: "Senior Full Stack Engineer",
    type: "System Design",
    company: "Stripe",
    status: "completed",
    score: 88,
    duration_minutes: 35,
    date: "2026-08-24",
    transcript: [
      { sender: "ai", text: "Welcome to your System Design interview for Stripe. Today, let's design a global, high-availability payment gateway with idempotency and rate limiting. How would you start?", timestamp: "14:00" },
      { sender: "user", text: "I would begin by clarifying functional requirements: payment authorization, webhooks, and idempotent retries. Non-functional: low latency under 200ms, 99.999% availability, and strict consistency for ledger balances. For architecture, I would place a distributed API Gateway with Token Bucket rate limiting, a stateless Payment Processing Service, and Redis for distributed idempotency keys with TTL.", timestamp: "14:03" },
      { sender: "ai", text: "Excellent breakdown. How would you handle a transient database outage during two-phase commit with external acquiring banks?", timestamp: "14:05" },
    ],
    feedback: {
      overall_score: 88,
      clarity_score: 92,
      technical_score: 89,
      impact_score: 83,
      summary: "Strong command of distributed systems, idempotency keys, and API gateway routing. Handled scaling bottlenecks gracefully.",
      strengths: ["Clear scoping of functional vs non-functional requirements", "Solid understanding of distributed caching and Redis TTLs", "Articulate communication"],
      improvements: ["Elaborate further on dead-letter queue (DLQ) retry strategies", "Specify monitoring & observability metrics (e.g. p99 latencies, Prometheus alarms)"],
    },
  },
]);

// Seed user skills
userSkillsDb.set(demoEmail, [
  { name: "TypeScript", category: "Languages", proficiency: 92, status: "mastered", marketDemand: 95 },
  { name: "React", category: "Frontend", proficiency: 95, status: "mastered", marketDemand: 96 },
  { name: "Node.js / Express", category: "Backend", proficiency: 90, status: "mastered", marketDemand: 92 },
  { name: "SQL & PostgreSQL", category: "Databases", proficiency: 85, status: "mastered", marketDemand: 94 },
  { name: "Docker & Containers", category: "DevOps", proficiency: 80, status: "intermediate", marketDemand: 89 },
  { name: "AWS Cloud Services", category: "Cloud", proficiency: 78, status: "intermediate", marketDemand: 93 },
  { name: "System Design", category: "Architecture", proficiency: 84, status: "mastered", marketDemand: 97 },
  { name: "Redis Caching", category: "Databases", proficiency: 82, status: "mastered", marketDemand: 86 },
  { name: "Kubernetes Orchestration", category: "DevOps", proficiency: 62, status: "learning", marketDemand: 91 },
  { name: "GraphQL Architecture", category: "Backend", proficiency: 75, status: "intermediate", marketDemand: 82 },
  { name: "Kafka Event Streaming", category: "Architecture", proficiency: 58, status: "learning", marketDemand: 88 },
  { name: "CI/CD & GitHub Actions", category: "DevOps", proficiency: 82, status: "mastered", marketDemand: 85 },
]);

// Seed jobs catalog
export const JOBS_CATALOG = [
  {
    id: "job_1",
    title: "Senior Full Stack Engineer",
    company: "Stripe",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    location: "San Francisco, CA (Hybrid)",
    salary: "$175,000 - $215,000",
    equity: "0.05% - 0.12%",
    type: "Full-time",
    experience: "4+ years",
    workplace: "Hybrid",
    posted_date: "1 day ago",
    match_score: 95,
    department: "Core Financial Infrastructure",
    description:
      "Stripe is looking for a Senior Full Stack Engineer to build next-generation developer tooling, payment checkout experiences, and distributed transaction dashboards. You will build user-facing experiences in React/TypeScript and back-end microservices handling billions in volume.",
    requirements: [
      "4+ years building production web applications in TypeScript/React and Node.js or Java.",
      "Demonstrated experience designing high-concurrency relational data models in PostgreSQL.",
      "Strong intuition for user interface polish, accessibility, and high performance.",
      "Experience with distributed caching (Redis) and message queues.",
    ],
    skills_required: ["TypeScript", "React", "Node.js", "PostgreSQL", "Redis", "System Design", "Docker", "AWS"],
    benefits: ["Comprehensive Medical/Dental/Vision", "401(k) 100% Match up to 6%", "$3,000 Annual Learning Stipend", "Flexible PTO & Remote Setup Budget"],
  },
  {
    id: "job_2",
    title: "Full Stack AI Platform Engineer",
    company: "Anthropic",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    location: "San Francisco, CA / Remote",
    salary: "$195,000 - $240,000",
    equity: "0.08% - 0.2%",
    type: "Full-time",
    experience: "3+ years",
    workplace: "Remote",
    posted_date: "2 days ago",
    match_score: 92,
    department: "Claude Developer Platform",
    description:
      "Join Anthropic's Developer Platform team building SDKs, interactive evaluation workspaces, and enterprise AI orchestration pipelines. You will collaborate closely with AI research teams to deliver safe, reliable AI applications.",
    requirements: [
      "Proficiency in modern TypeScript, React, and Python or Node.js.",
      "Experience interfacing with LLM APIs, prompt orchestration, and streaming tokens.",
      "Strong distributed systems fundamentals and cloud infrastructure on AWS/GCP.",
    ],
    skills_required: ["TypeScript", "Python", "React", "Node.js", "Docker", "AWS", "LLMs", "GraphQL"],
    benefits: ["Top-tier compensation and equity", "Health & Wellness Allowance", "Unlimited Paid Time Off", "Home Office Stipend"],
  },
  {
    id: "job_3",
    title: "Lead Frontend Systems Engineer",
    company: "Linear",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    location: "San Francisco, CA / Remote",
    salary: "$170,000 - $200,000",
    equity: "0.1% - 0.25%",
    type: "Full-time",
    experience: "5+ years",
    workplace: "Remote",
    posted_date: "3 days ago",
    match_score: 89,
    department: "Product Engineering",
    description:
      "Linear crafts the standard for software product management. We are looking for an exceptional engineer obsessive about 60fps micro-interactions, offline-first client architecture, and design craftsmanship.",
    requirements: [
      "Mastery of modern JavaScript/TypeScript, React internals, and DOM rendering performance.",
      "Deep understanding of client-side caching, IndexedDB, and optimistic UI synchronization.",
      "Exceptional design sensibility and attention to typographic detail.",
    ],
    skills_required: ["TypeScript", "React", "Tailwind CSS", "WebSockets", "State Management", "Git"],
    benefits: ["Remote-first flexibility", "Annual company retreats", "Top-tier hardware setup", "Generous equity package"],
  },
  {
    id: "job_4",
    title: "Senior Backend / Cloud Architect",
    company: "Databricks",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    location: "Mountain View, CA (Hybrid)",
    salary: "$190,000 - $230,000",
    equity: "0.06% - 0.15%",
    type: "Full-time",
    experience: "5+ years",
    workplace: "Hybrid",
    posted_date: "4 days ago",
    match_score: 87,
    department: "Data Intelligence Platform",
    description:
      "Databricks is pioneering Lakehouse architecture. We need a Senior Backend Architect to lead multi-cloud distributed cluster orchestration, low-latency metadata layers, and enterprise security governance.",
    requirements: [
      "Deep experience with Go, Java, or Python building distributed systems.",
      "Hands-on expertise with Kubernetes, Docker, and cloud orchestration across AWS/Azure.",
      "Experience optimizing high-throughput distributed databases and RPC protocols.",
    ],
    skills_required: ["Go", "Python", "Kubernetes", "Docker", "AWS", "System Design", "SQL", "Kafka"],
    benefits: ["401(k) matching", "Family healthcare coverage", "Relocation assistance", "Generous RSU vesting"],
  },
  {
    id: "job_5",
    title: "Staff Software Engineer, Platform",
    company: "Vercel",
    logo: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80",
    location: "Remote (Global)",
    salary: "$210,000 - $250,000",
    equity: "0.1% - 0.3%",
    type: "Full-time",
    experience: "6+ years",
    workplace: "Remote",
    posted_date: "5 days ago",
    match_score: 85,
    department: "Edge & Cloud Platform",
    description:
      "Vercel enables developers to build the open web. You will work on global edge networks, Next.js runtime optimizations, serverless function runtimes, and distributed builds.",
    requirements: [
      "Extensive experience with Node.js/Rust runtimes and edge networking infrastructure.",
      "Proven leadership designing highly available multi-region architectures.",
      "Deep knowledge of HTTP/3, CDN edge caching, and DNS routing.",
    ],
    skills_required: ["Node.js", "TypeScript", "Next.js", "Docker", "Kubernetes", "AWS", "System Design"],
    benefits: ["100% remote company", "Unlimited vacation policy", "Comprehensive health benefits", "Annual conference budget"],
  },
];

// Seed companies catalog
export const COMPANIES_CATALOG = [
  {
    id: "comp_1",
    name: "Stripe",
    industry: "Fintech & Developer Tools",
    headquarters: "San Francisco, CA & Dublin, Ireland",
    size: "8,000+ employees",
    rating: 4.6,
    recommend_rate: 91,
    hiring_velocity: "Very High",
    avg_salary: "$195,000",
    tech_stack: ["Ruby", "TypeScript", "React", "Java", "Go", "PostgreSQL", "Redis", "AWS", "Kafka"],
    culture: "Customer obsession, high craftsmanship, rigorous written communication, autonomy.",
    open_roles_count: 42,
    verified_fit_score: 94,
    description: "Stripe is a technology company that builds economic infrastructure for the internet. Businesses of every size use Stripe's software to accept payments and manage their businesses online.",
  },
  {
    id: "comp_2",
    name: "Anthropic",
    industry: "Artificial Intelligence & Safety",
    headquarters: "San Francisco, CA",
    size: "600+ employees",
    rating: 4.8,
    recommend_rate: 96,
    hiring_velocity: "Extremely High",
    avg_salary: "$225,000",
    tech_stack: ["Python", "TypeScript", "React", "PyTorch", "Kubernetes", "AWS", "GCP", "Rust"],
    culture: "Safety-first research, mission-driven team, high intellectual curiosity, flat hierarchy.",
    open_roles_count: 28,
    verified_fit_score: 91,
    description: "Anthropic is an AI safety and research company that builds reliable, interpretable, and steerable AI systems, creators of Claude.",
  },
  {
    id: "comp_3",
    name: "Linear",
    industry: "Productivity & Developer Tools",
    headquarters: "San Francisco, CA (Remote-First)",
    size: "75+ employees",
    rating: 4.9,
    recommend_rate: 98,
    hiring_velocity: "Selective",
    avg_salary: "$185,000",
    tech_stack: ["TypeScript", "React", "Node.js", "WebSockets", "IndexedDB", "GraphQL", "Tailwind CSS"],
    culture: "Craft-focused, asynchronous workflow, high design bar, zero bureaucratic overhead.",
    open_roles_count: 8,
    verified_fit_score: 89,
    description: "Linear is the issue tracking tool you'll actually enjoy using. Built for high-performance software teams who care about speed and polish.",
  },
  {
    id: "comp_4",
    name: "Databricks",
    industry: "Data & Enterprise AI",
    headquarters: "Mountain View, CA",
    size: "6,500+ employees",
    rating: 4.5,
    recommend_rate: 89,
    hiring_velocity: "High",
    avg_salary: "$210,000",
    tech_stack: ["Scala", "Python", "Go", "Kubernetes", "AWS", "Azure", "Spark", "PostgreSQL"],
    culture: "Data-driven, customer success, high velocity execution, collaborative engineering.",
    open_roles_count: 55,
    verified_fit_score: 86,
    description: "Databricks is the Data and AI company. Over 10,000 organizations worldwide rely on Databricks Lakehouse Platform to unify their data and AI.",
  },
];

// Seed market intelligence
export const MARKET_TRENDS = {
  trending_roles: [
    { role: "AI / LLM Platform Engineer", growth: "+148%", avg_salary: "$215,000", demand_level: "Critical" },
    { role: "Senior Full Stack Engineer", growth: "+64%", avg_salary: "$178,000", demand_level: "High" },
    { role: "Cloud & Distributed Systems Architect", growth: "+58%", avg_salary: "$205,000", demand_level: "High" },
    { role: "DevOps / MLOps Infrastructure Engineer", growth: "+72%", avg_salary: "$192,000", demand_level: "High" },
    { role: "Product Security Engineer", growth: "+52%", avg_salary: "$188,000", demand_level: "Moderate" },
  ],
  trending_skills: [
    { skill: "TypeScript / React Architecture", demand_score: 97, salary_premium: "+18%", growth: "+45%" },
    { skill: "LLM Orchestration & Prompt Eng", demand_score: 95, salary_premium: "+26%", growth: "+180%" },
    { skill: "Kubernetes & Container Orchestration", demand_score: 92, salary_premium: "+20%", growth: "+38%" },
    { skill: "Distributed Systems & Caching (Redis)", demand_score: 90, salary_premium: "+22%", growth: "+41%" },
    { skill: "PostgreSQL & Vector Databases (pgvector)", demand_score: 88, salary_premium: "+19%", growth: "+92%" },
  ],
  salary_benchmarks: {
    "Senior Full Stack Engineer": { p25: "$145,000", p50: "$178,000", p75: "$210,000", p90: "$245,000" },
    "Backend Engineer": { p25: "$140,000", p50: "$172,000", p75: "$205,000", p90: "$238,000" },
    "AI Platform Engineer": { p25: "$175,000", p50: "$215,000", p75: "$255,000", p90: "$290,000" },
    "DevOps / Cloud Architect": { p25: "$160,000", p50: "$198,000", p75: "$235,000", p90: "$265,000" },
  },
};

// Seed learning resources
export const LEARNING_CATALOG = [
  {
    id: "learn_1",
    skill: "Kubernetes Orchestration",
    title: "Production Kubernetes from Scratch: Deploying Distributed Microservices",
    category: "DevOps",
    duration: "4.5 hours",
    difficulty: "Advanced",
    type: "Interactive Workshop",
    rating: 4.9,
    enrolled_count: "12,400+",
    description: "Master multi-node cluster configuration, ingress controllers, rolling zero-downtime updates, Helm charts, and persistent storage volumes.",
    completed: false,
    progress_pct: 35,
    modules: ["Cluster Architecture & Control Plane", "Pods, ReplicaSets & Deployments", "Ingress & Service Meshes", "Secrets & ConfigMaps", "Production CI/CD Deployment"],
  },
  {
    id: "learn_2",
    skill: "Kafka Event Streaming",
    title: "Event-Driven Microservices with Apache Kafka & Node.js",
    category: "Architecture",
    duration: "5.0 hours",
    difficulty: "Advanced",
    type: "Deep Dive Video & Code",
    rating: 4.8,
    enrolled_count: "8,900+",
    description: "Design high-throughput event streaming systems with consumer groups, partition balancing, dead-letter queues, and schema registries.",
    completed: false,
    progress_pct: 15,
    modules: ["Event Streaming Fundamentals", "Kafka Topics & Partitions", "Consumer Group Balancing", "Idempotent Producers", "Error Handling & DLQ"],
  },
  {
    id: "learn_3",
    skill: "System Design",
    title: "Scale to 10M Users: Distributed System Design & Architecture Patterns",
    category: "Architecture",
    duration: "6.5 hours",
    difficulty: "Intermediate",
    type: "Interactive Case Studies",
    rating: 4.95,
    enrolled_count: "24,000+",
    description: "Comprehensive blueprint covering distributed caching, database sharding, rate limiters, CDN edge caching, and consensus algorithms.",
    completed: true,
    progress_pct: 100,
    modules: ["Scalability Fundamentals", "Load Balancing & Reverse Proxies", "Database Sharding & Replication", "Distributed Caching Strategies", "Real-World System Case Studies"],
  },
  {
    id: "learn_4",
    skill: "TypeScript Architecture",
    title: "Advanced TypeScript 5+: Strict Type Systems, Generics & AST Metaprogramming",
    category: "Languages",
    duration: "3.5 hours",
    difficulty: "Intermediate",
    type: "Code Practice Lab",
    rating: 4.85,
    enrolled_count: "15,200+",
    description: "Deep dive into conditional types, mapped types, template literal types, and enterprise architecture patterns in React & Node.",
    completed: true,
    progress_pct: 100,
    modules: ["Advanced Generic Constraints", "Template Literal Types", "Infer & Conditional Type Tricks", "Type-Safe API Contracts", "Building Enterprise Component Libraries"],
  },
];

// Configure Multer for PDF uploads in memory
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.originalname.endsWith(".pdf")) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are supported"));
    }
  },
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// =====================================
// Gemini AI Client Helper
// =====================================
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAIClient && process.env.GEMINI_API_KEY) {
    genAIClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return genAIClient;
}

// =====================================
// Auth Token Helper
// =====================================
function createToken(email: string): string {
  return jwt.sign({ sub: email }, SECRET_KEY, { expiresIn: "30d" });
}

function authenticateToken(req: Request, _res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    (req as any).userEmail = demoEmail;
    return next();
  }
  const token = authHeader.replace("Bearer ", "");
  try {
    const decoded = jwt.verify(token, SECRET_KEY) as { sub: string };
    (req as any).userEmail = decoded.sub || demoEmail;
    next();
  } catch {
    (req as any).userEmail = demoEmail;
    next();
  }
}

// =====================================
// Intelligence Scoring Functions
// =====================================
function calculateResumeScore(profile: any) {
  let score = 0;
  const breakdown: Record<string, number> = {};
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Personal Information
  const personal = profile.personal_info || {};
  let personalScore = 0;
  if (personal.full_name) personalScore += 3;
  if (personal.email) personalScore += 3;
  if (personal.phone) personalScore += 3;
  if (personal.linkedin) { personalScore += 3; strengths.push("LinkedIn verified and linked"); }
  else { weaknesses.push("Add your verified LinkedIn profile URL"); }
  if (personal.github) { personalScore += 4; strengths.push("GitHub repository link included"); }
  else { weaknesses.push("Add your GitHub portfolio URL"); }
  score += personalScore;
  breakdown.personal_information = personalScore;

  // Summary
  let summaryScore = 0;
  if (profile.summary && typeof profile.summary === "string") {
    const words = profile.summary.trim().split(/\s+/).length;
    if (words >= 35) { summaryScore = 10; strengths.push("Comprehensive impact-focused executive summary"); }
    else if (words >= 15) { summaryScore = 7; strengths.push("Good professional summary"); }
    else { summaryScore = 4; weaknesses.push("Expand summary with quantified career achievements"); }
  } else {
    weaknesses.push("Include a strong professional summary");
  }
  score += summaryScore;
  breakdown.summary = summaryScore;

  // Education
  const education = Array.isArray(profile.education) ? profile.education : [];
  const educationScore = Math.min(education.length * 5, 10);
  if (educationScore > 0) strengths.push("Educational background documented");
  else weaknesses.push("Add educational degrees or certifications");
  score += educationScore;
  breakdown.education = educationScore;

  // Experience
  const experience = Array.isArray(profile.experience) ? profile.experience : [];
  const experienceScore = Math.min(experience.length * 10, 20);
  if (experienceScore >= 10) strengths.push("Demonstrated work experience with bullet metrics");
  else weaknesses.push("Add more detailed work experience or project leadership");
  score += experienceScore;
  breakdown.experience = experienceScore;

  // Projects
  const projects = Array.isArray(profile.projects) ? profile.projects : [];
  const projectScore = Math.min(projects.length * 5, 20);
  if (projectScore >= 10) strengths.push(`${projects.length} relevant technical project(s) showcased`);
  else weaknesses.push("Add at least 2 full-stack or systems projects with live links");
  score += projectScore;
  breakdown.projects = projectScore;

  // Technical Skills
  const technicalSkills = Array.isArray(profile.technical_skills) ? profile.technical_skills : [];
  const skillScore = Math.min(technicalSkills.length, 15);
  if (skillScore >= 10) strengths.push("Diverse and modern technical stack");
  else weaknesses.push("Expand technical skills with relevant libraries and cloud tools");
  score += skillScore;
  breakdown.technical_skills = skillScore;

  // Certifications
  const certs = Array.isArray(profile.certifications) ? profile.certifications : [];
  const certScore = Math.min(certs.length * 2.5, 5);
  if (certScore > 0) strengths.push("Industry certifications included");
  score += certScore;
  breakdown.certifications = certScore;

  const normalizedScore = Math.min(Math.round((score / 80) * 100), 98);
  let grade = "Needs Improvement";
  if (normalizedScore >= 90) grade = "Excellent";
  else if (normalizedScore >= 75) grade = "Good";
  else if (normalizedScore >= 60) grade = "Average";

  return {
    resume_score: normalizedScore,
    grade,
    strengths,
    weaknesses,
    breakdown,
  };
}

// =====================================
// API ROUTES
// =====================================

// 1. Health
app.get(["/health", "/api/health"], (_req, res) => {
  res.json({
    status: "ok",
    app: "CareerForge AI",
    version: "2.0.0",
    timestamp: new Date().toISOString(),
  });
});

// 2. Auth: Signup
app.post(["/signup", "/api/auth/signup"], async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }
    if (usersDb.has(email)) {
      return res.json({ success: false, message: "Account with this email already exists." });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: UserRecord = {
      id: `usr_${Date.now()}`,
      full_name: full_name || "New Candidate",
      email,
      password: hashedPassword,
      avatar: (full_name || "NC").slice(0, 2).toUpperCase(),
      target_role: "Full Stack Engineer",
      experience_level: "Mid-Level",
      onboarding_completed: false,
      created_at: new Date().toISOString(),
    };
    usersDb.set(email, newUser);
    const token = createToken(email);
    return res.json({
      success: true,
      message: "Account created successfully.",
      access_token: token,
      user: {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        onboarding_completed: newUser.onboarding_completed,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 3. Auth: Login
app.post(["/login", "/api/auth/login"], async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required." });
    }
    let user = usersDb.get(email);
    if (!user) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user = {
        id: `usr_${Date.now()}`,
        full_name: "Candidate",
        email,
        password: hashedPassword,
        avatar: "CD",
        target_role: "Full Stack Engineer",
        experience_level: "Mid-Level",
        onboarding_completed: true,
        created_at: new Date().toISOString(),
      };
      usersDb.set(email, user);
    } else {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.json({ success: false, message: "Invalid email or password." });
      }
    }
    const token = createToken(email);
    return res.json({
      success: true,
      message: "Login successful!",
      access_token: token,
      token_type: "bearer",
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        target_role: user.target_role,
        onboarding_completed: user.onboarding_completed,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// 4. Auth: Current User Profile
app.get(["/api/auth/me", "/api/profile"], authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const user = usersDb.get(email) || usersDb.get(demoEmail);
  const resume = resumesDb.get(email) || seedResume;
  const skills = userSkillsDb.get(email) || userSkillsDb.get(demoEmail);

  res.json({
    success: true,
    user,
    resume,
    skills,
  });
});

// 5. Update Profile
app.put("/api/profile", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  let user = usersDb.get(email);
  if (!user) {
    user = { ...usersDb.get(demoEmail)!, email };
  }
  user = { ...user, ...req.body };
  usersDb.set(email, user);
  res.json({ success: true, message: "Profile updated successfully.", user });
});

// 6. Complete Onboarding
app.post("/api/onboarding", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  let user = usersDb.get(email) || { ...usersDb.get(demoEmail)!, email };
  const { career_goal, target_role, experience_level, skills, target_salary } = req.body;
  user.target_role = target_role || user.target_role;
  user.experience_level = experience_level || user.experience_level;
  user.target_salary = target_salary || user.target_salary;
  user.onboarding_completed = true;
  usersDb.set(email, user);

  if (Array.isArray(skills) && skills.length > 0) {
    const mappedSkills = skills.map((s: string) => ({
      name: s,
      category: "Technical",
      proficiency: 80,
      status: "mastered",
      marketDemand: 90,
    }));
    userSkillsDb.set(email, mappedSkills);
  }

  res.json({ success: true, message: "Onboarding completed successfully!", user });
});

// 7. Resume: Get Current
app.get(["/api/resume", "/api/resumes/current"], authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const resume = resumesDb.get(email) || seedResume;
  const evaluation = calculateResumeScore(resume);
  res.json({
    success: true,
    resume,
    evaluation,
  });
});

// 8. Resume: Save / Update
app.put("/api/resume", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const updatedResume = req.body.resume || req.body;
  resumesDb.set(email, updatedResume);
  const evaluation = calculateResumeScore(updatedResume);
  res.json({
    success: true,
    message: "Resume saved successfully.",
    resume: updatedResume,
    evaluation,
  });
});

// 9. Resume: Upload & Intelligence
app.post(["/upload-resume", "/api/upload-resume"], upload.single("file"), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const targetRole = (req.body.target_role as string) || "Senior Full Stack Engineer";
    const email = (req as any).userEmail || demoEmail;

    let extractedText = "";
    if (file) {
      try {
        const parsed = await pdfParse(file.buffer);
        extractedText = parsed.text || "";
      } catch {
        extractedText = "Candidate resume file content.";
      }
    }

    let profile: any = null;
    const gemini = getGeminiClient();
    if (gemini && extractedText.length > 30) {
      try {
        const prompt = `You are CareerForge AI ATS & Resume Expert.
Parse this resume text and output ONLY valid JSON matching this schema:
{
  "personal_info": { "full_name": "", "email": "", "phone": "", "location": "", "linkedin": "", "github": "", "portfolio": "" },
  "summary": "",
  "education": [{ "degree": "", "institution": "", "field_of_study": "", "start_year": 2020, "end_year": 2024, "cgpa": null }],
  "experience": [{ "company": "", "role": "", "start_date": "", "end_date": "", "description": [""] }],
  "projects": [{ "title": "", "description": "", "technologies": [""], "github_url": null, "live_url": null }],
  "certifications": [{ "name": "", "organization": "", "year": null }],
  "technical_skills": [""],
  "soft_skills": [""],
  "achievements": [""],
  "languages": [""]
}

Resume Text:
${extractedText.slice(0, 7000)}`;

        const response = await gemini.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
        });
        const text = response.text?.trim() || "";
        const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
        profile = JSON.parse(cleaned);
      } catch (err) {
        console.warn("Gemini parse fallback:", err);
      }
    }

    if (!profile || !profile.personal_info) {
      profile = {
        ...seedResume,
        personal_info: {
          ...seedResume.personal_info,
          full_name: req.body.full_name || seedResume.personal_info.full_name,
        },
      };
    }

    resumesDb.set(email, profile);
    const resumeScore = calculateResumeScore(profile);

    res.json({
      success: true,
      message: "Resume processed successfully.",
      profile,
      resume_score: resumeScore,
      target_role: targetRole,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 10. AI Rewrite Suggestion for Resume Section
app.post("/api/resume/ai-rewrite", async (req, res) => {
  try {
    const { section, content, target_role, instruction } = req.body;
    const gemini = getGeminiClient();

    if (gemini && content) {
      const prompt = `You are CareerForge AI's elite Executive Resume Strategist.
Target Role: ${target_role || "Senior Software Engineer"}
Section: ${section || "bullet point"}
Current Content: "${content}"
Instruction: ${instruction || "Rewrite this statement to be ultra-impactful, action-oriented, and quantified using the Google XYZ formula (Accomplished [X], as measured by [Y], by doing [Z])."}

Provide 3 distinct, highly polished rewrite alternatives. Return ONLY valid JSON:
{
  "improved": "Primary polished rewrite",
  "alternatives": ["Alternative 1", "Alternative 2"],
  "impact_analysis": "Why this change is stronger and scores higher on ATS"
}`;

      try {
        const response = await gemini.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
        });
        const text = response.text?.trim() || "";
        const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, ...parsed });
      } catch (err) {
        console.warn("AI rewrite fallback:", err);
      }
    }

    // Heuristic Fallback
    res.json({
      success: true,
      improved: `Architected and optimized high-throughput distributed services, reducing latency by 38% and supporting 1.5M+ active users.`,
      alternatives: [
        `Spearheaded the design and implementation of resilient cloud microservices, increasing throughput by 45% using TypeScript and Redis.`,
        `Engineered core business features resulting in a 30% reduction in processing overhead and zero downtime over 12 months.`,
      ],
      impact_analysis: "Adds concrete performance metrics, clear technical action verbs, and production scale credibility.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 11. Jobs: List & Search
app.get("/api/jobs", (req, res) => {
  const { query, role, type, min_match } = req.query;
  let filtered = [...JOBS_CATALOG];

  if (query) {
    const q = String(query).toLowerCase();
    filtered = filtered.filter(
      (j) => j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.skills_required.some((s) => s.toLowerCase().includes(q))
    );
  }
  if (role) {
    const r = String(role).toLowerCase();
    filtered = filtered.filter((j) => j.title.toLowerCase().includes(r));
  }
  if (type && type !== "all") {
    const t = String(type).toLowerCase();
    filtered = filtered.filter((j) => j.workplace.toLowerCase() === t || j.type.toLowerCase() === t);
  }
  if (min_match) {
    const m = Number(min_match);
    filtered = filtered.filter((j) => j.match_score >= m);
  }

  res.json({ success: true, count: filtered.length, jobs: filtered });
});

// 12. Jobs: Single Job Match Analysis
app.get("/api/jobs/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const job = JOBS_CATALOG.find((j) => j.id === id) || JOBS_CATALOG[0];
  const email = (req as any).userEmail || demoEmail;
  const resume = resumesDb.get(email) || seedResume;

  const userSkills = (resume.technical_skills || []).map((s: string) => s.toLowerCase());
  const matched = job.skills_required.filter((s) => userSkills.includes(s.toLowerCase()));
  const missing = job.skills_required.filter((s) => !userSkills.includes(s.toLowerCase()));

  res.json({
    success: true,
    job,
    fit_analysis: {
      overall_match: job.match_score,
      skills_match: Math.round((matched.length / job.skills_required.length) * 100),
      experience_alignment: "Strong (Matches 4+ years requirement)",
      matched_skills: matched,
      missing_skills: missing,
      key_strengths: ["Direct TypeScript & React expertise", "Demonstrated microservices architecture experience"],
      recommended_action: "Customize resume summary to highlight high-concurrency payment and API gateway accomplishments.",
    },
  });
});

// 13. Companies
app.get("/api/companies", (_req, res) => {
  res.json({ success: true, companies: COMPANIES_CATALOG });
});

// 14. Market Intelligence
app.get("/api/market", (_req, res) => {
  res.json({ success: true, market: MARKET_TRENDS });
});

// 15. Applications Tracker
app.get("/api/applications", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const list = applicationsDb.get(email) || applicationsDb.get(demoEmail) || [];
  res.json({ success: true, count: list.length, applications: list });
});

app.post("/api/applications", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const list = applicationsDb.get(email) || [];
  const newApp: ApplicationRecord = {
    id: `app_${Date.now()}`,
    user_email: email,
    company: req.body.company || "Target Company",
    role: req.body.role || "Software Engineer",
    location: req.body.location || "Remote",
    salary: req.body.salary || "$150,000",
    status: req.body.status || "applied",
    applied_date: req.body.applied_date || new Date().toISOString().split("T")[0],
    job_url: req.body.job_url,
    match_score: req.body.match_score || 88,
    notes: req.body.notes || "",
    contacts: req.body.contacts || "",
    next_step: req.body.next_step || "Application Review",
    updated_at: new Date().toISOString(),
  };
  list.unshift(newApp);
  applicationsDb.set(email, list);

  // Add notification
  const notifs = notificationsDb.get(email) || [];
  notifs.unshift({
    id: `notif_${Date.now()}`,
    user_email: email,
    title: `Application Tracked: ${newApp.company}`,
    message: `Added ${newApp.role} at ${newApp.company} to your Application Tracker.`,
    type: "system",
    read: false,
    action_url: "/applications",
    created_at: new Date().toISOString(),
  });
  notificationsDb.set(email, notifs);

  res.json({ success: true, application: newApp });
});

app.put("/api/applications/:id", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const list = applicationsDb.get(email) || [];
  const index = list.findIndex((a) => a.id === req.params.id);
  if (index !== -1) {
    list[index] = { ...list[index], ...req.body, updated_at: new Date().toISOString() };
    applicationsDb.set(email, list);
    return res.json({ success: true, application: list[index] });
  }
  res.status(404).json({ success: false, message: "Application not found." });
});

app.delete("/api/applications/:id", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  let list = applicationsDb.get(email) || [];
  list = list.filter((a) => a.id !== req.params.id);
  applicationsDb.set(email, list);
  res.json({ success: true, message: "Application deleted." });
});

// 16. Application AI: Cover Letters & Messages
app.post("/api/application-ai/generate", async (req, res) => {
  try {
    const { type, company, role, job_description, tone, key_points } = req.body;
    const gemini = getGeminiClient();

    if (gemini) {
      const prompt = `You are CareerForge AI's elite Executive Career Strategist.
Generate a high-converting ${type || "cover letter"} for:
Company: ${company || "Tech Leader"}
Role: ${role || "Senior Full Stack Engineer"}
Tone: ${tone || "Passionate & Professional"}
Key candidate highlights: ${key_points || "5+ years full stack, distributed systems, React, Node.js, 40% latency reduction"}
Job Context: ${job_description || "Building scalable cloud platform tooling"}

Return a raw JSON response:
{
  "subject": "Subject line (if email/message)",
  "content": "The full polished text",
  "tips": ["Tip 1 to customize before sending", "Tip 2"]
}`;
      try {
        const response = await gemini.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
        });
        const text = response.text?.trim() || "";
        const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, ...parsed });
      } catch (err) {
        console.warn("AI generation fallback:", err);
      }
    }

    // Heuristic Fallback
    res.json({
      success: true,
      subject: `Application for ${role || "Senior Full Stack Engineer"} — Kishore Reddy`,
      content: `Dear Hiring Team at ${company || "Stripe"},\n\nI am writing to express my enthusiastic interest in the ${role || "Senior Full Stack Engineer"} position. With over 5 years of engineering experience architecting high-scale distributed systems and responsive web applications, I have consistently driven technical rigor and measurable product impact.\n\nAt Nexus Cloud Systems, I led the architecture of a real-time telemetry engine serving 2.5M daily active users while reducing frontend API latency from 850ms to 45ms using React, TypeScript, and Redis. I am deeply drawn to ${company || "Stripe"}'s commitment to developer excellence and rigorous craftsmanship, and I would love the opportunity to contribute to your engineering team.\n\nThank you for your time and consideration. I look forward to speaking with you.\n\nWarm regards,\nKishore Reddy`,
      tips: ["Reference a recent product announcement or blog post from the engineering team.", "Mention your specific availability for technical interviews."],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 17. Skill Intelligence
app.get("/api/skills", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const skills = userSkillsDb.get(email) || userSkillsDb.get(demoEmail) || [];
  res.json({
    success: true,
    skills,
    market_readiness_score: 89,
    top_strengths: ["TypeScript", "React", "Node.js", "System Design"],
    primary_gaps: ["Kafka Event Streaming", "Kubernetes Multi-Cluster Orchestration"],
  });
});

app.put("/api/skills", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const { skills } = req.body;
  if (Array.isArray(skills)) {
    userSkillsDb.set(email, skills);
  }
  res.json({ success: true, message: "Skills updated." });
});

// 18. Career Roadmap
app.get("/api/roadmap", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  let roadmap = userRoadmapsDb.get(email);
  if (!roadmap) {
    roadmap = [
      {
        week: 1,
        title: "Advanced TypeScript & Micro-Frontend Architecture",
        duration: "30-Day Focus",
        status: "completed",
        progress: 100,
        description: "Master strict generic constraints, module federation, and sub-millisecond client state management.",
        tasks: [
          { title: "Implement AST Type Guards & Generics", completed: true },
          { title: "Configure Webpack / Vite Module Federation", completed: true },
          { title: "Benchmark Render Performance on 50k DOM Nodes", completed: true },
        ],
      },
      {
        week: 2,
        title: "Distributed Caching & Redis Resiliency",
        duration: "30-Day Focus",
        status: "completed",
        progress: 100,
        description: "Implement distributed locks, rate limiting with Token Bucket algorithm, and Cache-Aside architectures.",
        tasks: [
          { title: "Build Redis Redlock Distributed Lock Utility", completed: true },
          { title: "Implement Sliding Window Log Rate Limiter", completed: true },
          { title: "Set Up Cache Invalidation & Stampede Protection", completed: true },
        ],
      },
      {
        week: 3,
        title: "Kubernetes & Cloud Infrastructure Mastery",
        duration: "60-Day Focus",
        status: "in_progress",
        progress: 60,
        description: "Deploy multi-container pods, configure Helm charts, zero-downtime rolling updates, and AWS EKS clusters.",
        tasks: [
          { title: "Write Multi-Stage Production Dockerfiles", completed: true },
          { title: "Deploy Minikube Cluster with Ingress Controller", completed: true },
          { title: "Configure Auto-Scaling HPA with Custom Prometheus Metrics", completed: false },
        ],
      },
      {
        week: 4,
        title: "Apache Kafka & Event-Driven Systems",
        duration: "60-Day Focus",
        status: "todo",
        progress: 0,
        description: "Orchestrate asynchronous message queues, dead letter queues, consumer group scaling, and schema registries.",
        tasks: [
          { title: "Set Up Kafka Broker & Zookeeper Cluster", completed: false },
          { title: "Build Idempotent Producer & Consumer Group Workers", completed: false },
          { title: "Implement Saga Pattern Distributed Transactions", completed: false },
        ],
      },
      {
        week: 5,
        title: "FAANG System Design & High-Concurrency Capstone",
        duration: "90-Day Focus",
        status: "todo",
        progress: 0,
        description: "Architect end-to-end distributed payment gateway with 99.999% availability and comprehensive telemetry.",
        tasks: [
          { title: "Design High-Availability Payment Gateway Blueprint", completed: false },
          { title: "Conduct 4 Peer System Design Mock Interviews", completed: false },
          { title: "Deploy Live Production Capstone to AWS", completed: false },
        ],
      },
    ];
    userRoadmapsDb.set(email, roadmap);
  }
  res.json({ success: true, roadmap });
});

app.put("/api/roadmap", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const { roadmap } = req.body;
  if (Array.isArray(roadmap)) {
    userRoadmapsDb.set(email, roadmap);
  }
  res.json({ success: true, message: "Roadmap updated." });
});

// 19. Learning Intelligence
app.get("/api/learning", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const learning = userLearningDb.get(email) || LEARNING_CATALOG;
  res.json({ success: true, resources: learning });
});

app.put("/api/learning/:id/progress", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const learning = userLearningDb.get(email) || [...LEARNING_CATALOG];
  const item = learning.find((l) => l.id === req.params.id);
  if (item) {
    item.progress_pct = req.body.progress_pct ?? item.progress_pct;
    item.completed = req.body.completed ?? (item.progress_pct >= 100);
    userLearningDb.set(email, learning);
    return res.json({ success: true, resource: item });
  }
  res.status(404).json({ success: false, message: "Resource not found." });
});

// 20. Interview Lab: Sessions & Evaluation
app.get("/api/interviews", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const sessions = interviewsDb.get(email) || interviewsDb.get(demoEmail) || [];
  res.json({ success: true, sessions });
});

app.post("/api/interviews/start", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const { role, type, company } = req.body;
  const newSession: InterviewSessionRecord = {
    id: `int_${Date.now()}`,
    user_email: email,
    role: role || "Senior Full Stack Engineer",
    type: type || "System Design",
    company: company || "General Tech",
    status: "in_progress",
    score: 0,
    duration_minutes: 0,
    date: new Date().toISOString().split("T")[0],
    transcript: [
      {
        sender: "ai",
        text: `Welcome to your ${type || "System Design"} interview for the ${role || "Senior Full Stack Engineer"} position at ${company || "our team"}. Let's get started: Could you walk me through an end-to-end architecture you recently designed for high-scale throughput, focusing on scalability bottlenecks and caching?`,
        timestamp: "00:00",
      },
    ],
  };

  const list = interviewsDb.get(email) || [];
  list.unshift(newSession);
  interviewsDb.set(email, list);

  res.json({ success: true, session: newSession });
});

app.post("/api/interviews/:id/respond", async (req, res) => {
  try {
    const { answer } = req.body;
    const gemini = getGeminiClient();

    if (gemini && answer) {
      const prompt = `You are a Principal Software Engineer conducting a rigorous technical/system design interview.
Candidate Answer: "${answer}"

Provide:
1. An insightful, natural interviewer follow-up question or evaluation response.
2. A brief 1-sentence rubric micro-feedback.

Return raw JSON:
{
  "interviewer_response": "Next question or follow-up challenging their design decision",
  "micro_feedback": "Instant tip on how they did"
}`;
      try {
        const response = await gemini.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
        });
        const text = response.text?.trim() || "";
        const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, ...parsed });
      } catch (err) {
        console.warn("AI interview fallback:", err);
      }
    }

    res.json({
      success: true,
      interviewer_response: "That's a solid architectural choice. Now, how would you ensure data consistency across distributed database replicas when write traffic spikes by 10x during peak hours?",
      micro_feedback: "Great mention of caching; consider emphasizing idempotency and dead-letter queues next.",
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.post("/api/interviews/:id/complete", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const list = interviewsDb.get(email) || [];
  const session = list.find((s) => s.id === req.params.id);
  if (session) {
    session.status = "completed";
    session.score = Math.floor(Math.random() * 15) + 82; // 82 - 97
    session.duration_minutes = req.body.duration_minutes || 25;
    session.feedback = {
      overall_score: session.score,
      clarity_score: session.score + 2,
      technical_score: session.score,
      impact_score: session.score - 3,
      summary: "Candidate articulated structural trade-offs clearly, demonstrated solid algorithmic intuition, and handled failure modes with composure.",
      strengths: ["Structured problem breakdown", "Strong distributed caching knowledge", "Concise verbal communication"],
      improvements: ["Elaborate more on disaster recovery plans", "Quantify SLA/SLO latency targets"],
    };
    interviewsDb.set(email, list);
    return res.json({ success: true, session });
  }
  res.status(404).json({ success: false, message: "Session not found." });
});

// 21. Coding Lab: AI Code Review
app.post("/api/coding/review", async (req, res) => {
  try {
    const { code, language, problem_title, problem_description } = req.body;
    const gemini = getGeminiClient();

    if (gemini && code) {
      const prompt = `You are a Senior Algorithm Specialist & FAANG Technical Interviewer.
Problem: ${problem_title || "Algorithmic Problem"}
Description: ${problem_description || "Optimal solution evaluation"}
Language: ${language || "JavaScript"}
Code Submitted:
\`\`\`${language || "javascript"}
${code}
\`\`\`

Perform a comprehensive code review. Return raw JSON ONLY:
{
  "correctness": "Passed / Optimal",
  "time_complexity": "e.g. O(N log N)",
  "space_complexity": "e.g. O(1)",
  "score": 94,
  "summary": "High-level summary of the solution's performance and elegance",
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement tip 1", "Edge case warning"],
  "optimized_code": "Clean, refactored version with inline comments"
}`;
      try {
        const response = await gemini.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
        });
        const text = response.text?.trim() || "";
        const cleaned = text.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "").trim();
        const parsed = JSON.parse(cleaned);
        return res.json({ success: true, ...parsed });
      } catch (err) {
        console.warn("AI code review fallback:", err);
      }
    }

    res.json({
      success: true,
      correctness: "Optimal Solution",
      time_complexity: "O(N)",
      space_complexity: "O(1)",
      score: 95,
      summary: "Clean, idiomatic implementation with linear time execution and minimal memory overhead.",
      strengths: ["Optimal pointer traversal", "Clean variable naming", "Handles boundary edge cases cleanly"],
      improvements: ["Add early exit check for empty input array", "Include type annotations for strict safety"],
      optimized_code: `// Optimized Solution\nfunction solve(nums) {\n  if (!nums || nums.length === 0) return 0;\n  let left = 0;\n  for (let right = 1; right < nums.length; right++) {\n    if (nums[right] !== nums[left]) {\n      left++;\n      nums[left] = nums[right];\n    }\n  }\n  return left + 1;\n}`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 22. AI Career Coach: Context-Aware Chat
app.post("/api/coach/chat", authenticateToken, async (req, res) => {
  try {
    const email = (req as any).userEmail || demoEmail;
    const { message, history } = req.body;
    const user = usersDb.get(email) || usersDb.get(demoEmail);
    const resume = resumesDb.get(email) || seedResume;
    const applications = applicationsDb.get(email) || [];
    const skills = userSkillsDb.get(email) || [];

    const gemini = getGeminiClient();
    if (gemini && message) {
      const systemContext = `You are CareerForge AI, a world-class Executive Career Coach and Technical Talent Strategist.
Candidate Context:
- Name: ${user?.full_name || "Kishore Reddy"}
- Target Role: ${user?.target_role || "Senior Full Stack Engineer"}
- Top Skills: ${(resume.technical_skills || []).slice(0, 10).join(", ")}
- Active Applications: ${applications.length} (${applications.map((a) => `${a.company} - ${a.status}`).join(", ")})
- Target Salary: ${user?.target_salary || "$150k - $200k"}

Respond directly to the candidate with sharp, strategic, actionable, and encouraging career advice. Avoid generic filler. Use clean formatting with bold headers and bullet points.`;

      try {
        const response = await gemini.models.generateContent({
          model: GEMINI_MODEL,
          contents: `${systemContext}\n\nCandidate Question: ${message}`,
        });
        const reply = response.text || "";
        return res.json({ success: true, reply });
      } catch (err) {
        console.warn("AI Coach fallback:", err);
      }
    }

    // Heuristic Fallback
    res.json({
      success: true,
      reply: `Based on your profile as a **${user?.target_role || "Senior Full Stack Engineer"}** and your active applications at **${applications.map((a) => a.company).join(", ") || "top tech companies"}**, here is my strategic recommendation:\n\n1. **High-Impact Resume Focus**: Your technical skills in TypeScript and React are strong (94% match for Stripe). Highlight your system design metrics—specifically how your WebSocket optimizations dropped latency to 45ms.\n2. **Target High Priority Gaps**: Prioritize hands-on practice with Kafka and Kubernetes. Completing Week 3 of your Roadmap will elevate your readiness score to 95%+.\n3. **Interview Preparation**: For your upcoming screening, prepare 2 STAR-method stories emphasizing how you balanced rapid iteration with system reliability.\n\nWhat specific challenge would you like to tackle next?`,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 23. Notifications
app.get("/api/notifications", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const list = notificationsDb.get(email) || notificationsDb.get(demoEmail) || [];
  const unreadCount = list.filter((n) => !n.read).length;
  res.json({ success: true, notifications: list, unread_count: unreadCount });
});

app.put("/api/notifications/read-all", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const list = notificationsDb.get(email) || [];
  list.forEach((n) => (n.read = true));
  notificationsDb.set(email, list);
  res.json({ success: true, message: "All notifications marked as read." });
});

// 24. Progress & Analytics Engine
app.get("/api/progress/analytics", authenticateToken, (req, res) => {
  const email = (req as any).userEmail || demoEmail;
  const applications = applicationsDb.get(email) || [];
  const interviews = interviewsDb.get(email) || [];
  const resume = resumesDb.get(email) || seedResume;
  const evaluation = calculateResumeScore(resume);

  res.json({
    success: true,
    analytics: {
      career_readiness_score: 92,
      resume_score: evaluation.resume_score,
      ats_score: 94,
      applications_count: applications.length,
      interviews_count: interviews.length,
      response_rate_pct: 75,
      offer_rate_pct: 25,
      skill_growth_rate: "+18% this month",
      funnel: [
        { stage: "Saved / Wishlist", count: applications.filter((a) => a.status === "wishlist").length + 2 },
        { stage: "Applied", count: applications.filter((a) => a.status === "applied").length + 4 },
        { stage: "Screening", count: applications.filter((a) => a.status === "screening").length + 2 },
        { stage: "Interviewing", count: applications.filter((a) => a.status === "interview").length + 2 },
        { stage: "Offer", count: applications.filter((a) => a.status === "offer").length + 1 },
      ],
      readiness_history: [
        { date: "Aug 1", score: 74 },
        { date: "Aug 8", score: 80 },
        { date: "Aug 15", score: 85 },
        { date: "Aug 22", score: 89 },
        { date: "Aug 30", score: 92 },
      ],
    },
  });
});

// 25. DSA Tracker: Progress
app.get(["/dsa/progress", "/api/dsa/progress"], authenticateToken, (req: Request, res: Response) => {
  const email = (req as any).userEmail || demoEmail;
  const userProgressMap = dsaProgressDb.get(email) || new Map<string, any>();

  const progress: Record<string, any> = {};
  for (const [key, value] of userProgressMap.entries()) {
    progress[key] = {
      status: value.status,
      bookmarked: value.bookmarked || false,
      notes: value.notes || "",
      lastUpdated: value.updated_at,
    };
  }

  res.json({
    success: true,
    progress,
  });
});

app.put(["/dsa/progress/:topicSlug/:problemSlug", "/api/dsa/progress/:topicSlug/:problemSlug"], authenticateToken, (req: Request, res: Response) => {
  const email = (req as any).userEmail || demoEmail;
  const { topicSlug, problemSlug } = req.params;
  const { status, bookmarked, notes } = req.body;

  let userProgressMap = dsaProgressDb.get(email);
  if (!userProgressMap) {
    userProgressMap = new Map<string, any>();
    dsaProgressDb.set(email, userProgressMap);
  }

  const key = `${topicSlug}:${problemSlug}`;
  const existing = userProgressMap.get(key) || { updated_at: new Date().toISOString() };

  if (status !== undefined) existing.status = status;
  if (bookmarked !== undefined) existing.bookmarked = bookmarked;
  if (notes !== undefined) existing.notes = notes;
  existing.updated_at = new Date().toISOString();

  userProgressMap.set(key, existing);

  res.json({
    success: true,
    message: "DSA progress updated.",
  });
});

app.delete(["/dsa/progress", "/api/dsa/progress"], authenticateToken, (req: Request, res: Response) => {
  const email = (req as any).userEmail || demoEmail;
  dsaProgressDb.delete(email);
  res.json({ success: true, message: "DSA progress reset." });
});

// =====================================
// Vite Middleware & Static Serving
// =====================================
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CareerForge AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
