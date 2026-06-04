import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { createAuditLog } from "@/lib/audit";

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

  await createAuditLog(session!, req, "Export Generated", "Export", "bulk",
    `Exported ${entries.length} audit log entries`,
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="audit-log-${date}.csv"`,
    },
  });
}
