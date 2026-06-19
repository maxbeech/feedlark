import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";

const COOKIE = "fl_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days

/**
 * The single signing key for every JWT we issue (sessions, password resets).
 * Refuses to fall back to a known dev secret in production so a misconfigured
 * deploy fails loudly instead of issuing forgeable tokens.
 */
export function authSecret(): Uint8Array {
  const s = process.env.AUTH_SECRET;
  if (!s) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("AUTH_SECRET is not set. Refusing to sign tokens with a known dev secret.");
    }
    return new TextEncoder().encode("dev-insecure-secret-change-me-please-32x");
  }
  return new TextEncoder().encode(s);
}

export async function createSession(userId: string): Promise<string> {
  return new SignJWT({ uid: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(authSecret());
}

export async function setSessionCookie(userId: string): Promise<void> {
  const token = await createSession(userId);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  (await cookies()).delete(COOKIE);
}

export async function getSessionUserId(): Promise<string | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecret());
    return (payload.uid as string) || null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const uid = await getSessionUserId();
  if (!uid) return null;
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, uid)).limit(1);
  return rows[0] ?? null;
}
