"use client";

import { Button } from "@/components/ui";
import { track } from "@/lib/openhelm-analytics";
import { EVENTS, beginCheckoutParams, billingPortalOpenedParams } from "@/lib/analytics-events";

/**
 * The two billing forms in BillingCard, split into a client component so the
 * click that starts a full-page POST (no fetch, no client-side "success" to
 * observe) still fires an analytics event. `track()` pushes into
 * `window.dataLayer` synchronously, so it is not lost to the navigation that
 * follows in the same tick.
 */
export function UpgradeForm({ priceMonthly, seats }: { priceMonthly: number; seats: number }) {
  return (
    <form
      action="/api/stripe/checkout"
      method="POST"
      onSubmit={() => track(EVENTS.BEGIN_CHECKOUT, beginCheckoutParams(priceMonthly, seats))}
    >
      <Button type="submit">Upgrade to Pro, ${priceMonthly}/seat/mo</Button>
      <p className="mt-2 text-xs text-ink-muted">Flat per admin seat. Never per voter.</p>
    </form>
  );
}

export function ManageSubscriptionForm() {
  return (
    <form
      action="/api/stripe/portal"
      method="POST"
      onSubmit={() => track(EVENTS.BILLING_PORTAL_OPENED, billingPortalOpenedParams())}
    >
      <Button type="submit" variant="outline">Manage subscription</Button>
    </form>
  );
}
