import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;
  const customerId = searchParams.get("customerId") ?? undefined;
  const caseId = searchParams.get("caseId") ?? undefined;

  const where = {
    ...(status && { status }),
    ...(customerId && { customerId }),
    ...(caseId && { caseId }),
  };

  const sarReviews = await prisma.sARReview.findMany({
    where,
    orderBy: { sarDeadline: "asc" },
  });

  return NextResponse.json(sarReviews);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const sar = await prisma.sARReview.create({ data: body });
  return NextResponse.json(sar, { status: 201 });
}
