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
      id: "candidate-1", email: "candidate@example.com", name: "Candidate", onboardingCompleted: false, profile: null,
    });
    const token = jwt.sign({ sub: "candidate-1", email: "candidate@example.com" }, config.JWT_SECRET);
    const response = await request(app).get("/api/auth/me").set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe("candidate@example.com");
  });
});
