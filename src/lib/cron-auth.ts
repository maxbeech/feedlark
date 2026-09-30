import { timingSafeEqual } from "node:crypto";

export type CronAuth = { ok: true } | { ok: false; status: 401 | 503; error: string };

// Cron routes write to the database, so they must not be reachable without the
// secret. The old check skipped authentication entirely when CRON_SECRET was
// unset, which on a fresh deployment left them open to the internet. Unset is
// now a 503 (the deployment is misconfigured); a wrong token is a 401.
export function checkCronAuth(req: Request): CronAuth {
  const secret = process.env.CRON_SECRET;
  if (!secret) return { ok: false, status: 503, error: "CRON_SECRET is not configured" };

  const given = Buffer.from(req.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  // timingSafeEqual throws on unequal lengths, so a length mismatch is rejected
  // first; the length of the secret is not worth hiding.
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return { ok: false, status: 401, error: "unauthorized" };
  }
  return { ok: true };
}
