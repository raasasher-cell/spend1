import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const { session, forbidden } = await requirePermission(req, "export_data");
  if (forbidden) return forbidden;

  const sars = await prisma.sARReview.findMany({
    orderBy: { sarDeadline: "asc" },
    take: 500,
  });

  const headers = ["SAR ID", "Case ID", "Customer ID", "Customer Name", "Detection Date", "SAR Deadline", "Status", "Amount", "Recommended By", "Final Decision Maker", "Filing Status", "Narrative"];
  const rows = sars.map(s => [
    s.id, s.caseId, s.customerId, s.customerName,
    s.detectionDate, s.sarDeadline, s.status,
    s.amount, s.recommendedBy,
    s.finalDecisionMaker ?? "", s.filingStatus ?? "",
    `"${(s.narrative ?? "").replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const date = new Date().toISOString().split("T")[0];

  await prisma.auditLogEntry.create({
    data: {
      id: `AUD-EXP-SAR-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: session!.name,
      actorRole: session!.role,
      action: "CSV Export: SAR Reviews",
      entityType: "Export",
      entityId: "bulk",
      details: `Exported ${sars.length} SAR reviews`,
      ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
    },
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="sar-reviews-${date}.csv"`,
    },
  });
}
