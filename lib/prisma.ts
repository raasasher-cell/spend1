import path from "path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "./generated/prisma/client";

function createPrisma() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  const authToken = process.env.TURSO_AUTH_TOKEN;

  // Local SQLite: resolve to an absolute path the libsql driver can open.
  // Turso / remote libsql: pass the URL directly (libsql:// or https://).
  const url = dbUrl.startsWith("file:")
    ? `file:${path.resolve(/*turbopackIgnore: true*/ process.cwd(), dbUrl.slice(5))}`
    : dbUrl;

  const adapter = new PrismaLibSql({
    url,
    ...(authToken ? { authToken } : {}),
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
