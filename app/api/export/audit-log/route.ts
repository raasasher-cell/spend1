import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const { session, forbidden } = await requirePermission(req, "view_audit");
  if (forbidden) return forbidden;

  const entries = await prisma.auditLogEntry.findMany({
    orderBy: { timestamp: "desc" },
    take: 5000,
  });

  const headers = ["ID", "Timestamp", "Actor", "Actor Role", "Action", "Entity Type", "Entity ID", "Details", "IP Address", "Previous Status", "New Status", "Reason"];
  const rows = entries.map(e => [
    e.id, e.timestamp, e.actor, e.actorRole, e.action,
    e.entityType, e.entityId,
    `"${e.details.replace(/"/g, '""')}"`,
    e.ipAddress, e.previousStatus ?? "", e.newStatus ?? "", e.reason ?? "",
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const date = new Date().toISOString().split("T")[0];

  await prisma.auditLogEntry.create({
    data: {
      id: `AUD-EXP-LOG-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: session!.name,
      actorRole: session!.role,
      action: "CSV Export: Audit Log",
      entityType: "Export",
      entityId: "bulk",
      details: `Exported ${entries.length} audit log entries`,
      ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
    },
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="audit-log-${date}.csv"`,
    },
  });
}
