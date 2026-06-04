import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const alert = await prisma.alert.findUnique({ where: { id } });
  if (!alert) return NextResponse.json({ error: "Alert not found" }, { status: 404 });
  return NextResponse.json(alert);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.alert.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Alert not found" }, { status: 404 });

  const updated = await prisma.alert.update({ where: { id }, data: body });

  // Write audit log entry if caller provides one
  if (body._audit) {
    await prisma.auditLogEntry.create({ data: body._audit });
  }

  return NextResponse.json(updated);
}
