"use client";

import { useState } from "react";
import { MessageSquare } from "lucide-react";

/**
 * The user-facing feedback control. It opens Sentry's feedback form, so a report
 * lands in the same Sentry project as the exceptions. The SDK is imported lazily
 * so marketing pages do not pull it into the initial bundle for a footer link.
 */
export function FeedbackButton({
  className = "",
  variant = "link",
  user,
}: {
  className?: string;
  variant?: "link" | "header";
  /** Signed-in user, used to pre-fill the form. */
  user?: { email?: string | null; name?: string | null };
}) {
  const [unavailable, setUnavailable] = useState(false);

  const open = async () => {
    const Sentry = await import("@sentry/nextjs");
    const feedback = Sentry.getFeedback();
    if (!feedback) {
      // No DSN on this deployment: say so rather than a control that does nothing.
      setUnavailable(true);
      return;
    }
    if (user?.email) Sentry.setUser({ email: user.email, ...(user.name ? { username: user.name } : {}) });
    const form = await feedback.createForm();
    form.appendToDom();
    form.open();
  };

  if (unavailable) return <span className={className}>Feedback is not available right now.</span>;

  if (variant === "header") {
    return (
      <button
        type="button"
        onClick={open}
        className={`inline-flex items-center gap-1.5 text-sm font-medium text-ink-muted transition-colors hover:text-ink ${className}`}
      >
        <MessageSquare className="h-3.5 w-3.5" />
        Feedback
      </button>
    );
  }
  return (
    <button type="button" onClick={open} className={className}>
      Send feedback
    </button>
  );
}
