import { NextRequest, NextResponse } from "next/server";
import { getSessionFromRequest } from "./session";
import { hasPermission, Permission } from "./permissions";

export async function requireSession(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (!session) {
    return { session: null, forbidden: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session, forbidden: null };
}

export async function requirePermission(req: NextRequest, permission: Permission) {
  const { session, forbidden } = await requireSession(req);
  if (forbidden) return { session: null, forbidden };
  if (!hasPermission(session!.role, permission)) {
    return { session: null, forbidden: NextResponse.json({ error: `Forbidden: requires ${permission}` }, { status: 403 }) };
  }
  return { session, forbidden: null };
}
