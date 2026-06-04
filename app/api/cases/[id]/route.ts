import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";
import { buildAuditEntry, type AuditAction } from "@/lib/audit";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { timestamp: "desc" } },
      alerts: true,
      sarReviews: true,
    },
  });
  if (!caseData) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json(caseData);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { session, forbidden } = await requireSession(req);
  if (forbidden) return forbidden;

  const { id } = await params;
  const body = await req.json();
  // Strip client-supplied audit fields; keep _note (user-authored text) and _reason.
  const { _audit: _dropped, _note, _reason, _closeType, ...caseData } = body;
  void _dropped;

  const existing = await prisma.case.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  // Infer the compliance action from what fields are changing.
  let action: AuditAction;
  let details: string;

  if (caseData.status === "Pending EDD") {
    action = "EDD Requested";
    details = `Enhanced due diligence requested.${_reason ? ` ${_reason}` : ""}`;
  } else if (caseData.status === "Escalated") {
    action = "Case Escalated";
    details = `Case escalated${caseData.assignedTo ? ` to ${caseData.assignedTo}` : ""}.${_reason ? ` Note: ${_reason}` : ""}`;
  } else if (caseData.status === "SAR Review") {
    action = "SAR Recommended";
    details = `SAR review recommended.${_reason ? ` ${_reason}` : ""}`;
  } else if (caseData.status === "Closed") {
    action = _closeType === "false_positive" ? "Case Marked False Positive" : "Case Closed";
    details = `Case closed.${_reason ? ` Reason: ${_reason}` : ""}`;
  } else if (caseData.status !== undefined) {
    action = "Case Created";
    details = `Case status changed to ${caseData.status}.`;
  } else {
    action = "Case Created";
    details = "Case updated.";
  }

  const updated = await prisma.$transaction(async (tx) => {
    const updatedCase = await tx.case.update({
      where: { id },
      data: { ...caseData, updatedDate: new Date().toISOString().split("T")[0] },
      include: { notes: true, alerts: { select: { id: true } }, sarReviews: true },
    });

    if (_note) await tx.caseNote.create({ data: _note });

    await tx.auditLogEntry.create({
      data: buildAuditEntry(session!, req, action, "Case", id, details, {
        previousStatus: existing.status,
        newStatus: String(caseData.status ?? existing.status),
        reason: _reason ?? undefined,
      }),
    });

    return updatedCase;
  });

  return NextResponse.json(updated);
}
