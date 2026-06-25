import "server-only";
import { and, eq, inArray, lt, sql } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { sendEmailBatch, unsubscribeHeaders, type EmailMessage } from "@/lib/email";

const MAX_ATTEMPTS = 4; // give Resend transients (429s) a few retries before giving up
const RESEND_BATCH = 100; // Resend Batch API caps at 100 messages/request
const PACE_MS = 600; // stay under Resend's default ~2 req/s

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Drain queued ship notifications: send `pending` rows (skipping unsubscribed /
 * bounced recipients) in Resend batches, marking each sent or — on failure —
 * incrementing attempts for retry until MAX_ATTEMPTS, then `failed`.
 * Returns counts. Safe to call from after() (post-response) and from cron.
 */
export async function drainShipNotifications(maxRows = 5000): Promise<{ sent: number; suppressed: number; failed: number }> {
  let sent = 0, suppressed = 0, failed = 0, processed = 0;

  while (processed < maxRows) {
    const rows = await db
      .select()
      .from(schema.shipNotifications)
      .where(and(eq(schema.shipNotifications.status, "pending"), lt(schema.shipNotifications.attempts, MAX_ATTEMPTS)))
      .limit(RESEND_BATCH);
    if (rows.length === 0) break;
    processed += rows.length;

    // Drop recipients who unsubscribed / bounced.
    const emails = rows.map((r) => r.recipientEmail.toLowerCase());
    const supp = emails.length
      ? new Set(
          (await db.select({ e: schema.emailSuppressions.email }).from(schema.emailSuppressions).where(inArray(schema.emailSuppressions.email, emails))).map((s) => s.e),
        )
      : new Set<string>();

    const toSend = rows.filter((r) => !supp.has(r.recipientEmail.toLowerCase()));
    const suppressedRows = rows.filter((r) => supp.has(r.recipientEmail.toLowerCase()));

    if (suppressedRows.length) {
      await db.update(schema.shipNotifications)
        .set({ status: "suppressed" })
        .where(inArray(schema.shipNotifications.id, suppressedRows.map((r) => r.id)));
      suppressed += suppressedRows.length;
    }

    if (toSend.length) {
      const messages: EmailMessage[] = await Promise.all(
        toSend.map(async (r) => ({
          to: r.recipientEmail,
          subject: r.subject,
          text: r.body,
          headers: await unsubscribeHeaders(r.recipientEmail),
        })),
      );
      const res = await sendEmailBatch(messages);
      const ids = toSend.map((r) => r.id);
      if (res.sent) {
        await db.update(schema.shipNotifications)
          .set({ status: "sent", sentAt: Math.floor(Date.now() / 1000) })
          .where(inArray(schema.shipNotifications.id, ids));
        sent += toSend.length;
      } else {
        // Bump attempts; rows past MAX_ATTEMPTS become `failed` (stop retrying).
        await db.update(schema.shipNotifications)
          .set({ attempts: sql`${schema.shipNotifications.attempts} + 1`, lastError: res.error ?? "send_failed" })
          .where(inArray(schema.shipNotifications.id, ids));
        await db.update(schema.shipNotifications)
          .set({ status: "failed" })
          .where(and(eq(schema.shipNotifications.status, "pending"), inArray(schema.shipNotifications.id, ids), sql`${schema.shipNotifications.attempts} >= ${MAX_ATTEMPTS}`));
        failed += toSend.length;
        // Back off harder on failure (likely rate-limited) before the next batch.
        await sleep(PACE_MS * 3);
      }
    }

    await sleep(PACE_MS);
  }

  return { sent, suppressed, failed };
}
