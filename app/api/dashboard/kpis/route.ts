import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  const [
    openAlerts,
    inReviewAlerts,
    escalatedAlerts,
    closedAlerts,
    fpAlerts,
    openCases,
    pastDueSLAs,
    kycManualReviews,
    sarReviewsDue,
    allCases,
  ] = await Promise.all([
    prisma.alert.count({ where: { status: "Open" } }),
    prisma.alert.count({ where: { status: "In Review" } }),
    prisma.alert.count({ where: { status: "Escalated" } }),
    prisma.alert.count({ where: { status: "Closed" } }),
    prisma.alert.count({ where: { status: "False Positive" } }),
    prisma.case.count({ where: { status: { not: "Closed" } } }),
    prisma.alert.count({
      where: {
        status: { in: ["Open", "In Review", "Escalated"] },
        slaDue: { lt: today },
      },
    }),
    prisma.alert.count({ where: { source: "KYC", status: { in: ["Open", "In Review"] } } }),
    prisma.sARReview.count({
      where: { status: { in: ["Pending Review", "SAR Recommended", "SAR Approved"] } },
    }),
    prisma.case.findMany({
      where: { status: { not: "Closed" } },
      select: { createdDate: true },
    }),
  ]);

  const totalResolved = closedAlerts + fpAlerts;
  const fpRate = totalResolved > 0 ? Math.round((fpAlerts / totalResolved) * 100) : 0;

  const avgCaseAgeDays =
    allCases.length > 0
      ? Math.round(
          allCases.reduce((sum, c) => {
            const created = new Date(c.createdDate).getTime();
            const now = Date.now();
            return sum + (now - created) / (1000 * 60 * 60 * 24);
          }, 0) / allCases.length,
        )
      : 0;

  return NextResponse.json({
    openAlerts,
    inReviewAlerts,
    escalatedAlerts,
    closedAlerts,
    fpAlerts,
    openCases,
    pastDueSLAs,
    kycManualReviews,
    sarReviewsDue,
    fpRate,
    avgCaseAgeDays,
  });
}
