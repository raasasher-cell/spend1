import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const { forbidden } = await requireSession(req);
  if (forbidden) return forbidden;

  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;

  const customers = await prisma.customer.findMany({
    where: {
      kycStatus: status ? status : { in: ["Pending", "Manual Review"] },
    },
    select: {
      id: true, name: true, type: true, status: true,
      riskRating: true, kycStatus: true, screeningStatus: true,
      dateOnboarded: true, country: true,
      kycVerifiedAt: true, kycExpiresAt: true,
      kycVendorRef: true, kycDocScore: true, kycFaceScore: true, kycDecision: true,
      _count: { select: { alerts: { where: { source: "KYC" } } } },
    },
    orderBy: { dateOnboarded: "desc" },
  });

  return NextResponse.json({ customers, total: customers.length });
}
