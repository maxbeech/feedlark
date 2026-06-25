import { NextResponse } from "next/server";
import { drainShipNotifications } from "@/lib/ship-drain";

// Cron can run longer than a normal request; allow the drainer room to work.
export const maxDuration = 300;

/**
 * Backstop drainer for queued ship notifications. The primary drain happens in
 * after() right after a post ships; this cron retries anything left pending
 * (e.g. Resend rate-limit transients) and runs daily on the Hobby plan.
 */
export async function GET(req: Request) {
  // Vercel attaches `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const auth = req.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const result = await drainShipNotifications();
  return NextResponse.json({ ok: true, ...result });
}
