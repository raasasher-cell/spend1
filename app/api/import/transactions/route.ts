import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";

const REQUIRED = ["customerId", "type", "amount", "currency", "counterparty", "date", "channel", "status"];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function parseCSV(text: string): Record<string, string>[] {
  const lines = text.trim().split(/\r?\n/);
  const headers = lines[0].split(",").map(h => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const vals = line.split(",").map(v => v.trim().replace(/^"|"$/g, ""));
    return Object.fromEntries(headers.map((h, i) => [h, vals[i] ?? ""]));
  });
}

export async function POST(req: NextRequest) {
  const { session, forbidden } = await requirePermission(req, "import_data");
  if (forbidden) return forbidden;

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
    return NextResponse.json({ error: "Only CSV files are accepted" }, { status: 400 });
  }

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

  await prisma.auditLogEntry.create({
    data: {
      id: `AUD-IMP-TXN-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: session!.name,
      actorRole: session!.role,
      action: "CSV Import: Transactions",
      entityType: "Import",
      entityId: "bulk",
      details: `Imported ${valid.length} transactions from ${file.name} (${rows.length} rows, ${errors.length} errors)`,
      ipAddress: req.headers.get("x-forwarded-for") ?? "unknown",
    },
  });

  return NextResponse.json({ imported: valid.length, errors, total: rows.length });
}
