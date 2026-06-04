import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { buildAuditEntry, type AuditAction } from "@/lib/audit";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alert = await prisma.alert.findUnique({ where: { id } });
  if (!alert) return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  return NextResponse.json(alert);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, forbidden } = await requireSession(req);
  if (forbidden) return forbidden;

  const { id } = await params;
  const body = await req.json();
  // Strip any client-supplied audit fields — actor, role, and timestamp are derived server-side.
  const { _audit: _dropped, _reason, ...alertData } = body;
  void _dropped;

  const existing = await prisma.alert.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Alert not found" }, { status: 404 });

  // Infer which compliance action caused this PATCH so the audit entry is meaningful.
  let action: AuditAction;
  let details: string;

  if (alertData.assignedTo !== undefined && alertData.assignedTo !== existing.assignedTo) {
    action = "Alert Assigned";
    details = `Alert assigned from ${existing.assignedTo ?? "Unassigned"} to ${alertData.assignedTo}.`;
  } else if (alertData.status === "Closed") {
    action = "Alert Closed";
    details = `Alert closed.${_reason ? ` Reason: ${_reason}` : ""}`;
  } else if (alertData.status === "False Positive") {
    action = "Alert Marked False Positive";
    details = `Alert marked as false positive.${_reason ? ` Reason: ${_reason}` : ""}`;
  } else if (alertData.status === "Escalated") {
    action = "Alert Escalated to Case";
    details = `Alert escalated to case.${alertData.caseId ? ` Case: ${alertData.caseId}.` : ""}`;
  } else if (alertData.status !== undefined) {
    action = "Alert Status Changed";
    details = `Status changed from ${existing.status} to ${alertData.status}.`;
  } else {
    // General field update (e.g., priority change) — write audit but don't force a status label.
    action = "Alert Status Changed";
    details = "Alert updated.";
  }

  const results = await prisma.$transaction([
    prisma.alert.update({ where: { id }, data: alertData }),
    prisma.auditLogEntry.create({
      data: buildAuditEntry(session!, req, action, "Alert", id, details, {
        previousStatus: existing.status,
        newStatus: String(alertData.status ?? existing.status),
        reason: _reason ?? undefined,
      }),
    }),
  ]);

  return NextResponse.json(results[0]);
}
