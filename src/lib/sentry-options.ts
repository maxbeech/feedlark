import * as Sentry from "@sentry/nextjs";
import { scrubBreadcrumb, scrubEvent, scrubLog, scrubTransaction } from "@/lib/scrub";

/**
 * The one place the options shared by every Sentry.init live (browser, server
 * and edge), so scrubbing, sampling and log forwarding cannot drift apart.
 */
export function sharedSentryOptions() {
  return {
    tracesSampleRate: 0.05,
    environment: process.env.NODE_ENV,
    sendDefaultPii: false,
    beforeSend: scrubEvent,
    beforeSendTransaction: scrubTransaction,
    beforeBreadcrumb: scrubBreadcrumb,
    enableLogs: true,
    beforeSendLog: scrubLog,
    // Forward console output as structured logs (scrubbed by beforeSendLog).
    integrations: [Sentry.consoleLoggingIntegration({ levels: ["log", "info", "warn", "error"] })],
  };
}
