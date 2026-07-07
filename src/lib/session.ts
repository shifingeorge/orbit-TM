import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/types";

/**
 * Stateless session: a signed (HS256) JWT stored in an httpOnly cookie.
 * The cookie NAME is duplicated as a literal in `src/proxy.ts` (which runs
 * before route code and cannot import this server-only module) — keep them
 * in sync.
 */
export const SESSION_COOKIE = "orbit_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export interface SessionPayload {
  userId: string;
  role: UserRole;
}

function getSecret(): Uint8Array {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not set");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string, role: UserRole): Promise<void> {
  const token = await new SignJWT({ userId, role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.userId === "string" &&
      (payload.role === "founder" || payload.role === "manager" || payload.role === "staff")
    ) {
      return { userId: payload.userId, role: payload.role };
    }
    return null;
  } catch {
    return null;
  }
}
