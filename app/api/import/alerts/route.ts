import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";
import { createAuditLog } from "@/lib/audit";

const REQUIRED = ["customerId", "type", "source", "riskScore", "priority", "description"];
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
  type AlertRow = { id: string; customerId: string; customerName: string; type: string; source: string; riskScore: number; status: string; priority: string; assignedTo: string | null; createdDate: string; slaDue: string; description: string };
  const valid: AlertRow[] = [];
  const today = new Date().toISOString().split("T")[0];

  for (let i = 0; i < rows.length; i++) {
    const r = rows[i];
    const rowNum = i + 2;

    const customer = await prisma.customer.findUnique({ where: { id: r.customerId }, select: { id: true, name: true } });
    if (!customer) { errors.push({ row: rowNum, error: `Customer ${r.customerId} not found` }); continue; }

    const riskScore = parseInt(r.riskScore);
    if (isNaN(riskScore) || riskScore < 0 || riskScore > 100) {
      errors.push({ row: rowNum, error: "riskScore must be 0-100" }); continue;
    }

    const slaDays = r.priority === "Critical" ? 1 : r.priority === "High" ? 2 : r.priority === "Medium" ? 5 : 7;
    const slaDue = new Date(Date.now() + slaDays * 86400000).toISOString().split("T")[0];

    valid.push({
      id: `ALT-IMP-${Date.now()}-${i}`,
      customerId: customer.id,
      customerName: customer.name,
      type: r.type,
      source: r.source,
      riskScore,
      status: "Open",
      priority: r.priority || "Medium",
      assignedTo: r.assignedTo || null,
      createdDate: today,
      slaDue,
      description: r.description,
    });
  }

  if (valid.length > 0) {
    await prisma.alert.createMany({ data: valid });
  }

  await createAuditLog(session!, req, "CSV Import Completed", "Import", "bulk",
    `Imported ${valid.length} alerts from ${file.name} (${rows.length} rows, ${errors.length} errors)`,
  );

  return NextResponse.json({ imported: valid.length, errors, total: rows.length });
}
