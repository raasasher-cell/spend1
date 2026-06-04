import path from "path";
import { createHash } from "crypto";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { PrismaClient } from "../lib/generated/prisma/client";
import {
  USERS, CUSTOMERS, ALERTS, CASES, SAR_REVIEWS, TRANSACTIONS, AUDIT_LOG,
} from "../lib/mock-data";

const DEMO_PASSWORD = "riskops2026";
function hashPassword(p: string): string {
  return createHash("sha256").update(`riskops:${p}`).digest("hex");
}

// Supports both local SQLite (file:./dev.db) and Turso (libsql://...)
const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";
const url = rawUrl.startsWith("file:")
  ? `file:${path.resolve(process.cwd(), rawUrl.slice(5))}`
  : rawUrl;
const authToken = process.env.TURSO_AUTH_TOKEN;
const adapter = new PrismaLibSql({ url, ...(authToken ? { authToken } : {}) });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database…");

  await prisma.$transaction([
    prisma.auditLogEntry.deleteMany(),
    prisma.transaction.deleteMany(),
    prisma.sARReview.deleteMany(),
    prisma.caseNote.deleteMany(),
    prisma.alert.deleteMany(),
    prisma.case.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.user.deleteMany(),
  ]);

  // Users
  const pwHash = hashPassword(DEMO_PASSWORD);
  await prisma.user.createMany({
    data: USERS.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role, passwordHash: pwHash })),
  });

  // Customers (strip derived openAlerts/openCases — live computed)
  await prisma.customer.createMany({
    data: CUSTOMERS.map(c => ({
      id: c.id,
      name: c.name,
      type: c.type,
      status: c.status,
      riskRating: c.riskRating,
      kycStatus: c.kycStatus,
      screeningStatus: c.screeningStatus,
      totalVolume: c.totalVolume,
      lastTransaction: c.lastTransaction,
      email: c.email,
      phone: c.phone,
      address: c.address,
      dateOnboarded: c.dateOnboarded,
      country: c.country,
      ssn: c.ssn ?? null,
      ein: c.ein ?? null,
      dob: c.dob ?? null,
    })),
  });

  // Cases (without notes — seeded separately below)
  await prisma.case.createMany({
    data: CASES.map(c => ({
      id: c.id,
      customerId: c.customerId,
      customerName: c.customerName,
      status: c.status,
      priority: c.priority,
      assignedTo: c.assignedTo,
      createdDate: c.createdDate,
      updatedDate: c.updatedDate,
      description: c.description,
      sarStatus: c.sarStatus ?? null,
      closedDate: c.closedDate ?? null,
    })),
  });

  // Case notes
  const allNotes = CASES.flatMap(c => c.notes);
  if (allNotes.length > 0) {
    await prisma.caseNote.createMany({
      data: allNotes.map(n => ({
        id: n.id,
        caseId: n.caseId,
        author: n.author,
        authorRole: "",
        content: n.content,
        timestamp: n.timestamp,
        type: n.type,
      })),
    });
  }

  // Alerts
  await prisma.alert.createMany({
    data: ALERTS.map(a => ({
      id: a.id,
      customerId: a.customerId,
      customerName: a.customerName,
      type: a.type,
      source: a.source,
      riskScore: a.riskScore,
      status: a.status,
      priority: a.priority ?? null,
      assignedTo: a.assignedTo ?? null,
      createdDate: a.createdDate,
      slaDue: a.slaDue,
      description: a.description,
      caseId: a.caseId ?? null,
    })),
  });

  // SAR Reviews
  await prisma.sARReview.createMany({
    data: SAR_REVIEWS.map(s => ({
      id: s.id,
      caseId: s.caseId,
      customerId: s.customerId,
      customerName: s.customerName,
      detectionDate: s.detectionDate,
      sarDeadline: s.sarDeadline,
      status: s.status,
      recommendedBy: s.recommendedBy,
      finalDecisionMaker: s.finalDecisionMaker ?? null,
      filingStatus: s.filingStatus ?? null,
      continuingSarDue: s.continuingSarDue ?? null,
      amount: s.amount,
      narrative: s.narrative ?? null,
    })),
  });

  // Transactions
  await prisma.transaction.createMany({
    data: TRANSACTIONS.map(t => ({
      id: t.id,
      customerId: t.customerId,
      customerName: t.customerName,
      type: t.type,
      amount: t.amount,
      currency: t.currency,
      status: t.status,
      counterparty: t.counterparty,
      date: t.date,
      channel: t.channel,
      flagged: t.flagged,
    })),
  });

  // Audit log
  await prisma.auditLogEntry.createMany({
    data: AUDIT_LOG.map(e => ({
      id: e.id,
      timestamp: e.timestamp,
      actor: e.actor,
      actorRole: e.actorRole,
      action: e.action,
      entityType: e.entityType,
      entityId: e.entityId,
      details: e.details,
      ipAddress: e.ipAddress,
      previousStatus: e.previousStatus ?? null,
      newStatus: e.newStatus ?? null,
      reason: e.reason ?? null,
    })),
  });

  const counts = await Promise.all([
    prisma.user.count(),
    prisma.customer.count(),
    prisma.alert.count(),
    prisma.case.count(),
    prisma.sARReview.count(),
    prisma.transaction.count(),
    prisma.auditLogEntry.count(),
  ]);
  console.log(`Seeded: ${counts[0]} users, ${counts[1]} customers, ${counts[2]} alerts, ${counts[3]} cases, ${counts[4]} SARs, ${counts[5]} transactions, ${counts[6]} audit entries`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
