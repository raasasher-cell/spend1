import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { createAuditLog } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const { session, forbidden } = await requirePermission(req, "export_data");
  if (forbidden) return forbidden;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;
  const priority = searchParams.get("priority") ?? undefined;

  const alerts = await prisma.alert.findMany({
    where: {
      ...(status && { status }),
      ...(priority && { priority }),
    },
    orderBy: { createdDate: "desc" },
    take: 1000,
  });

  const headers = ["ID", "Customer ID", "Customer Name", "Type", "Source", "Risk Score", "Priority", "Status", "Assigned To", "Created Date", "SLA Due", "Description"];
  const rows = alerts.map(a => [
    a.id, a.customerId, a.customerName, a.type, a.source, a.riskScore,
    a.priority ?? "", a.status, a.assignedTo ?? "", a.createdDate, a.slaDue,
    `"${a.description.replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const date = new Date().toISOString().split("T")[0];

  await createAuditLog(session!, req, "Export Generated", "Export", "bulk",
    `Exported ${alerts.length} alerts (filters: status=${status ?? "all"}, priority=${priority ?? "all"})`,
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="alerts-export-${date}.csv"`,
    },
  });
}
