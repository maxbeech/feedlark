"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { SignJWT, jwtVerify } from "jose";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";
import { setSessionCookie, authSecret } from "@/lib/auth/session";
import { sendEmail, emailConfigured } from "@/lib/email";
import { absoluteUrl, isValidEmail } from "@/lib/utils";

async function signResetToken(uid: string): Promise<string> {
  return new SignJWT({ uid, purpose: "pw-reset" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30m")
    .sign(authSecret());
}

export type ForgotResult = { ok?: boolean; emailUnconfigured?: boolean; error?: string };

export async function forgotPasswordAction(_prev: ForgotResult, formData: FormData): Promise<ForgotResult> {
  const email = String(formData.get("email") || "").toLowerCase().trim();
  if (!isValidEmail(email)) return { error: "Enter a valid email." };

  const user = (await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1))[0];
  // Always behave the same way regardless of whether the account exists (no enumeration).
  if (user && emailConfigured) {
    const token = await signResetToken(user.id);
    await sendEmail({
      to: email,
      subject: "Reset your Feedlark password",
      text: `Reset your password (link valid for 30 minutes):\n\n${absoluteUrl(`/reset?token=${token}`)}\n\nIf you didn't request this, ignore this email.`,
    });
  }
  return { ok: true, emailUnconfigured: !emailConfigured };
}

const resetSchema = z.object({ token: z.string().min(1), password: z.string().min(8, "Password must be at least 8 characters") });

export async function resetPasswordAction(_prev: { error?: string }, formData: FormData): Promise<{ error?: string }> {
  const parsed = resetSchema.safeParse({ token: formData.get("token"), password: formData.get("password") });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  let uid: string;
  try {
    const { payload } = await jwtVerify(parsed.data.token, authSecret());
    if (payload.purpose !== "pw-reset" || !payload.uid) return { error: "This reset link is invalid or has expired." };
    uid = payload.uid as string;
  } catch {
    return { error: "This reset link is invalid or has expired." };
  }

  const user = (await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.id, uid)).limit(1))[0];
  if (!user) return { error: "Account not found." };

  await db.update(schema.users).set({ passwordHash: await hashPassword(parsed.data.password) }).where(eq(schema.users.id, uid));
  await setSessionCookie(uid);
  redirect("/dashboard");
}
