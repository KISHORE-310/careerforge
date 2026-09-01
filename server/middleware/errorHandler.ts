import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { AppError } from "../utils/errors.js";
import { env } from "../config/env.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      code: "VALIDATION_ERROR",
      message: "Invalid request.",
      details: err.flatten(),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.status).json({
      success: false,
      code: err.code,
      message: err.message,
      details: err.details,
    });
  }

  const message = err instanceof Error ? err.message : "Unexpected error";
  if (message.includes("Only PDF")) {
    return res.status(400).json({ success: false, code: "INVALID_FILE", message: "Only PDF files are supported." });
  }

  console.error("Unhandled error:", err);
  return res.status(500).json({
    success: false,
    code: "INTERNAL_ERROR",
    message: env.isProd ? "Internal server error." : "Internal server error.",
  });
}

export function notFoundHandler(_req: Request, res: Response) {
  if (_req.path.startsWith("/api") || _req.path === "/health") {
    return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Endpoint not found." });
  }
  return res.status(404).json({ success: false, code: "NOT_FOUND", message: "Not found." });
}
