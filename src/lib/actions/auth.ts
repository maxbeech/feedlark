"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { createWorkspaceForUser } from "@/lib/data/workspace";
import { ACTIVE_WS_COOKIE, seatUsage } from "@/lib/data/team";
import { syncSeatQuantity } from "@/lib/stripe-seats";
import { limitsFor } from "@/lib/plans";

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

  const userId = newId("usr");
  await db.insert(schema.users).values({
    id: userId,
    email,
    passwordHash: await hashPassword(parsed.data.password),
    name: parsed.data.name ?? "",
  });

  // Joining a team via an invite skips creating a personal workspace.
  const inviteToken = String(formData.get("inviteToken") || "").trim();
  const joined = inviteToken ? await joinViaInvite(userId, email, inviteToken) : false;
  if (!joined) {
    const wsName = parsed.data.company || parsed.data.name || email.split("@")[0];
    await createWorkspaceForUser(userId, wsName, wsName);
  }
  await setSessionCookie(userId);
  redirect("/dashboard");
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

export async function loginAction(_prev: ActionResult, formData: FormData): Promise<ActionResult> {
  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const email = parsed.data.email.toLowerCase();
  const rows = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
  const user = rows[0];
  if (!user || !(await verifyPassword(parsed.data.password, user.passwordHash))) {
    return { error: "Invalid email or password." };
  }
  await setSessionCookie(user.id);
  // Honour a safe same-site redirect (e.g. back to an invite link).
  const next = String(formData.get("next") || "");
  redirect(/^\/[^/].*/.test(next) ? next : "/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
