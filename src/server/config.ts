import dotenv from "dotenv";

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

  // Validate Database URL.
  // prisma/schema.prisma declares `provider = "postgresql"`, so DATABASE_URL is
  // authoritative and MUST be a PostgreSQL connection string. Any previous
  // SQLite (`file:`) coercion has been removed: it contradicted the schema and
  // silently discarded the configured database.
  let dbUrl = process.env.DATABASE_URL;
  const isPostgresUrl = (url: string) =>
    url.startsWith("postgresql://") || url.startsWith("postgres://");

  if (!dbUrl) {
    if (isProduction) {
      throw new Error("FATAL: DATABASE_URL environment variable must be set in production.");
    }
    // Development default matches docker-compose.yml and .env.example
    dbUrl = "postgresql://careerforge:careerforge@localhost:5432/careerforge";
    console.warn(
      "⚠️ Warning: DATABASE_URL not provided. Falling back to the local docker-compose PostgreSQL instance."
    );
  } else if (!isPostgresUrl(dbUrl)) {
    throw new Error(
      `FATAL: DATABASE_URL must be a PostgreSQL connection string (postgresql://...). ` +
        `Received a URL starting with "${dbUrl.split(":")[0]}:". ` +
        `The Prisma schema uses the "postgresql" provider; SQLite URLs are no longer supported.`
    );
  }

  // Demo Mode check - only true if explicitly set to "true"
  const demoMode = process.env.DEMO_MODE === "true";

  const config: ServerConfig = {
    PORT: Number(process.env.PORT) || 3000,
    NODE_ENV: nodeEnv,
    DATABASE_URL: dbUrl,
    JWT_SECRET: jwtSecret,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || null,
    GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.7-flash",
    FRONTEND_URL: process.env.FRONTEND_URL || null,
    DEMO_MODE: demoMode,
  };

  return config;
}

export const config = validateAndLoadConfig();

export function isDemoModeAllowed(): boolean {
  return config.DEMO_MODE === true;
}
