import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { createAuditLog } from "@/lib/audit";

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

  await createAuditLog(session!, req, "Export Generated", "Export", "bulk",
    `Exported ${sars.length} SAR reviews`,
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="sar-reviews-${date}.csv"`,
    },
  });
}
