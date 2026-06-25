import { NextResponse } from "next/server";
import { db, schema } from "@/lib/db";
import { verifyUnsubscribeToken } from "@/lib/email";

async function suppress(email: string) {
  await db.insert(schema.emailSuppressions).values({ email, reason: "unsubscribe" }).onConflictDoNothing();
}

/** One-click unsubscribe (RFC 8058): Gmail/Yahoo POST here directly. */
export async function POST(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const email = await verifyUnsubscribeToken(token);
  if (!email) return NextResponse.json({ ok: false }, { status: 400 });
  await suppress(email);
  return NextResponse.json({ ok: true });
}

/** Human-facing unsubscribe (clicking the link in an email). */
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get("token") ?? "";
  const email = await verifyUnsubscribeToken(token);
  const msg = email
    ? "You're unsubscribed. You won't receive any more update emails from Feedlark boards."
    : "This unsubscribe link is invalid or has expired.";
  if (email) await suppress(email);
  return new NextResponse(
    `<!doctype html><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Unsubscribe · Feedlark</title><body style="font-family:system-ui,sans-serif;max-width:34rem;margin:4rem auto;padding:0 1.5rem;color:#1c1714"><h1 style="font-size:1.25rem">${email ? "Unsubscribed" : "Link invalid"}</h1><p style="color:#6b6358;line-height:1.6">${msg}</p></body>`,
    { status: email ? 200 : 400, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
