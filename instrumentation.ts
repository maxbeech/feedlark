import * as Sentry from "@sentry/nextjs";
import { sharedSentryOptions } from "@/lib/sentry-options";

/**
 * Server error reporting to Sentry, plus our own Postgres error log.
 * onRequestError fires for errors in Server Components, route handlers and server
 * actions — exactly the class of silent 500 we want captured.
 */
export async function register() {
  const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    console.warn("[sentry] SENTRY_DSN is not set; server error reporting is off.");
    return;
  }
  Sentry.init({ dsn, ...sharedSentryOptions() });
}

export async function onRequestError(
  err: unknown,
  request: { path?: string; method?: string },
): Promise<void> {
  Sentry.captureException(err, { contexts: { request: { url: request?.path } } });
  // postgres-js only runs on the Node.js runtime; skip edge.
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const { logErrorEvent } = await import("@/lib/error-log");
    const e = err as { message?: string; stack?: string; digest?: string };
    await logErrorEvent({
      source: "server",
      message: e?.message ?? String(err),
      stack: e?.stack ?? null,
      digest: e?.digest ?? null,
      url: request?.path ?? null,
    });
  } catch {
    /* never throw from the error handler */
  }
}
