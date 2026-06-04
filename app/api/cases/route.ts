import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const status = searchParams.get("status") ?? undefined;
  const priority = searchParams.get("priority") ?? undefined;
  const assignedTo = searchParams.get("assignedTo") ?? undefined;
  const customerId = searchParams.get("customerId") ?? undefined;
  const q = searchParams.get("q") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") ?? "50")));

  const where = {
    ...(status && { status }),
    ...(priority && { priority }),
    ...(assignedTo && { assignedTo }),
    ...(customerId && { customerId }),
    ...(q && {
      OR: [
        { id: { contains: q } },
        { customerName: { contains: q } },
        { description: { contains: q } },
      ],
    }),
  };

  const [total, cases] = await Promise.all([
    prisma.case.count({ where }),
    prisma.case.findMany({
      where,
      include: { notes: true, alerts: { select: { id: true } } },
      orderBy: { updatedDate: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ cases, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { notes: _notes, ...caseData } = body;
  const newCase = await prisma.case.create({ data: caseData, include: { notes: true } });
  return NextResponse.json(newCase, { status: 201 });
}
