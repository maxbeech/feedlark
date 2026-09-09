import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { authSecret } from "@/lib/auth/session";
import { absoluteUrl } from "@/lib/utils";
import { sendEmail as sendViaOpenHelm, emailEnabled } from "@/lib/openhelm-mail";

/**
 * Transactional email, through OpenHelm Mail.
 *
 * WHAT THIS REPLACES. A direct Resend integration: its own API key, its own
 * `EMAIL_FROM`, and its own idea of what a failure was. Feedlark was the last
 * product in the portfolio still doing that, and it is the one thing the shared
 * client exists to stop — a per-product mail provider means per-product
 * suppression, per-product caps, per-product reputation, and a support address
 * nobody on the platform can see or answer.
 *
 * THE FROM-ADDRESS IS NOT SET HERE ANY MORE, and that is the point. The old
 * `EMAIL_FROM` asserted `noreply@mail.feedlark.com` whether or not anything had
 * verified it. OpenHelm Mail binds the inbox to this product server-side and
 * stamps the address it has actually verified, so the header and the wire can
 * no longer disagree.
 *
 * THE PUBLIC SHAPE IS DELIBERATELY UNCHANGED. `sendEmail`, `sendEmailBatch`,
 * `emailConfigured` and the unsubscribe helpers keep their signatures, so the
 * five call sites are untouched by the migration.
 */

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  /**
   * Extra headers. Only List-Unsubscribe is used today; the platform adds its
   * own one-click unsubscribe to bulk classes, so these are additive.
   */
  headers?: Record<string, string>;
  replyTo?: string;
  /**
   * Idempotency key, and the reason a partial batch failure is now safe to
   * retry. `sendEmailBatch` reports all-or-nothing, so a retry re-sends every
   * message in the batch including the ones that already went out; passing a
   * key that is stable for THIS notification makes the platform return the
   * original message instead of delivering a second copy.
   */
  clientId?: string;
};

export async function sendEmail(opts: EmailMessage): Promise<{ sent: boolean; error?: string }> {
  if (!emailEnabled()) return { sent: false };
  const res = await sendViaOpenHelm({
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    ...(opts.clientId ? { clientId: opts.clientId } : {}),
  });
  if (res.sent) return { sent: true };
  return { sent: false, error: res.reason === "error" ? res.error ?? "send_failed" : res.reason };
}

/**
 * Send a run of notifications.
 *
 * OpenHelm Mail has no batch endpoint, and it should not: each of these
 * carries its own List-Unsubscribe header, so they were never one message in
 * any case — Resend's batch call was a transport optimisation, not a semantic
 * one. Sent one at a time, sequentially, so a burst cannot outrun the inbox's
 * own daily cap in a way the platform then reports as a wall of failures.
 *
 * The result stays all-or-nothing because the caller's rows are marked
 * all-or-nothing; per-message `clientId` is what makes the resulting retry
 * safe (see EmailMessage above).
 */
export async function sendEmailBatch(messages: EmailMessage[]): Promise<{ sent: boolean; error?: string }> {
  if (!emailEnabled()) return { sent: false };
  if (messages.length === 0) return { sent: true };
  for (const message of messages) {
    const res = await sendEmail(message);
    if (!res.sent) return { sent: false, error: res.error ?? "send_failed" };
  }
  return { sent: true };
}

export const emailConfigured = emailEnabled();

/** A long-lived signed token that lets a recipient one-click unsubscribe. */
export async function unsubscribeToken(email: string): Promise<string> {
  return new SignJWT({ email: email.toLowerCase(), purpose: "unsub" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .sign(authSecret());
}

export async function verifyUnsubscribeToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, authSecret());
    if (payload.purpose !== "unsub" || !payload.email) return null;
    return String(payload.email).toLowerCase();
  } catch {
    return null;
  }
}

/** The List-Unsubscribe headers Gmail/Yahoo bulk rules require (one-click). */
export async function unsubscribeHeaders(email: string): Promise<Record<string, string>> {
  const token = await unsubscribeToken(email);
  const url = absoluteUrl(`/api/unsubscribe?token=${encodeURIComponent(token)}`);
  return {
    "List-Unsubscribe": `<${url}>`,
    "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
  };
}
