import * as Sentry from "@sentry/nextjs";
import { sharedSentryOptions } from "@/lib/sentry-options";

/**
 * Browser error reporting. The feedback integration backs our own
 * "Send feedback" control (dashboard header and marketing footer), so a report
 * from a person lands in the same Sentry project as the exceptions.
 */
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
const shared = sharedSentryOptions();

if (dsn) {
  Sentry.init({
    dsn,
    ...shared,
    // Requests go through our tunnel route. A feedback screenshot is sent as a
    // raw ArrayBuffer with no Content-Type, which the tunnel would receive as an
    // empty body; see getsentry/sentry-javascript#16112.
    transportOptions: { headers: { "content-type": "application/x-sentry-envelope" } },
    integrations: [
      ...shared.integrations,
      Sentry.feedbackIntegration({
        colorScheme: "system",
        autoInject: false,
        showBranding: false,
        formTitle: "Send feedback",
        submitButtonLabel: "Send feedback",
        messagePlaceholder: "A bug, an idea, anything on your mind.",
        successMessageText: "Thank you. This went straight to the people who can act on it.",
      }),
    ],
  });
} else {
  console.warn("[sentry] NEXT_PUBLIC_SENTRY_DSN is not set; browser error reporting is off.");
}

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
