import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;
  const riskRating = searchParams.get("riskRating") ?? undefined;
  const kycStatus = searchParams.get("kycStatus") ?? undefined;
  const screeningStatus = searchParams.get("screeningStatus") ?? undefined;
  const type = searchParams.get("type") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "50")));

  const where = {
    ...(status && { status }),
    ...(riskRating && { riskRating }),
    ...(kycStatus && { kycStatus }),
    ...(screeningStatus && { screeningStatus }),
    ...(type && { type }),
    ...(q && {
      OR: [
        { id: { contains: q } },
        { name: { contains: q } },
        { email: { contains: q } },
      ],
    }),
  };

  const [total, customers] = await Promise.all([
    prisma.customer.count({ where }),
    prisma.customer.findMany({
      where,
      orderBy: { name: "asc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ customers, total, page, pageSize });
}
