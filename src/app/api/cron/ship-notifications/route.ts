import { NextResponse } from "next/server";
import { lt } from "drizzle-orm";
import { drainShipNotifications } from "@/lib/ship-drain";
import { db, schema } from "@/lib/db";
import { checkCronAuth } from "@/lib/cron-auth";
import { captureServerError } from "@/lib/capture";

/**
 * Daily maintenance cron: drain any queued ship notifications left pending
 * (the primary drain runs in after() right after a post ships) and sweep
 * expired rate-limit buckets + error events older than 30 days.
 */
export async function GET(req: Request) {
  const auth = checkCronAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const result = await drainShipNotifications();

  const nowSec = Math.floor(Date.now() / 1000);
  let swept = { rateLimits: 0, errors: 0 };
  try {
    const rl = await db.delete(schema.rateLimits).where(lt(schema.rateLimits.expiresAt, nowSec)).returning({ b: schema.rateLimits.bucket });
    const er = await db.delete(schema.errorEvents).where(lt(schema.errorEvents.createdAt, nowSec - 60 * 60 * 24 * 30)).returning({ id: schema.errorEvents.id });
    swept = { rateLimits: rl.length, errors: er.length };
  } catch (error) {
    captureServerError(error, { scope: "cron-sweep" }); // best-effort, but visible
  }

  return NextResponse.json({ ok: true, ...result, swept });
}
