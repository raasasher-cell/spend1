import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth-guard";

// Only roles with view_audit permission may read the audit log.
export async function GET(req: NextRequest) {
  const { session, forbidden } = await requirePermission(req, "view_audit");
  if (forbidden) return forbidden;
  void session;

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

// Direct client writes are prohibited — audit entries are created server-side only.
export function POST() {
  return NextResponse.json(
    { error: "Method not allowed. Audit log entries are created by server-side workflow actions only." },
    { status: 405, headers: { Allow: "GET" } },
  );
}

export function PUT() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "GET" } });
}

export function PATCH() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "GET" } });
}

export function DELETE() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405, headers: { Allow: "GET" } });
}
