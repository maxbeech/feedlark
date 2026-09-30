"use client";

import { useEffect, useRef } from "react";
import { identify, track } from "@/lib/openhelm-analytics";
import { EVENTS, purchaseParams, type AnalyticsIdentity } from "@/lib/analytics-events";

/**
 * Fires `purchase` once the settings page has independently verified the
 * Checkout Session with Stripe (see reconcileCheckoutSuccess in
 * src/lib/billing/reconcile.ts) — never on the bare `?upgraded=1` query
 * param alone, which a user could type into the URL bar themselves.
 *
 * The user is identified as `paid` first, so the purchase itself already
 * carries `oh_plan=paid` (the layout above may have rendered before the upgrade).
 *
 * De-duped on sessionId via sessionStorage: a refresh of the same
 * `?upgraded=1&session_id=...` URL (or the back button) must not double-count
 * the same subscription as two purchases.
 */
export function PurchaseTracker({
  fire,
  identity,
  sessionId,
  priceMonthly,
  seats,
}: {
  fire: boolean;
  identity: AnalyticsIdentity;
  sessionId: string;
  priceMonthly: number;
  seats: number;
}) {
  const sent = useRef(false);
  useEffect(() => {
    if (!fire || !sessionId || sent.current) return;
    const key = `fl_purchase_tracked:${sessionId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* sessionStorage unavailable (private mode) — fall through and track once per mount */
    }
    sent.current = true;
    identify(identity);
    track(EVENTS.PURCHASE, purchaseParams(sessionId, priceMonthly, seats));
  }, [fire, identity, sessionId, priceMonthly, seats]);
  return null;
}
