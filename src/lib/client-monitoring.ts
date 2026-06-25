/**
 * Report a client-side error to Sentry WITHOUT pulling the SDK into the shared
 * bundle: the import is dynamic and only runs when a DSN is configured, so the
 * ~80kB SDK becomes a lazily-fetched chunk instead of first-load weight.
 */
export async function captureClientError(error: unknown): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return;
  try {
    const Sentry = await import("@sentry/nextjs");
    Sentry.captureException(error);
  } catch {
    /* monitoring must never break the error UI */
  }
}
