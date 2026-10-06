import "server-only";
import { headers } from "next/headers";
import { sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { clientIpFrom } from "@/lib/client-ip";
import { captureServerError } from "@/lib/capture";

/**
 * Fixed-window rate limiting backed by our own Postgres (Supabase) — no external
 * Redis/service. Each request atomically bumps a per-(action, id, window) counter
 * and is denied once the count exceeds the limit. FAILS OPEN on any DB error so a
 * limiter hiccup never takes the site down.
 */
const LIMITS = {
  login: { limit: 10, windowSec: 600 },
  signup: { limit: 5, windowSec: 3600 },
  passwordReset: { limit: 5, windowSec: 3600 },
  verifyResend: { limit: 5, windowSec: 3600 },
  clientError: { limit: 30, windowSec: 600 },
  post: { limit: 8, windowSec: 600 },
  comment: { limit: 15, windowSec: 600 },
  vote: { limit: 40, windowSec: 600 },
} as const;

export type RateLimitName = keyof typeof LIMITS;

/** Returns true if the action is allowed. Fail-open if the DB is unreachable. */
export async function checkRateLimit(name: RateLimitName, identifier: string): Promise<boolean> {
  const cfg = LIMITS[name];
  const nowSec = Math.floor(Date.now() / 1000);
  const windowIndex = Math.floor(nowSec / cfg.windowSec);
  const bucket = `${name}:${identifier}:${windowIndex}`;
  const expiresAt = (windowIndex + 1) * cfg.windowSec;
  try {
    const rows = await db
      .insert(schema.rateLimits)
      .values({ bucket, count: 1, expiresAt })
      .onConflictDoUpdate({ target: schema.rateLimits.bucket, set: { count: sql`${schema.rateLimits.count} + 1` } })
      .returning({ count: schema.rateLimits.count });
    const count = rows[0]?.count ?? 1;
    return count <= cfg.limit;
  } catch (error) {
    captureServerError(error, { scope: "ratelimit" });
    return true; // never block users on a limiter outage
  }
}

/** Client IP for rate-limit keys; see clientIpFrom for which header is trusted and why. */
export async function clientIp(): Promise<string> {
  return clientIpFrom(await headers());
}
