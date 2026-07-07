import "server-only";
import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/session";
import type { UserRole } from "@/lib/types";

export function isManager(role: UserRole): boolean {
  return role === "manager" || role === "founder";
}

type Guarded =
  | { session: SessionPayload; error?: undefined }
  | { session?: undefined; error: NextResponse };

/** Returns the current session, or an `{ error }` 401 response when absent. */
export async function requireSession(): Promise<Guarded> {
  const session = await getSession();
  if (!session) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { session };
}

/** Like `requireSession`, but also 403s staff (non-manager) callers. */
export async function requireManager(): Promise<Guarded> {
  const result = await requireSession();
  if (result.error) return result;
  if (!isManager(result.session.role)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return result;
}

/**
 * Row-level guard: managers/founders may touch any task; staff only tasks
 * assigned to them. Returns a 403 response to short-circuit, or null to allow.
 */
export function forbidIfNotOwner(
  session: SessionPayload,
  assignedUserId: string | null
): NextResponse | null {
  if (isManager(session.role)) return null;
  if (assignedUserId !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return null;
}
