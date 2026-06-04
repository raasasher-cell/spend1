import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;
  const caseId = searchParams.get("id") ?? undefined;

  const cases = await prisma.case.findMany({
    where: {
      ...(status && { status }),
      ...(caseId && { id: caseId }),
    },
    include: {
      notes: { orderBy: { timestamp: "asc" } },
      alerts: { select: { id: true, type: true, riskScore: true } },
      sarReviews: { select: { id: true, status: true, amount: true } },
    },
    orderBy: { updatedDate: "desc" },
    take: 500,
  });

  const headers = ["Case ID", "Customer ID", "Customer Name", "Status", "Priority", "Assigned To", "Created Date", "Updated Date", "Alerts", "SAR Status", "Description"];
  const rows = cases.map(c => [
    c.id, c.customerId, c.customerName, c.status, c.priority,
    c.assignedTo, c.createdDate, c.updatedDate,
    c.alerts.length,
    c.sarStatus ?? "",
    `"${c.description.replace(/"/g, '""')}"`,
  ]);

  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const date = new Date().toISOString().split("T")[0];

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="cases-export-${date}.csv"`,
    },
  });
}
