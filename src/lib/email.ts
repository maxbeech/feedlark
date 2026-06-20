import "server-only";

/**
 * Optional transactional email. If RESEND_API_KEY is set we send via Resend;
 * otherwise we no-op and report `sent: false` so callers can still record the
 * notification intent (graceful degradation — never fabricated as "sent").
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  text: string;
}): Promise<{ sent: boolean; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Feedlark <noreply@mail.feedlark.com>";
  if (!key) return { sent: false };
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, text: opts.text }),
    });
    if (!res.ok) return { sent: false, error: `resend_${res.status}` };
    return { sent: true };
  } catch (e) {
    return { sent: false, error: String(e) };
  }
}

export const emailConfigured = Boolean(process.env.RESEND_API_KEY);
