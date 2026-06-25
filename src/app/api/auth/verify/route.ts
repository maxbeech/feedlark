import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { authSecret, setSessionCookie } from "@/lib/auth/session";
import { absoluteUrl } from "@/lib/utils";

/** Confirm an email from the signup link, then log the user in. */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  let uid: string;
  try {
    const { payload } = await jwtVerify(token, authSecret());
    if (payload.purpose !== "verify" || !payload.uid) throw new Error("bad");
    uid = payload.uid as string;
  } catch {
    return NextResponse.redirect(absoluteUrl("/login?verify=invalid"), 303);
  }

  const user = (await db.select().from(schema.users).where(eq(schema.users.id, uid)).limit(1))[0];
  if (!user) return NextResponse.redirect(absoluteUrl("/login?verify=invalid"), 303);

  if (!user.emailVerified) {
    await db.update(schema.users).set({ emailVerified: true }).where(eq(schema.users.id, uid));
  }
  await setSessionCookie(uid);
  return NextResponse.redirect(absoluteUrl("/dashboard"), 303);
}
