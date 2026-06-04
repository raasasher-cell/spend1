import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const entityType = searchParams.get("entityType") ?? undefined;
  const entityId = searchParams.get("entityId") ?? undefined;
  const actor = searchParams.get("actor") ?? undefined;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"));
  const pageSize = Math.min(200, Math.max(1, Number(searchParams.get("pageSize") ?? "50")));

  const where = {
    ...(entityType && { entityType }),
    ...(entityId && { entityId }),
    ...(actor && { actor }),
  };

  const [total, entries] = await Promise.all([
    prisma.auditLogEntry.count({ where }),
    prisma.auditLogEntry.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return NextResponse.json({ entries, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const entry = await prisma.auditLogEntry.create({ data: body });
  return NextResponse.json(entry, { status: 201 });
}
