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

/**
 * Context is ids, codes, counts and enum values only: primitives, short
 * strings. Objects, arrays and long free text are dropped, never shipped.
 */
export function safeContext(context: Record<string, unknown>): Record<string, string | number | boolean | null> {
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(context)) {
    if (k === "scope") continue;
    if (v === null || typeof v === "number" || typeof v === "boolean") out[k] = v;
    else if (typeof v === "string") out[k] = v.length <= 80 ? v : `${v.slice(0, 80)}...`;
  }
  return out;
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
        for (const [k, v] of Object.entries(safeContext(context))) s.setExtra(k, v);
        s.captureException(err instanceof Error ? err : new Error(String(err)));
      });
      return;
    }
  } catch {
    // Reporting an error must never become an error.
  }
  console.error(`[${scope}]`, err, safeContext(context));
}

/** A handled failure that is not an exception (a rejected upstream response, say). */
export function captureServerMessage(message: string, context: Record<string, unknown> = {}): void {
  const scope = scopeOf(context);
  try {
    if (hasDsn()) {
      Sentry.withScope((s) => {
        s.setTag("scope", scope);
        s.setLevel("warning");
        for (const [k, v] of Object.entries(safeContext(context))) s.setExtra(k, v);
        s.captureMessage(message);
      });
      return;
    }
  } catch {
    /* see above */
  }
  console.warn(`[${scope}]`, message, safeContext(context));
}
