import "server-only";
import { cookies } from "next/headers";
import { analyticsUserRef } from "@/lib/analytics-identity";

/**
 * Who just signed up and is waiting on the confirmation email. Kept in a cookie
 * rather than the /check-email URL: every page URL is sent to analytics as the
 * page path, and that must never carry an email address. Lives as long as the
 * confirmation link does.
 */
export const PENDING_SIGNUP_COOKIE = "fl_pending_signup";
const MAX_AGE = 60 * 60 * 24;

export type PendingSignup = { email: string; userRef: string };

export async function rememberPendingSignup(userId: string, email: string): Promise<void> {
  const value = JSON.stringify({ e: email, r: analyticsUserRef(userId) });
  (await cookies()).set(PENDING_SIGNUP_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export function parsePendingSignup(raw: string | undefined): PendingSignup | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as { e?: unknown; r?: unknown };
    if (typeof v.e !== "string" || typeof v.r !== "string" || !/^[0-9a-f]{16}$/.test(v.r)) return null;
    return { email: v.e, userRef: v.r };
  } catch {
    return null;
  }
}

export async function readPendingSignup(): Promise<PendingSignup | null> {
  return parsePendingSignup((await cookies()).get(PENDING_SIGNUP_COOKIE)?.value);
}
