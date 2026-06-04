import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;
  const priority = searchParams.get("priority") ?? undefined;
  const source = searchParams.get("source") ?? undefined;
  const assignedTo = searchParams.get("assignedTo") ?? undefined;
  const customerId = searchParams.get("customerId") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "50")));

  const where = {
    ...(status && { status }),
    ...(priority && { priority }),
    ...(source && { source }),
    ...(assignedTo && { assignedTo }),
    ...(customerId && { customerId }),
    ...(q && {
      OR: [
        { id: { contains: q } },
        { customerName: { contains: q } },
        { type: { contains: q } },
      ],
    }),
  };

  const [total, alerts] = await Promise.all([
    prisma.alert.count({ where }),
    prisma.alert.findMany({
      where,
      orderBy: { createdDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ alerts, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const alert = await prisma.alert.create({ data: body });
  return NextResponse.json(alert, { status: 201 });
}
