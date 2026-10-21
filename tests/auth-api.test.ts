import jwt from "jsonwebtoken";
import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { findById } = vi.hoisted(() => ({ findById: vi.fn() }));

vi.mock("../src/db/repositories", () => ({
  db: { users: { findById } },
}));

import { app } from "../server";
import { config } from "../src/server/config";

describe("authentication API", () => {
  beforeEach(() => findById.mockReset());

  it("rejects an absent bearer token", async () => {
    const response = await request(app).get("/api/auth/me");
    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("rejects a predictable legacy demo token", async () => {
    const response = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer demo_jwt_token_careerforge");
    expect(response.status).toBe(401);
  });

  it("accepts a signed session for an existing account", async () => {
    findById.mockResolvedValue({
      id: "candidate-1",
      email: "candidate@example.com",
      name: "Candidate",
      onboardingCompleted: false,
      profile: null,
    });
    const token = jwt.sign({ sub: "candidate-1", email: "candidate@example.com" }, config.JWT_SECRET);
    const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("candidate@example.com");
  });

  it("enforces token authentication on /metrics", async () => {
    const savedToken = process.env.METRICS_TOKEN;
    process.env.METRICS_TOKEN = "test_metrics_token_secret_123";

    try {
      // Unauthenticated request should be rejected with 401
      const unauth = await request(app).get("/metrics");
      expect(unauth.status).toBe(401);

      // Authenticated request with Bearer header should succeed
      const authed = await request(app)
        .get("/metrics")
        .set("Authorization", "Bearer test_metrics_token_secret_123");
      expect(authed.status).toBe(200);
      expect(authed.body.status).toBe("ok");
      expect(typeof authed.body.uptime_seconds).toBe("number");
    } finally {
      process.env.METRICS_TOKEN = savedToken;
    }
  });
});
