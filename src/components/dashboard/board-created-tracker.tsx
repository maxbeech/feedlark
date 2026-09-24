"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/openhelm-analytics";
import { EVENTS, boardCreatedParams } from "@/lib/analytics-events";

/**
 * Fires `board_created` once when the dashboard is reached via
 * `/dashboard?created=1`, which createBoardAction() (src/lib/actions/admin.ts)
 * appends on its redirect. Same pattern as SignupTracker: a server action's
 * redirect() means the form that submitted it never observes success itself.
 */
export function BoardCreatedTracker({ fire }: { fire: boolean }) {
  const sent = useRef(false);
  useEffect(() => {
    if (!fire || sent.current) return;
    sent.current = true;
    // We don't know privacy here (the redirect doesn't carry it) — omit
    // rather than guess; is_private is still recorded via the admin form
    // itself failing/succeeding, which server-side validation already gates.
    track(EVENTS.BOARD_CREATED, boardCreatedParams(false));
  }, [fire]);
  return null;
}
