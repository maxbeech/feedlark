"use client";

import { useEffect, useRef } from "react";
import { identify, track } from "@/lib/openhelm-analytics";
import { EVENTS, signUpParams, type AnalyticsIdentity } from "@/lib/analytics-events";
import { firstTime } from "@/lib/analytics-once";

/**
 * Fires `sign_up` once, client-side, at the first page a brand-new account
 * actually lands on. Renders nothing.
 *
 * Two landing points exist because signupAction() (src/lib/actions/auth.ts)
 * has two success paths and a server action's redirect() means the client
 * component that submitted the form never observes success itself:
 *  - email verification required  -> redirected to /check-email (fire: true)
 *  - verification skipped/invited -> redirected to /dashboard?welcome=1
 *
 * `identity` is the new user's one-way ref, set before the event so `sign_up`
 * already carries `oh_user_ref`. A user signs up once, so the event is
 * remembered per ref and a reload of the landing page does not repeat it.
 */
export function SignupTracker({
  fire,
  method,
  identity,
}: {
  fire: boolean;
  method: "email" | "invite";
  identity?: AnalyticsIdentity | null;
}) {
  const sent = useRef(false);
  useEffect(() => {
    if (!fire || sent.current) return;
    sent.current = true;
    if (identity && !firstTime("local", `fl_signup_tracked:${identity.userRef}`)) return;
    if (identity) identify(identity);
    track(EVENTS.SIGN_UP, signUpParams(method));
  }, [fire, method, identity]);
  return null;
}
