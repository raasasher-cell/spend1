import type { NextRequest } from "next/server";
import type { SessionUser } from "./session";
import { prisma } from "./prisma";

// Controlled list of valid audit action types — callers may not supply arbitrary strings.
export type AuditAction =
  | "Alert Assigned"
  | "Alert Status Changed"
  | "Alert Closed"
  | "Alert Marked False Positive"
  | "Alert Escalated to Case"
  | "Alert Linked to Case"
  | "Case Created"
  | "Case Note Added"
  | "EDD Requested"
  | "Case Escalated"
  | "SAR Recommended"
  | "Case Closed"
  | "Case Marked False Positive"
  | "SAR Advanced to Recommended"
  | "SAR Approved"
  | "SAR Declined"
  | "SAR Filed"
  | "SAR Review Created"
  | "KYC Verification Run"
  | "Screening Run"
  | "CSV Import Completed"
  | "Export Generated"
  | "Admin Settings Changed";

export type AuditEntityType =
  | "Alert" | "Case" | "SAR" | "Customer" | "Transaction" | "User" | "System" | "Export" | "Import";

interface AuditExtras {
  previousStatus?: string;
  newStatus?: string;
  reason?: string;
}

function genId(): string {
  return `AUD-${Date.now()}-${Math.floor(Math.random() * 9999)}`;
}

function getIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "127.0.0.1";
}

/**
 * Builds an audit log entry data object. Use this when you need to write the
 * entry inside a Prisma interactive transaction (pass result to tx.auditLogEntry.create).
 */
export function buildAuditEntry(
  session: SessionUser,
  req: NextRequest,
  action: AuditAction,
  entityType: AuditEntityType,
  entityId: string,
  details: string,
  extras?: AuditExtras,
) {
  return {
    id: genId(),
    timestamp: new Date().toISOString(),
    actor: session.name,
    actorRole: session.role,
    action,
    entityType,
    entityId,
    details,
    ipAddress: getIp(req),
    ...(extras?.previousStatus !== undefined && { previousStatus: extras.previousStatus }),
    ...(extras?.newStatus !== undefined && { newStatus: extras.newStatus }),
    ...(extras?.reason !== undefined && { reason: extras.reason }),
  };
}

/**
 * Writes an audit log entry directly (outside a transaction).
 * Actor, role, timestamp, and IP are derived server-side — never from client input.
 */
export async function createAuditLog(
  session: SessionUser,
  req: NextRequest,
  action: AuditAction,
  entityType: AuditEntityType,
  entityId: string,
  details: string,
  extras?: AuditExtras,
): Promise<void> {
  await prisma.auditLogEntry.create({
    data: buildAuditEntry(session, req, action, entityType, entityId, details, extras),
  });
}
