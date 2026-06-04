import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const { forbidden } = await requireSession(req);
  if (forbidden) return forbidden;

  const { searchParams } = req.nextUrl;
  const tab = searchParams.get("tab") ?? "fraud";

  const sources = tab === "chargeback" ? ["Chargeback"] : ["Fraud"];

  const [alerts, kpis] = await Promise.all([
    prisma.alert.findMany({
      where: { source: { in: sources } },
      orderBy: { createdDate: "desc" },
      take: 200,
    }),
    Promise.all([
      prisma.alert.count({ where: { source: "Fraud", status: { in: ["Open", "In Review", "Escalated"] } } }),
      prisma.alert.count({ where: { source: "Chargeback", status: { in: ["Open", "In Review", "Escalated"] } } }),
      prisma.alert.count({ where: { source: "Fraud", status: { in: ["Open", "In Review", "Escalated"] }, priority: "Critical" } }),
      prisma.alert.count({ where: { source: { in: ["Fraud", "Chargeback"] }, status: "Closed" } }),
    ]),
  ]);

  const [openFraud, openChargebacks, criticalFraud, resolvedTotal] = kpis;

  return NextResponse.json({
    alerts,
    kpis: { openFraud, openChargebacks, criticalFraud, resolvedTotal },
  });
}
