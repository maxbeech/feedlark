import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

/**
 * Server/edge error monitoring. No-ops entirely when no DSN is configured, so
 * the app runs identically before Sentry is set up.
 */
export async function register() {
  if (!dsn) return;
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({ dsn, tracesSampleRate: 0.1, enabled: true });
  }
}

// Captures errors thrown in Server Components, route handlers and server actions
// (exactly the class of silent 500 we want surfaced).
export const onRequestError = Sentry.captureRequestError;
