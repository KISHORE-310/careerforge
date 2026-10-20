import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

// ------------------------------------------------------------------
// Mock the repository layer. Each route module only touches the
// `db.*` namespaces listed here; auth middleware resolves users via
// db.users.findById.
// ------------------------------------------------------------------
const mocks = vi.hoisted(() => ({
  usersFindById: vi.fn(),
  applicationsListByUser: vi.fn(),
  applicationsCreate: vi.fn(),
  applicationsUpdate: vi.fn(),
  applicationsDelete: vi.fn(),
  jobsFindById: vi.fn(),
  skillsListByUser: vi.fn(),
  notificationsCreate: vi.fn(),
  analyticsRecordEvent: vi.fn(),
  dsaListByUser: vi.fn(),
  dsaRecordProblem: vi.fn(),
  dsaResetProgress: vi.fn(),
  interviewsListByUser: vi.fn(),
  interviewsCreate: vi.fn(),
  interviewsFindById: vi.fn(),
  interviewsAddMessage: vi.fn(),
  interviewsSaveEvaluation: vi.fn(),
}));

vi.mock("../src/db/repositories", () => ({
  db: {
    users: { findById: mocks.usersFindById },
    applications: {
      listByUser: mocks.applicationsListByUser,
      create: mocks.applicationsCreate,
      update: mocks.applicationsUpdate,
      delete: mocks.applicationsDelete,
    },
    jobs: { findById: mocks.jobsFindById },
    skills: { listByUser: mocks.skillsListByUser },
    notifications: { create: mocks.notificationsCreate },
    analytics: { recordEvent: mocks.analyticsRecordEvent },
    dsa: {
      listByUser: mocks.dsaListByUser,
      recordProblem: mocks.dsaRecordProblem,
      resetProgress: mocks.dsaResetProgress,
    },
    interviews: {
      listByUser: mocks.interviewsListByUser,
      create: mocks.interviewsCreate,
      findById: mocks.interviewsFindById,
      addMessage: mocks.interviewsAddMessage,
      saveEvaluation: mocks.interviewsSaveEvaluation,
    },
  },
}));

// AI service is mocked: these tests verify routing, auth, validation, and
// persistence wiring -- not Gemini itself.
vi.mock("../src/server/services/ai.service", () => ({
  aiService: {
    generateApplicationDocument: vi.fn().mockResolvedValue({
      subject: "S",
      content: "C",
      tips: ["T"],
    }),
    getCareerCoachAdvice: vi.fn().mockResolvedValue("Coach reply"),
    reviewDsaCode: vi.fn().mockResolvedValue({
      passed_tests: true,
      score: 90,
      time_complexity: "O(N)",
      space_complexity: "O(N)",
      strengths: ["clear"],
      suggestions: [],
      feedback: "good",
    }),
    generateInterviewResponse: vi.fn().mockResolvedValue({
      reply: "Next question?",
      feedback_snippet: "solid",
      suggested_topics: ["caching"],
    }),
    evaluateInterviewSession: vi.fn().mockResolvedValue({
      overall_score: 82,
      technical_score: 80,
      communication_score: 85,
      problem_solving_score: 81,
      strengths: ["depth"],
      improvements: ["pace"],
      summary: "good",
    }),
  },
}));

import { app } from "../server";
import { config } from "../src/server/config";
import { isAllowedOrigin } from "../src/server/security";

const AUTH_USER = { id: "user-1", email: "user@example.com", name: "Test User", profile: null };
function authToken() {
  return jwt.sign({ sub: AUTH_USER.id, email: AUTH_USER.email }, config.JWT_SECRET);
}
function authed() {
  const token = authToken();
  return {
    get: (url: string) => request(app).get(url).set("Authorization", `Bearer ${token}`),
    post: (url: string) => request(app).post(url).set("Authorization", `Bearer ${token}`),
    put: (url: string) => request(app).put(url).set("Authorization", `Bearer ${token}`),
    delete: (url: string) => request(app).delete(url).set("Authorization", `Bearer ${token}`),
    patch: (url: string) => request(app).patch(url).set("Authorization", `Bearer ${token}`),
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.usersFindById.mockResolvedValue(AUTH_USER);
  mocks.skillsListByUser.mockResolvedValue([{ name: "React" }, { name: "Node" }]);
});

// ==================================================================
// Applications
// ==================================================================
describe("applications API", () => {
  it("rejects unauthenticated list requests", async () => {
    const res = await request(app).get("/api/applications");
    expect(res.status).toBe(401);
  });

  it("lists applications with computed match scores", async () => {
    mocks.applicationsListByUser.mockResolvedValue([
      {
        id: "app-1",
        company: "Acme",
        role: "Frontend Engineer",
        location: "Remote",
        salary: "10 LPA",
        status: "applied",
        appliedDate: new Date("2026-09-01T00:00:00Z"),
        jobId: "job-1",
        job: { skillsRequired: ["react", "typescript", "kubernetes"] },
        notes: "n",
        nextStep: "follow up",
      },
    ]);

    const res = await authed().get("/api/applications");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.count).toBe(1);
    // 1 of 3 skills matched -> 33% -> clamped to the 40 floor.
    expect(res.body.applications[0].match_score).toBe(40);
    expect(res.body.applications[0].applied_date).toBe("2026-09-01");
  });

  it("creates an application and records notification + analytics", async () => {
    mocks.applicationsCreate.mockResolvedValue({
      id: "app-2",
      company: "Globex",
      role: "Backend Engineer",
      location: "Bengaluru",
      salary: "12 LPA",
      status: "applied",
      appliedDate: new Date("2026-09-02T00:00:00Z"),
      jobId: null,
      notes: "",
      nextStep: "",
    });

    const res = await authed()
      .post("/api/applications")
      .send({ company: "Globex", role: "Backend Engineer", salary_range: "12 LPA" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.application.company).toBe("Globex");
    expect(mocks.notificationsCreate).toHaveBeenCalledTimes(1);
    expect(mocks.analyticsRecordEvent).toHaveBeenCalledWith(
      "user-1",
      "application_created",
      "Applications",
      expect.any(Object)
    );
  });

  it("rejects creation without a company", async () => {
    const res = await authed().post("/api/applications").send({ role: "X" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("returns 400 when jobId references an unknown job", async () => {
    mocks.jobsFindById.mockResolvedValue(null);
    const res = await authed()
      .post("/api/applications")
      .send({ company: "A", role: "B", jobId: "missing" });
    expect(res.status).toBe(400);
  });

  it("returns 404 when updating another user's application", async () => {
    mocks.applicationsUpdate.mockResolvedValue(null);
    const res = await authed()
      .put("/api/applications/app-9")
      .send({ status: "offer" });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it("deletes an application", async () => {
    const res = await authed().delete("/api/applications/app-1");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mocks.applicationsDelete).toHaveBeenCalledWith("app-1", "user-1");
  });
});

// ==================================================================
// DSA
// ==================================================================
describe("DSA API", () => {
  it("serves the curated catalog without auth", async () => {
    const res = await request(app).get("/api/dsa/catalog");
    expect(res.status).toBe(200);
    expect(res.body.source).toBe("curated");
    expect(Array.isArray(res.body.topics)).toBe(true);
    expect(typeof res.body.problems).toBe("object");
  });

  it("returns progress keyed by topic:problem", async () => {
    mocks.dsaListByUser.mockResolvedValue([
      {
        topicSlug: "arrays",
        problemSlug: "two-sum",
        status: "solved",
        bookmarked: true,
        notes: "classic",
        updatedAt: new Date("2026-09-01T00:00:00Z"),
      },
    ]);
    const res = await authed().get("/api/dsa/progress");
    expect(res.status).toBe(200);
    expect(res.body.progress["arrays:two-sum"].status).toBe("solved");
  });

  it("records a progress update", async () => {
    const res = await authed()
      .put("/api/dsa/progress/arrays/two-sum")
      .send({ status: "solved", notes: "done", bookmarked: true });
    expect(res.status).toBe(200);
    expect(mocks.dsaRecordProblem).toHaveBeenCalledWith(
      "user-1",
      expect.objectContaining({ topicSlug: "arrays", problemSlug: "two-sum" })
    );
  });

  it("rejects progress updates without auth", async () => {
    const res = await request(app)
      .put("/api/dsa/progress/arrays/two-sum")
      .send({ status: "solved" });
    expect(res.status).toBe(401);
  });

  it("resets progress", async () => {
    const res = await authed().delete("/api/dsa/progress");
    expect(res.status).toBe(200);
    expect(mocks.dsaResetProgress).toHaveBeenCalledWith("user-1");
  });

  it("submits code for AI review and records the outcome", async () => {
    const res = await authed()
      .post("/api/dsa/submit")
      .send({ problem_id: "two-sum", problem_title: "Two Sum", code: "function f() {}", language: "JavaScript" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.passed).toBe(true);
    expect(res.body.time_complexity).toBe("O(N)");
    expect(mocks.dsaRecordProblem).toHaveBeenCalled();
    expect(mocks.analyticsRecordEvent).toHaveBeenCalledWith(
      "user-1",
      "dsa_submission",
      "DSA",
      expect.objectContaining({ problemId: "two-sum", passed: true })
    );
  });

  it("rejects empty code submissions", async () => {
    const res = await authed().post("/api/dsa/submit").send({ code: "" });
    expect(res.status).toBe(400);
  });
});

// ==================================================================
// Career coach
// ==================================================================
describe("career coach API", () => {
  it("chats using the user's real profile context", async () => {
    const res = await authed().post("/api/coach/chat").send({ message: "How do I prep for system design?" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reply).toBe("Coach reply");
  });

  it("rejects empty chat messages", async () => {
    const res = await authed().post("/api/coach/chat").send({ message: "   " });
    expect(res.status).toBe(400);
  });

  it("requires auth for chat", async () => {
    const res = await request(app).post("/api/coach/chat").send({ message: "hi" });
    expect(res.status).toBe(401);
  });

  it("reviews code via the coding review endpoint", async () => {
    const res = await authed().post("/api/coding/review").send({ code: "const a = 1;", language: "JavaScript" });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.score).toBe(90);
  });
});

// ==================================================================
// Mock interviews
// ==================================================================
describe("interviews API", () => {
  it("lists sessions with evaluation breakdowns", async () => {
    mocks.interviewsListByUser.mockResolvedValue([
      {
        id: "iv-1",
        role: "Senior Full Stack Engineer",
        type: "System Design",
        company: "Acme",
        status: "completed",
        durationMinutes: 42,
        createdAt: new Date("2026-09-01T00:00:00Z"),
        evaluation: { technicalScore: 80, clarityScore: 85, impactScore: 81, overallScore: 82 },
      },
    ]);
    const res = await authed().get("/api/interviews");
    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(res.body.sessions[0].score).toBe(82);
    expect(res.body.sessions[0].score_breakdown).toEqual({
      technical: 80,
      communication: 85,
      problemSolving: 81,
    });
  });

  it("starts a session, persists it, and returns a greeting", async () => {
    mocks.interviewsCreate.mockResolvedValue({ id: "iv-2" });
    const res = await authed()
      .post("/api/interviews/start")
      .send({ role: "Backend Engineer", track: "System Design", difficulty: "Medium" });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.session_id).toBe("iv-2");
    expect(res.body.initial_message).toContain("Backend Engineer");
    expect(mocks.interviewsAddMessage).toHaveBeenCalledWith("iv-2", "ai", expect.stringContaining("interviewer"));
    expect(mocks.analyticsRecordEvent).toHaveBeenCalledWith(
      "user-1",
      "interview_started",
      "Interviews",
      expect.any(Object)
    );
  });

  it("rejects messages for sessions the caller does not own", async () => {
    mocks.interviewsFindById.mockResolvedValue(null);
    const res = await authed()
      .post("/api/interviews/iv-other/message")
      .send({ message: "my answer" });
    expect(res.status).toBe(404);
    expect(mocks.interviewsAddMessage).not.toHaveBeenCalled();
  });

  it("stores the user message and returns the AI reply for owned sessions", async () => {
    mocks.interviewsFindById.mockResolvedValue({ id: "iv-2", messages: [] });
    const res = await authed()
      .post("/api/interviews/iv-2/respond")
      .send({ message: "I used Kafka with idempotent consumers." });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.reply).toBe("Next question?");
    expect(mocks.interviewsAddMessage).toHaveBeenCalledWith("iv-2", "user", expect.any(String));
    expect(mocks.interviewsAddMessage).toHaveBeenCalledWith("iv-2", "ai", expect.any(String), expect.any(Object));
  });

  it("requires at least one message to evaluate", async () => {
    mocks.interviewsFindById.mockResolvedValue({ id: "iv-2", messages: [] });
    const res = await authed().post("/api/interviews/iv-2/complete").send({ messages: [] });
    expect(res.status).toBe(400);
  });

  it("evaluates and persists a completed session", async () => {
    mocks.interviewsFindById.mockResolvedValue({
      id: "iv-2",
      messages: [
        { sender: "ai", text: "Tell me about a system you built." },
        { sender: "user", text: "A real-time canvas." },
      ],
    });
    const res = await authed().post("/api/interviews/iv-2/complete").send({});
    expect(res.status).toBe(200);
    expect(res.body.evaluation.overall_score).toBe(82);
    expect(mocks.interviewsSaveEvaluation).toHaveBeenCalledWith(
      "iv-2",
      expect.objectContaining({ overallScore: 82 })
    );
    expect(mocks.analyticsRecordEvent).toHaveBeenCalledWith(
      "user-1",
      "interview_completed",
      "Interviews",
      expect.any(Object)
    );
  });
});

// ==================================================================
// CORS security matrix (unit tests of the pure helper)
// ==================================================================
describe("CORS origin policy", () => {
  const dev = "development";
  const prod = "production";

  it("allows same-origin/no-origin requests in every environment", () => {
    expect(isAllowedOrigin(null, prod, null)).toBe(true);
  });

  it("allows the configured frontend URL", () => {
    expect(isAllowedOrigin("https://app.example.com", prod, "https://app.example.com")).toBe(true);
  });

  it("allows localhost in every environment", () => {
    expect(isAllowedOrigin("http://localhost:5173", prod, null)).toBe(true);
    expect(isAllowedOrigin("http://127.0.0.1:3000", prod, null)).toBe(true);
  });

  it("does not let lookalike hosts smuggle localhost past the check", () => {
    expect(isAllowedOrigin("https://evil-localhost.com", prod, null)).toBe(false);
    expect(isAllowedOrigin("https://localhost.evil.com", prod, null)).toBe(false);
  });

  it("allows preview-tool origins in dev but rejects them in production", () => {
    expect(isAllowedOrigin("https://ais-dev.example.run.app", dev, null)).toBe(true);
    expect(isAllowedOrigin("https://preview.ais-pre.google.com", dev, null)).toBe(true);
    expect(isAllowedOrigin("https://ais-dev.example.run.app", prod, null)).toBe(false);
    expect(isAllowedOrigin("https://preview.ais-pre.google.com", prod, null)).toBe(false);
  });

  it("honors the EXTRA_CORS_ORIGINS allow-list in production", () => {
    process.env.EXTRA_CORS_ORIGINS = "https://allowed.example.org";
    expect(isAllowedOrigin("https://allowed.example.org", prod, null)).toBe(true);
    expect(isAllowedOrigin("https://not-allowed.example.org", prod, null)).toBe(false);
    delete process.env.EXTRA_CORS_ORIGINS;
  });

  it("rejects unknown origins in production but stays permissive in dev", () => {
    expect(isAllowedOrigin("https://random-site.io", dev, null)).toBe(true);
    expect(isAllowedOrigin("https://random-site.io", prod, null)).toBe(false);
  });

  it("rejects malformed origins", () => {
    expect(isAllowedOrigin("not-a-url", prod, null)).toBe(false);
  });
});
