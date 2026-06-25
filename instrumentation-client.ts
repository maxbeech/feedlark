const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

// Dynamically import so the Sentry SDK stays out of the first-load bundle and is
// only fetched when a DSN is actually configured.
if (dsn) {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({ dsn, tracesSampleRate: 0.1, replaysSessionSampleRate: 0, replaysOnErrorSampleRate: 0 });
  });
}
