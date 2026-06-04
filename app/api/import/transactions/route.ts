import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const REQUIRED = ["customerId", "type", "amount", "currency", "counterparty", "date", "channel", "status"];

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

  const text = await file.text();
  const rows = parseCSV(text);

  const missing = REQUIRED.filter(f => !rows[0] || !(f in rows[0]));
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing columns: ${missing.join(", ")}` }, { status: 400 });
  }

  const errors: { row: number; error: string }[] = [];
  type TxRow = { id: string; customerId: string; customerName: string; type: string; amount: number; currency: string; counterparty: string; date: string; channel: string; status: string; flagged: boolean };
  const valid: TxRow[] = [];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowNum = i + 2;

    const customer = await prisma.customer.findUnique({ where: { id: r.customerId }, select: { id: true, name: true } });
    if (!customer) { errors.push({ row: rowNum, error: `Customer ${r.customerId} not found` }); continue; }

    const amount = parseFloat(r.amount);
    if (isNaN(amount) || amount <= 0) { errors.push({ row: rowNum, error: "Invalid amount" }); continue; }

    if (!r.date.match(/^\d{4}-\d{2}-\d{2}$/)) { errors.push({ row: rowNum, error: "Date must be YYYY-MM-DD" }); continue; }

    valid.push({
      id: `TXN-IMP-${Date.now()}-${i}`,
      customerId: customer.id,
      customerName: customer.name,
      type: r.type,
      amount,
      currency: r.currency || "USD",
      counterparty: r.counterparty,
      date: r.date,
      channel: r.channel,
      status: r.status,
      flagged: r.flagged?.toLowerCase() === "true",
    });
  }

  if (valid.length > 0) {
    await prisma.transaction.createMany({ data: valid });
  }

  return NextResponse.json({ imported: valid.length, errors, total: rows.length });
}
