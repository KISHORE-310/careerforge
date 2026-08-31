import express, { Request, Response } from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

import { config } from "./src/server/config";
import {
  securityHeaders,
  corsMiddleware,
  generalApiLimiter,
  globalErrorHandler,
} from "./src/server/security";
import { prisma } from "./src/db/prisma";

// Import Modular Domain Routers
import { authRouter } from "./src/server/routes/auth.routes";
import { profileRouter } from "./src/server/routes/profile.routes";
import { resumeRouter } from "./src/server/routes/resume.routes";
import { jobsRouter } from "./src/server/routes/jobs.routes";
import { applicationsRouter } from "./src/server/routes/applications.routes";
import { skillsRouter } from "./src/server/routes/skills.routes";
import { roadmapRouter } from "./src/server/routes/roadmap.routes";
import { learningRouter } from "./src/server/routes/learning.routes";
import { interviewsRouter } from "./src/server/routes/interviews.routes";
import { dsaRouter } from "./src/server/routes/dsa.routes";
import { coachRouter } from "./src/server/routes/coach.routes";
import { notificationsRouter } from "./src/server/routes/notifications.routes";
import { analyticsRouter } from "./src/server/routes/analytics.routes";

const app = express();
const PORT = config.PORT;

// 1. Security Headers & CORS
app.use(securityHeaders);
app.use(corsMiddleware);

// 2. Safe Request Body Size Limits (2MB limit for JSON payloads)
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

// 3. General Rate Limiter on all API routes
app.use("/api", generalApiLimiter);

// 4. System Health Check
app.get(["/health", "/api/health"], async (_req: Request, res: Response) => {
  let dbStatus = "connected";
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    dbStatus = "disconnected";
  }

  res.json({
    status: "ok",
    environment: config.NODE_ENV,
    database: dbStatus,
    ai_engine: config.GEMINI_API_KEY ? "configured" : "fallback_mode",
    timestamp: new Date().toISOString(),
  });
});

// 5. Mount Domain Routers (Modular API Architecture)
app.use("/api/auth", authRouter);
app.use("/api/profile", profileRouter);
app.use("/api/onboarding", profileRouter);
app.use("/api/resume", resumeRouter);
app.use("/api/resumes", resumeRouter);
app.use("/api/upload-resume", resumeRouter);
app.use("/api/jobs", jobsRouter);
app.use("/api/companies", jobsRouter);
app.use("/api/market", jobsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/application-ai", applicationsRouter);
app.use("/api/skills", skillsRouter);
app.use("/api/roadmap", roadmapRouter);
app.use("/api/learning", learningRouter);
app.use("/api/interviews", interviewsRouter);
app.use("/api/dsa", dsaRouter);
app.use("/api/coding", coachRouter);
app.use("/api/coach", coachRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/progress", analyticsRouter);

// Top-Level Compatibility Aliases
app.use("/demo", authRouter);
app.use("/auth", authRouter);
app.use("/dsa", dsaRouter);

// 6. Global Sanitized Error Handler (Prevents leaking stack traces or credentials)
app.use(globalErrorHandler);

// 7. Vite Middleware & Static Serving
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
    console.log(`CareerForge AI Server running securely on http://0.0.0.0:${PORT}`);
  });
}

startServer();
