export const APPLICATION_STATUSES = [
  "wishlist",
  "applied",
  "screening",
  "interview",
  "offer",
  "rejected",
  "withdrawn",
];

export const APPLICATION_STATUS_LABELS = {
  wishlist: "Wishlist",
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  rejected: "Rejected",
  withdrawn: "Withdrawn",
};

export function normalizeApplicationStatus(value) {
  if (!value) return "applied";
  const raw = String(value).trim().toLowerCase().replace(/[\s-]+/g, "_");
  const aliases = {
    saved: "wishlist",
    wish_list: "wishlist",
    interviewing: "interview",
    offers: "offer",
    reject: "rejected",
    withdraw: "withdrawn",
  };
  const mapped = aliases[raw] || raw;
  return APPLICATION_STATUSES.includes(mapped) ? mapped : "applied";
}

export const ROLE_SKILL_MAP = {
  "Senior Full Stack Engineer": [
    "TypeScript",
    "React",
    "Node.js",
    "PostgreSQL",
    "Redis",
    "Docker",
    "AWS",
    "System Design",
  ],
  "Backend / Distributed Systems Engineer": [
    "Go",
    "Python",
    "PostgreSQL",
    "Redis",
    "Kafka",
    "Kubernetes",
    "System Design",
    "gRPC",
  ],
  "Frontend Systems & UI Architect": [
    "TypeScript",
    "React",
    "CSS",
    "Web Performance",
    "Accessibility",
    "State Management",
  ],
  "AI / LLM Platform Engineer": [
    "Python",
    "TypeScript",
    "LLMs",
    "Docker",
    "AWS",
    "Vector Databases",
    "Prompt Engineering",
  ],
  "Cloud & DevOps Architect": [
    "Kubernetes",
    "Docker",
    "AWS",
    "Terraform",
    "CI/CD",
    "Observability",
    "Linux",
  ],
  "Data Scientist / ML Engineer": [
    "Python",
    "SQL",
    "Pandas",
    "Machine Learning",
    "Statistics",
    "PyTorch",
  ],
  "Software Engineer": [
    "JavaScript",
    "TypeScript",
    "Git",
    "SQL",
    "Data Structures",
    "Testing",
  ],
};

export function skillsForRole(role) {
  if (!role) return ROLE_SKILL_MAP["Software Engineer"];
  if (ROLE_SKILL_MAP[role]) return ROLE_SKILL_MAP[role];
  const hit = Object.keys(ROLE_SKILL_MAP).find((k) =>
    k.toLowerCase().includes(String(role).toLowerCase()) ||
    String(role).toLowerCase().includes(k.toLowerCase())
  );
  return ROLE_SKILL_MAP[hit] || ROLE_SKILL_MAP["Software Engineer"];
}
