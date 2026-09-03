import { PrismaClient } from "@prisma/client";
import { config } from "../server/config";

// The datasource URL is resolved and validated once, in src/server/config.ts.
// This module previously re-derived its own SQLite `file:` URL, which both
// contradicted the `postgresql` provider in prisma/schema.prisma and bypassed
// the validated configuration. It now defers to config.DATABASE_URL so there is
// exactly one source of truth for the connection string.

declare global {
  // eslint-disable-next-line no-var
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma: PrismaClient =
  global.prismaGlobal ||
  new PrismaClient({
    datasources: {
      db: {
        url: config.DATABASE_URL,
      },
    },
    log: config.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (config.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}

export default prisma;
