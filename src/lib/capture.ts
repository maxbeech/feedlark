import * as Sentry from "@sentry/nextjs";

/**
 * The one way server code reports a problem to Sentry.
 *
 * Calls funnel through here so scope tags stay consistent across actions,
 * routes and webhooks, and so a deployment with no DSN degrades to a visible
 * console line instead of throwing inside an error handler.
 */
function hasDsn(): boolean {
  return Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN);
}

function scopeOf(context: Record<string, unknown>): string {
  return typeof context.scope === "string" ? context.scope : "server";
}

export function captureServerError(err: unknown, context: Record<string, unknown> = {}): void {
  const scope = scopeOf(context);
  try {
    if (hasDsn()) {
      Sentry.withScope((s) => {
        s.setTag("scope", scope);
        for (const [k, v] of Object.entries(context)) if (k !== "scope") s.setExtra(k, v);
        s.captureException(err instanceof Error ? err : new Error(String(err)));
      });
      return;
    }
  } catch {
    // Reporting an error must never become an error.
  }
  console.error(`[${scope}]`, err, context);
}

/** A handled failure that is not an exception (a rejected upstream response, say). */
export function captureServerMessage(message: string, context: Record<string, unknown> = {}): void {
  const scope = scopeOf(context);
  try {
    if (hasDsn()) {
      Sentry.withScope((s) => {
        s.setTag("scope", scope);
        s.setLevel("warning");
        for (const [k, v] of Object.entries(context)) if (k !== "scope") s.setExtra(k, v);
        s.captureMessage(message);
      });
      return;
    }
  } catch {
    /* see above */
  }
  console.warn(`[${scope}]`, message, context);
}
