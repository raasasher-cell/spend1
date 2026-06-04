import { NextResponse } from "next/server";

export function isDemoMode(): boolean {
  return process.env.DEMO_MODE === "true";
}

/**
 * Call at the top of any API route that performs a destructive action
 * (delete, reset, wipe). Returns a 403 NextResponse in demo mode, null otherwise.
 *
 * Usage:
 *   const block = assertNotDestructiveInDemoMode("delete_user");
 *   if (block) return block;
 */
export function assertNotDestructiveInDemoMode(
  actionName: string
): NextResponse | null {
  if (!isDemoMode()) return null;
  return NextResponse.json(
    { error: `Demo mode: destructive actions are disabled.`, action: actionName },
    { status: 403 }
  );
}
