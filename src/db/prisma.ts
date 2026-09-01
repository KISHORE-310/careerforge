import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

function getValidSqliteUrl(): string {
  const dbUrl = process.env.DATABASE_URL;
  if (dbUrl && dbUrl.startsWith("file:")) {
    return dbUrl;
  }
  const customUrl = process.env.SQLITE_DATABASE_URL;
  if (customUrl && customUrl.startsWith("file:")) {
    return customUrl;
  }
  return `file:${path.join(process.cwd(), "prisma", "dev.db")}`;
}

const sqliteDbUrl = getValidSqliteUrl();

// Global Prisma instance with graceful initialization
declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.prismaGlobal ||
  new PrismaClient({
    datasources: {
      db: {
        url: sqliteDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}

export default prisma;
