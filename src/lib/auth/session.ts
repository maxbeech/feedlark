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

export async function createSession(userId: string, epoch: number): Promise<string> {
  return new SignJWT({ uid: userId, ep: epoch })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(authSecret());
}

export async function setSessionCookie(userId: string): Promise<void> {
  // Stamp the user's current sessionEpoch into the token so bumping the epoch
  // (password reset / log out everywhere) invalidates all prior tokens.
  const u = (await db.select({ ep: schema.users.sessionEpoch }).from(schema.users).where(eq(schema.users.id, userId)).limit(1))[0];
  const token = await createSession(userId, u?.ep ?? 0);
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

async function getSessionClaims(): Promise<{ uid: string; ep: number } | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, authSecret());
    if (!payload.uid) return null;
    return { uid: payload.uid as string, ep: typeof payload.ep === "number" ? payload.ep : 0 };
  } catch {
    return null;
  }
}

export async function getSessionUserId(): Promise<string | null> {
  return (await getSessionClaims())?.uid ?? null;
}

export async function getCurrentUser() {
  const claims = await getSessionClaims();
  if (!claims) return null;
  const rows = await db.select().from(schema.users).where(eq(schema.users.id, claims.uid)).limit(1);
  const user = rows[0];
  if (!user) return null;
  // Reject tokens issued before the user's current epoch (revoked sessions).
  if ((user.sessionEpoch ?? 0) !== claims.ep) return null;
  return user;
}
