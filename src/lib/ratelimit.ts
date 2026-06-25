import "server-only";
import { headers } from "next/headers";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Distributed rate limiting via Upstash Redis. If the Upstash env vars aren't
 * present (e.g. before the integration is added) we FAIL OPEN — the app keeps
 * working, just without limits — so a missing integration never takes the site
 * down. `rateLimitConfigured` lets us surface that state.
 */
const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;
export const rateLimitConfigured = Boolean(url && token);

const redis = rateLimitConfigured ? new Redis({ url: url!, token: token! }) : null;

const make = (limiter: ReturnType<typeof Ratelimit.slidingWindow>) =>
  redis ? new Ratelimit({ redis, limiter, prefix: "fl_rl", analytics: false }) : null;

// Tuned per action: tight on auth/abuse vectors, generous on normal engagement.
const limiters = {
  login: make(Ratelimit.slidingWindow(10, "10 m")),
  signup: make(Ratelimit.slidingWindow(5, "1 h")),
  passwordReset: make(Ratelimit.slidingWindow(5, "1 h")),
  verifyResend: make(Ratelimit.slidingWindow(5, "1 h")),
  post: make(Ratelimit.slidingWindow(8, "10 m")),
  comment: make(Ratelimit.slidingWindow(15, "10 m")),
  vote: make(Ratelimit.slidingWindow(40, "10 m")),
} as const;

export type RateLimitName = keyof typeof limiters;

/** Returns true if the action is allowed. Fail-open if Upstash isn't configured. */
export async function checkRateLimit(name: RateLimitName, identifier: string): Promise<boolean> {
  const rl = limiters[name];
  if (!rl) return true;
  try {
    const { success } = await rl.limit(`${name}:${identifier}`);
    return success;
  } catch {
    return true; // never block users on a rate-limiter outage
  }
}

/** Best-effort client IP from the proxy headers Vercel sets. */
export async function clientIp(): Promise<string> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return h.get("x-real-ip") ?? "0.0.0.0";
}
