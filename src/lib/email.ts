import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { authSecret } from "@/lib/auth/session";
import { absoluteUrl } from "@/lib/utils";

/**
 * Optional transactional email. If RESEND_API_KEY is set we send via Resend;
 * otherwise we no-op and report `sent: false` so callers can still record the
 * notification intent (graceful degradation — never fabricated as "sent").
 */
const RESEND_URL = "https://api.resend.com/emails";
const RESEND_BATCH_URL = "https://api.resend.com/emails/batch";

function fromAddress(): string {
  return process.env.EMAIL_FROM || "Feedlark <noreply@mail.feedlark.com>";
}

export type EmailMessage = {
  to: string;
  subject: string;
  text: string;
  headers?: Record<string, string>;
  replyTo?: string;
};

export async function sendEmail(opts: EmailMessage): Promise<{ sent: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false };
  try {
    const res = await fetch(RESEND_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: fromAddress(),
        to: opts.to,
        subject: opts.subject,
        text: opts.text,
        ...(opts.replyTo ? { reply_to: opts.replyTo } : {}),
        ...(opts.headers ? { headers: opts.headers } : {}),
      }),
    });
    if (!res.ok) return { sent: false, error: `resend_${res.status}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: String(e) };
  }
}

/**
 * Send up to 100 emails in one Resend Batch request. Returns whether the batch
 * call itself succeeded; callers treat a non-ok batch as "all failed, retry".
 */
export async function sendEmailBatch(messages: EmailMessage[]): Promise<{ sent: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { sent: false };
  if (messages.length === 0) return { sent: true };
  try {
    const res = await fetch(RESEND_BATCH_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(
        messages.map((m) => ({
          from: fromAddress(),
          to: m.to,
          subject: m.subject,
          text: m.text,
          ...(m.replyTo ? { reply_to: m.replyTo } : {}),
          ...(m.headers ? { headers: m.headers } : {}),
        })),
      ),
    });
    if (!res.ok) return { sent: false, error: `resend_${res.status}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: String(e) };
  }
}

export const emailConfigured = Boolean(process.env.RESEND_API_KEY);

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
