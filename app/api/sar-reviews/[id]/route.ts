import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireSession } from "@/lib/auth-guard";
import { buildAuditEntry, type AuditAction } from "@/lib/audit";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { forbidden } = await requireSession(req);
  if (forbidden) return forbidden;
  const { id } = await params;
  const sar = await prisma.sARReview.findUnique({ where: { id } });
  if (!sar) return NextResponse.json({ error: "SAR review not found" }, { status: 404 });
  return NextResponse.json(sar);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // SAR decisions require BSA Officer or Admin
  const { session, forbidden } = await requirePermission(req, "approve_sar");
  if (forbidden) return forbidden;

  const { id } = await params;
  const body = await req.json();
  // Strip any client-supplied audit payload; keep _reason (user-typed rationale).
  const { _audit: _dropped, _reason, ...sarData } = body;
  void _dropped;

  const existing = await prisma.sARReview.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "SAR review not found" }, { status: 404 });

  // Infer action from the new status being set.
  let action: AuditAction;
  let details: string;

  if (sarData.status === "SAR Approved") {
    action = "SAR Approved";
    details = `SAR approved by ${session!.name}.${_reason ? ` Rationale: ${_reason}` : ""}`;
  } else if (sarData.status === "SAR Declined") {
    action = "SAR Declined";
    details = `SAR declined by ${session!.name}.${_reason ? ` Rationale: ${_reason}` : ""}`;
  } else if (sarData.status === "Filed") {
    action = "SAR Filed";
    const ref = sarData.filingStatus ?? "";
    details = `SAR filed.${ref ? ` ${ref}` : ""}${_reason ? ` Ref: ${_reason}` : ""}`;
  } else if (sarData.status === "SAR Recommended") {
    action = "SAR Advanced to Recommended";
    details = "SAR advanced to recommended status.";
  } else {
    action = "SAR Advanced to Recommended";
    details = `SAR updated to ${sarData.status ?? "unknown"}.`;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const sar = await tx.sARReview.update({ where: { id }, data: sarData });
    await tx.auditLogEntry.create({
      data: buildAuditEntry(session!, req, action, "SAR", id, details, {
        previousStatus: existing.status,
        newStatus: String(sarData.status ?? existing.status),
        reason: _reason ?? undefined,
      }),
    });
    return sar;
  });

  return NextResponse.json(updated);
}
