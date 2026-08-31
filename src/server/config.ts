import dotenv from "dotenv";
import path from "path";

dotenv.config();

// Environment & Secrets Configuration
export interface ServerConfig {
  PORT: number;
  NODE_ENV: string;
  DATABASE_URL: string;
  JWT_SECRET: string;
  GEMINI_API_KEY: string | null;
  GEMINI_MODEL: string;
  FRONTEND_URL: string | null;
  DEMO_MODE: boolean;
}

function validateAndLoadConfig(): ServerConfig {
  const nodeEnv = process.env.NODE_ENV || "development";
  const isProduction = nodeEnv === "production";

  // Validate JWT Secret
  let jwtSecret = process.env.JWT_SECRET || process.env.SECRET_KEY;
  if (!jwtSecret) {
    if (isProduction) {
      throw new Error("FATAL: JWT_SECRET environment variable must be set in production.");
    } else {
      console.warn("⚠️ Warning: JWT_SECRET not provided in environment. Using development secret.");
      jwtSecret = "careerforge_dev_jwt_secret_must_be_overridden_in_production_2026";
    }
  }

  // Validate Database URL
  let dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    dbUrl = `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
    process.env.DATABASE_URL = dbUrl;
  }

  // Demo Mode check - only true if explicitly set to "true"
  const demoMode = process.env.DEMO_MODE === "true";

  const config: ServerConfig = {
    PORT: 3000,
    NODE_ENV: nodeEnv,
    DATABASE_URL: dbUrl,
    JWT_SECRET: jwtSecret,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || null,
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    FRONTEND_URL: process.env.FRONTEND_URL || null,
    DEMO_MODE: demoMode,
  };

  return config;
}

export const config = validateAndLoadConfig();

export function isDemoModeAllowed(): boolean {
  return config.DEMO_MODE === true;
}
