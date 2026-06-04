import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, requireSession } from "@/lib/auth-guard";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { forbidden } = await requireSession(req);
  if (forbidden) return forbidden;
  const { id } = await params;
  const sar = await prisma.sARReview.findUnique({ where: { id } });
  if (!sar) return NextResponse.json({ error: "SAR review not found" }, { status: 404 });
  return NextResponse.json(sar);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // SAR approval and filing require BSA Officer or Admin
  const { forbidden } = await requirePermission(req, "approve_sar");
  if (forbidden) return forbidden;

  const { id } = await params;
  const body = await req.json();
  const { _audit, ...sarData } = body;

  const existing = await prisma.sARReview.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "SAR review not found" }, { status: 404 });

  const updated = await prisma.$transaction(async (tx) => {
    const sar = await tx.sARReview.update({ where: { id }, data: sarData });
    if (_audit) await tx.auditLogEntry.create({ data: _audit });
    return sar;
  });

  return NextResponse.json(updated);
}
