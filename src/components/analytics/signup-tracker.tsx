"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/openhelm-analytics";
import { EVENTS, signUpParams } from "@/lib/analytics-events";

/**
 * Fires `sign_up` once, client-side, at the first page a brand-new account
 * actually lands on. Renders nothing.
 *
 * Two landing points exist because signupAction() (src/lib/actions/auth.ts)
 * has two success paths and a server action's redirect() means the client
 * component that submitted the form never observes success itself:
 *  - email verification required  -> redirected to /check-email (fire: true)
 *  - verification skipped/invited -> redirected to /dashboard?welcome=1
 */
export function SignupTracker({ fire, method }: { fire: boolean; method: "email" | "invite" }) {
  const sent = useRef(false);
  useEffect(() => {
    if (!fire || sent.current) return;
    sent.current = true;
    track(EVENTS.SIGN_UP, signUpParams(method));
  }, [fire, method]);
  return null;
}
