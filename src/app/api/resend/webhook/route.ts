import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { db, schema } from "@/lib/db";

/** Verify a Svix-signed Resend webhook without pulling in the svix SDK. */
function verifySvix(secret: string, headers: Headers, body: string): boolean {
  const id = headers.get("svix-id");
  const ts = headers.get("svix-timestamp");
  const sigHeader = headers.get("svix-signature");
  if (!id || !ts || !sigHeader) return false;
  const key = Buffer.from(secret.replace(/^whsec_/, ""), "base64");
  const expected = crypto.createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest("base64");
  // Header is space-separated "v1,<sig>" pairs; any match passes.
  return sigHeader.split(" ").some((part) => {
    const sig = part.split(",")[1];
    if (!sig || sig.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  });
}

const SUPPRESS_TYPES: Record<string, "bounce" | "complaint"> = {
  "email.bounced": "bounce",
  "email.complained": "complaint",
};

export async function POST(req: Request) {
  const secret = process.env.RESEND_WEBHOOK_SECRET;
  // Accepting unverified events would let anyone suppress arbitrary addresses.
  if (!secret) return NextResponse.json({ error: "unconfigured" }, { status: 503 });

  const raw = await req.text();
  if (!verifySvix(secret, req.headers, raw)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  let event: { type?: string; data?: { to?: string | string[]; email?: string } };
  try { event = JSON.parse(raw); } catch { return NextResponse.json({ error: "bad_json" }, { status: 400 }); }

  const reason = event.type ? SUPPRESS_TYPES[event.type] : undefined;
  if (reason) {
    const to = event.data?.to ?? event.data?.email;
    const emails = (Array.isArray(to) ? to : [to]).filter(Boolean).map((e) => String(e).toLowerCase());
    for (const email of emails) {
      await db.insert(schema.emailSuppressions).values({ email, reason }).onConflictDoNothing();
    }
  }
  return NextResponse.json({ received: true });
}
