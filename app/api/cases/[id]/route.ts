import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caseData = await prisma.case.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { timestamp: "desc" } },
      alerts: true,
      sarReviews: true,
    },
  });
  if (!caseData) return NextResponse.json({ error: "Case not found" }, { status: 404 });
  return NextResponse.json(caseData);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const { _audit, _note, ...caseData } = body;

  const existing = await prisma.case.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const [updated] = await prisma.$transaction(async (tx) => {
    const updatedCase = await tx.case.update({
      where: { id },
      data: { ...caseData, updatedDate: new Date().toISOString().split("T")[0] },
      include: { notes: true, alerts: { select: { id: true } }, sarReviews: true },
    });

    if (_note) await tx.caseNote.create({ data: _note });
    if (_audit) await tx.auditLogEntry.create({ data: _audit });

    return [updatedCase];
  });

  return NextResponse.json(updated);
}
