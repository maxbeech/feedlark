"use server";

import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db, schema } from "@/lib/db";
import { newId } from "@/lib/ids";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, clearSessionCookie } from "@/lib/auth/session";
import { createWorkspaceForUser } from "@/lib/data/workspace";

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

  const wsName = parsed.data.company || parsed.data.name || email.split("@")[0];
  await createWorkspaceForUser(userId, wsName, wsName);
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
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/");
}
