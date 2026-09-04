import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import cors from "cors";
import { ZodSchema, ZodError } from "zod";
import { config } from "./config";

// =====================================
// Rate Limiters
// =====================================

// Auth rate limiter: max 20 requests per 15 minutes per IP
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: {
    success: false,
    message: "Too many authentication attempts. Please try again in 15 minutes.",
  },
});

// Resume upload rate limiter: max 15 uploads per 15 minutes
export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: {
    success: false,
    message: "Resume upload rate limit reached. Please wait before uploading another file.",
  },
});

// AI endpoints limiter: max 40 calls per 10 minutes
export const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 40,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: {
    success: false,
    message: "AI generation quota reached for this session. Please try again in a few minutes.",
  },
});

// General API limiter: max 300 requests per 10 minutes
export const generalApiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 400,
  standardHeaders: true,
  legacyHeaders: false,
  validate: false,
  message: {
    success: false,
    message: "Too many requests. Please slow down.",
  },
});

// =====================================
// Security Headers & CORS
// =====================================

export const securityHeaders = helmet({
  contentSecurityPolicy: false, // Vite SPA and AI Studio iframe compatibility
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" },
  frameguard: false, // Allow rendering inside AI Studio preview iframe
});

// Pure, exported so it can be unit-tested directly for both environments
// without needing to boot a second production-mode server process.
export function isAllowedOrigin(origin: string | undefined | null, nodeEnv: string, frontendUrl: string | null): boolean {
  // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
  if (!origin) return true;

  if (frontendUrl && origin === frontendUrl) return true;

  // Local dev host & known preview-tool domains (e.g. AI Studio's dynamic
  // Cloud Run preview iframe origins) stay allowed in every environment --
  // this is an explicit whitelist entry, not the permissive fallback below.
  if (
    origin.includes("localhost") ||
    origin.includes("127.0.0.1") ||
    origin.includes(".run.app") ||
    origin.includes(".google.com") ||
    origin.includes("ais-dev") ||
    origin.includes("ais-pre")
  ) {
    return true;
  }

  // Anything else: permissive outside production (preserves today's local
  // dev / preview-tool experience), rejected in production where the
  // whitelist above must be exhaustive. credentials: true below makes an
  // unconditional true here a real CORS misconfiguration in production.
  return nodeEnv !== "production";
}

export const corsMiddleware = cors({
  origin: (origin, callback) => {
    callback(null, isAllowedOrigin(origin, config.NODE_ENV, config.FRONTEND_URL));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
});

// =====================================
// Request Validation Middleware
// =====================================

export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const firstIssue = result.error.issues[0];
      const fieldPath = firstIssue.path.length > 0 ? `${firstIssue.path.join(".")}: ` : "";
      const errorMessage = `${fieldPath}${firstIssue.message}`;
      return res.status(400).json({
        success: false,
        message: errorMessage,
        errors: result.error.flatten().fieldErrors,
      });
    }
    req.body = result.data;
    next();
  };
}

// =====================================
// File Upload Security Validator
// =====================================

export function validatePdfFile(file: Express.Multer.File | undefined): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: "No file was uploaded." };
  }

  // 1. Check max size (5 MB limit)
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  if (file.size > MAX_FILE_SIZE) {
    return { isValid: false, error: "File size exceeds the 5MB limit." };
  }

  // 2. Check MIME type
  if (file.mimetype !== "application/pdf" && !file.originalname.toLowerCase().endsWith(".pdf")) {
    return { isValid: false, error: "Only PDF resume documents are supported (.pdf)." };
  }

  // 3. Check PDF Magic Bytes (%PDF-)
  if (file.buffer && file.buffer.length >= 4) {
    const magic = file.buffer.toString("utf8", 0, 4);
    if (!magic.startsWith("%PDF")) {
      return { isValid: false, error: "The uploaded file is not a valid PDF document." };
    }
  }

  return { isValid: true };
}

// =====================================
// AI Prompt Sanitization & Guard
// =====================================

export function sanitizeAiInput(text: string, maxLength = 6000): string {
  if (!text) return "";
  // Strip control characters while keeping standard whitespace and newlines
  const sanitized = text
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    .trim();

  // Truncate to maximum safe character length
  return sanitized.slice(0, maxLength);
}

// =====================================
// Safe Global Error Handler
// =====================================

export function globalErrorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  console.error("Unhandled Server Error:", err?.message || err);

  // Avoid leaking internal details, database credentials, or secret keys in response
  const statusCode = err.statusCode || err.status || 500;
  const safeMessage =
    statusCode >= 500
      ? "An unexpected error occurred. Please try again later."
      : err.message || "Request failed.";

  res.status(statusCode).json({
    success: false,
    message: safeMessage,
  });
}
