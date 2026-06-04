import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      alerts: { orderBy: { createdDate: "desc" } },
      cases: { orderBy: { updatedDate: "desc" }, include: { notes: true } },
      transactions: { orderBy: { date: "desc" }, take: 20 },
      sarReviews: { orderBy: { sarDeadline: "asc" } },
    },
  });
  if (!customer) return NextResponse.json({ error: "Customer not found" }, { status: 404 });
  return NextResponse.json(customer);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const existing = await prisma.customer.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: "Customer not found" }, { status: 404 });

  const updated = await prisma.customer.update({ where: { id }, data: body });
  return NextResponse.json(updated);
}
