import dotenv from "dotenv";

dotenv.config();

const isTest = process.env.VITEST === "true" || process.env.NODE_ENV === "test";

function required(name: string): string {
  const value = process.env[name];
  if (!value || !String(value).trim()) {
    if (isTest) {
      return name === "JWT_SECRET" ? "test-jwt-secret-do-not-use" : name === "DATABASE_URL" ? "postgresql://careerforge:careerforge@localhost:5432/careerforge_test" : "";
    }
    throw new Error(`${name} is required. Set it in your environment (see .env.example).`);
  }
  return value;
}

if (!isTest && process.env.NODE_ENV === "production") {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is required in production.");
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required in production.");
  }
}

if (!isTest && process.env.NODE_ENV !== "test") {
  if (!process.env.JWT_SECRET && process.env.NODE_ENV !== "production") {
    if (!process.env.JWT_SECRET) {
      // Development still requires an explicit secret so we never silently fall back.
      if (!process.env.SKIP_ENV_CHECK) {
        try {
          required("JWT_SECRET");
        } catch {
          // Allow importing scoring tests without env; boot path calls assertEnv()
        }
      }
    }
  }
}

export function assertEnv() {
  required("JWT_SECRET");
  required("DATABASE_URL");
}

export const env = {
  get isTest() {
    return isTest;
  },
  get nodeEnv() {
    return process.env.NODE_ENV || "development";
  },
  get isProd() {
    return process.env.NODE_ENV === "production";
  },
  get port() {
    return Number(process.env.PORT || 3000);
  },
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get jwtSecret() {
    return required("JWT_SECRET");
  },
  get accessTtl() {
    return Number(process.env.JWT_ACCESS_EXPIRES_IN || 900);
  },
  get refreshTtl() {
    return Number(process.env.JWT_REFRESH_EXPIRES_IN || 604800);
  },
  get geminiKey() {
    return process.env.GEMINI_API_KEY || "";
  },
  get geminiModel() {
    return process.env.GEMINI_MODEL || "gemini-2.5-flash";
  },
  get corsOrigin() {
    return process.env.CORS_ORIGIN || "http://localhost:3000";
  },
};
