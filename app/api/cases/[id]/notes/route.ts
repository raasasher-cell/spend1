import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notes = await prisma.caseNote.findMany({
    where: { caseId: id },
    orderBy: { timestamp: "desc" },
  });
  return NextResponse.json(notes);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();

  const caseExists = await prisma.case.findUnique({ where: { id } });
  if (!caseExists) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const note = await prisma.caseNote.create({
    data: { ...body, caseId: id },
  });

  await prisma.case.update({
    where: { id },
    data: { updatedDate: new Date().toISOString().split("T")[0] },
  });

  return NextResponse.json(note, { status: 201 });
}
