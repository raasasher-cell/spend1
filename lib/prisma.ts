import path from "path";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "./generated/prisma/client";

function createPrisma() {
  const dbUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  const resolved = dbUrl.startsWith("file:")
    ? path.resolve(process.cwd(), dbUrl.slice(5))
    : path.resolve(process.cwd(), dbUrl);
  const adapter = new PrismaLibSql({ url: `file://${resolved}` });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
