import { NextResponse } from "next/server";
import { lt } from "drizzle-orm";
import { drainShipNotifications } from "@/lib/ship-drain";
import { db, schema } from "@/lib/db";

// Cron can run longer than a normal request; allow the drainer room to work.
export const maxDuration = 300;

/**
 * Daily maintenance cron: drain any queued ship notifications left pending
 * (the primary drain runs in after() right after a post ships) and sweep
 * expired rate-limit buckets + error events older than 30 days.
 */
export async function GET(req: Request) {
  // Vercel attaches `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const result = await drainShipNotifications();

  const nowSec = Math.floor(Date.now() / 1000);
  let swept = { rateLimits: 0, errors: 0 };
  try {
    const rl = await db.delete(schema.rateLimits).where(lt(schema.rateLimits.expiresAt, nowSec)).returning({ b: schema.rateLimits.bucket });
    const er = await db.delete(schema.errorEvents).where(lt(schema.errorEvents.createdAt, nowSec - 60 * 60 * 24 * 30)).returning({ id: schema.errorEvents.id });
    swept = { rateLimits: rl.length, errors: er.length };
  } catch {
    /* sweep is best-effort */
  }

  return NextResponse.json({ ok: true, ...result, swept });
}
