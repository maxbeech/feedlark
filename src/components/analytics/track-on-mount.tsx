"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/openhelm-analytics";

/**
 * Reports one event when the page it sits on loads. Renders nothing.
 * Used for what a redirect marked with a query flag (checkout cancelled or
 * failed) and for impressions such as a Pro upgrade prompt. GA counts users, so
 * a reload that repeats the event does not change a funnel.
 */
export function TrackOnMount({ name, params = {} }: { name: string; params?: Record<string, unknown> }) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    track(name, params);
  }, []);
  return null;
}
