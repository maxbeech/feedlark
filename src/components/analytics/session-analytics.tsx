"use client";

import { Suspense, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { identify, track } from "@/lib/openhelm-analytics";
import { EVENTS, SIGNED_IN_PARAM, type AnalyticsIdentity } from "@/lib/analytics-events";
import { firstTime } from "@/lib/analytics-once";

/**
 * Sets the GA user properties (`oh_user_ref`, `oh_plan`) for the signed-in
 * dashboard user and reports `login` when loginAction() sent them here.
 * Renders nothing. Mounted in the dashboard layout, so it only runs where the
 * server already knows who the user is; `identity` is the one-way ref, never
 * the user id or email.
 */
export function SessionAnalytics({ identity }: { identity: AnalyticsIdentity }) {
  useEffect(() => {
    identify(identity);
  }, [identity.userRef, identity.plan]);

  return (
    <Suspense fallback={null}>
      <LoginTracker identity={identity} />
    </Suspense>
  );
}

function LoginTracker({ identity }: { identity: AnalyticsIdentity }) {
  const nonce = useSearchParams().get(SIGNED_IN_PARAM);
  const sent = useRef(false);

  useEffect(() => {
    if (!nonce || sent.current) return;
    sent.current = true;
    if (!firstTime("session", `fl_login_tracked:${nonce}`)) return;
    // The child effect runs before the parent's, so identify here too.
    identify(identity);
    track(EVENTS.LOGIN, { method: "password" });
  }, [nonce, identity]);

  return null;
}
