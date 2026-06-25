"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { SignJWT } from "jose";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import { hashPassword, verifyAgainst } from "@/lib/auth/password";
import { setSessionCookie, clearSessionCookie, authSecret } from "@/lib/auth/session";
import { createWorkspaceForUser } from "@/lib/data/workspace";
import { ACTIVE_WS_COOKIE, seatUsage } from "@/lib/data/team";
import { syncSeatQuantity } from "@/lib/stripe-seats";
import { limitsFor } from "@/lib/plans";
import { sendEmail, emailConfigured } from "@/lib/email";
import { absoluteUrl } from "@/lib/utils";
import { checkRateLimit, clientIp } from "@/lib/ratelimit";

// Only require email confirmation when email actually works, so a missing
// RESEND key can never lock everyone out of signing in.
const verificationRequired = emailConfigured;

async function sendVerificationEmail(userId: string, email: string): Promise<void> {
  const token = await new SignJWT({ uid: userId, purpose: "verify" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(authSecret());
  await sendEmail({
    to: email,
    subject: "Confirm your email for Feedlark",
    text: `Welcome to Feedlark. Confirm your email to finish setting up your account (link valid 24 hours):\n\n${absoluteUrl(`/api/auth/verify?token=${token}`)}\n\nIf you didn't sign up, ignore this email.`,
  });
}

/**
 * If signup carries a valid invite token for this email, join that workspace as
 * an admin instead of creating a personal one. Returns true if joined.
 */
async function joinViaInvite(userId: string, email: string, token: string): Promise<boolean> {
  const inv = (await db.select().from(schema.invitations).where(eq(schema.invitations.token, token)).limit(1))[0];
  if (!inv || inv.expiresAt < Math.floor(Date.now() / 1000) || inv.email.toLowerCase() !== email) return false;
  const ws = (await db.select().from(schema.workspaces).where(eq(schema.workspaces.id, inv.workspaceId)).limit(1))[0];
  if (!ws || (await seatUsage(ws.id)).members >= limitsFor(ws.plan).seats) return false;
  await db.insert(schema.workspaceMembers).values({ id: newId("mem"), workspaceId: ws.id, userId, role: "admin" });
  await db.delete(schema.invitations).where(eq(schema.invitations.id, inv.id));
  try { await syncSeatQuantity(ws.stripeSubscriptionId, (await seatUsage(ws.id)).members); } catch { /* reconciles later */ }
  (await cookies()).set(ACTIVE_WS_COOKIE, ws.id, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  return true;
}

const signupSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().trim().max(80).optional(),
  company: z.string().trim().max(80).optional(),
});

export type ActionResult = { error?: string };

export async function signupAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  if (!(await checkRateLimit("signup", await clientIp()))) {
    return { error: "Too many signups from your network. Please try again later." };
  }
  const parsed = signupSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    name: formData.get("name") || undefined,
    company: formData.get("company") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const email = parsed.data.email.toLowerCase();
  const existing = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email)).limit(1);
  if (existing.length) return { error: "An account with that email already exists. Try logging in." };

  const inviteToken = String(formData.get("inviteToken") || "").trim();
  const userId = newId("usr");
  // Always start unverified; only a SUCCESSFULLY validated invite (token valid
  // AND issued for this email) or email being disabled may flip this — never the
  // mere presence of an attacker-supplied token.
  await db.insert(schema.users).values({
    id: userId,
    email,
    passwordHash: await hashPassword(parsed.data.password),
    name: parsed.data.name ?? "",
    emailVerified: false,
  });

  const joined = inviteToken ? await joinViaInvite(userId, email, inviteToken) : false;
  if (!joined) {
    const wsName = parsed.data.company || parsed.data.name || email.split("@")[0];
    await createWorkspaceForUser(userId, wsName, wsName);
  }

  // A real invite proves inbox control; otherwise verification is only skipped
  // when email isn't configured at all.
  const verified = joined || !verificationRequired;
  if (verified) {
    await db.update(schema.users).set({ emailVerified: true }).where(eq(schema.users.id, userId));
    await setSessionCookie(userId);
    redirect("/dashboard");
  }
  // Unverified: send the confirmation email and ask them to check their inbox.
  await sendVerificationEmail(userId, email);
  redirect(`/check-email?email=${encodeURIComponent(email)}`);
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export type LoginResult = { error?: string; needsVerification?: boolean };

export async function loginAction(_prev: LoginResult, formData: FormData): Promise<LoginResult> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const email = parsed.data.email.toLowerCase();
  if (!(await checkRateLimit("login", `${await clientIp()}:${email}`))) {
    return { error: "Too many attempts. Please wait a few minutes and try again." };
  }

  const user = (await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1))[0];
  // Constant-work compare whether or not the account exists (no enumeration).
  const ok = await verifyAgainst(parsed.data.password, user?.passwordHash);
  if (!user || !ok) return { error: "Invalid email or password." };

  if (verificationRequired && !user.emailVerified) {
    return { error: "Please confirm your email first. Check your inbox for the link.", needsVerification: true };
  }

  await setSessionCookie(user.id);
  const next = String(formData.get("next") || "");
  redirect(/^\/[^/].*/.test(next) ? next : "/dashboard");
}

export type ResendResult = { ok?: boolean; error?: string };

export async function resendVerificationAction(_prev: ResendResult, formData: FormData): Promise<ResendResult> {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  if (!email) return { error: "Enter your email." };
  if (!(await checkRateLimit("verifyResend", `${await clientIp()}:${email}`))) {
    return { error: "Too many requests. Please try again later." };
  }
  const user = (await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1))[0];
  // Same response regardless of existence; only actually send if needed.
  if (user && !user.emailVerified && emailConfigured) await sendVerificationEmail(user.id, email);
  return { ok: true };
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
