/**
 * Event names + param builders for this product's GA4 measurement.
 *
 * Kept as pure functions (no DOM, no fetch) so the shape of every event this
 * product sends is unit-testable without a browser or a React renderer,
 * matching how the rest of this codebase tests logic (see test/pure.test.ts).
 * Callers pass the result straight to `track()` from `@/lib/openhelm-analytics`
 * (client) or `trackEvent()` from `@/lib/openhelm-analytics-mp` (server /
 * webhook surfaces with no browser).
 *
 * Event names follow GA4's naming rules (checked by
 * `isValidEventName` in openhelm-analytics-mp.ts): start with a letter,
 * letters/digits/underscore only, <=40 chars. Where a GA4-recommended event
 * name exists with matching semantics (sign_up, begin_checkout, purchase) we
 * use it so Google's own reports and recommendations key off it correctly;
 * everything else is a clearly-named custom event.
 */

export const EVENTS = {
  /** A new account finished signup (verified immediately, or sent to confirm-email). */
  SIGN_UP: "sign_up",
  /** Admin created a new feedback board. */
  BOARD_CREATED: "board_created",
  /** An end-user cast an upvote on a post (public board / roadmap). */
  VOTE_CAST: "vote_cast",
  /** An end-user submitted a new feedback post. */
  POST_SUBMITTED: "post_submitted",
  /** Admin clicked "Ship it" on a post — starts the You-asked-we-shipped loop. */
  POST_SHIPPED: "post_shipped",
  /** Ship-loop notification batch actually sent to voters (server-only, no browser). */
  SHIP_NOTIFIED: "ship_notified",
  /** Admin clicked Upgrade to Pro — Stripe Checkout session about to start. */
  BEGIN_CHECKOUT: "begin_checkout",
  /** Stripe confirmed the Pro subscription (verified checkout return). */
  PURCHASE: "purchase",
  /** Admin opened the Stripe billing portal (manage/cancel). */
  BILLING_PORTAL_OPENED: "billing_portal_opened",
  /** Stripe webhook confirmed the subscription was canceled (workspace downgraded to Free). */
  SUBSCRIPTION_CANCELED: "subscription_canceled",
} as const;

export type EventName = (typeof EVENTS)[keyof typeof EVENTS];

export function signUpParams(method: "email" | "invite"): Record<string, unknown> {
  return { method };
}

export function boardCreatedParams(isPrivate: boolean): Record<string, unknown> {
  return { is_private: isPrivate };
}

export function voteCastParams(postId: string): Record<string, unknown> {
  return { post_id: postId };
}

export function postSubmittedParams(boardId: string): Record<string, unknown> {
  return { board_id: boardId };
}

export function postShippedParams(postId: string, voteCount: number): Record<string, unknown> {
  return { post_id: postId, vote_count: voteCount };
}

export function shipNotifiedParams(count: number): Record<string, unknown> {
  return { count };
}

export function beginCheckoutParams(priceMonthly: number, seats: number): Record<string, unknown> {
  return { currency: "USD", value: priceMonthly * seats, seats };
}

export function purchaseParams(sessionId: string, priceMonthly: number, seats: number): Record<string, unknown> {
  // transaction_id de-dupes GA4's purchase reports if the return page is ever
  // loaded twice for the same Checkout Session (refresh, back button).
  return { transaction_id: sessionId, currency: "USD", value: priceMonthly * seats, seats };
}

export function billingPortalOpenedParams(): Record<string, unknown> {
  return {};
}

export function subscriptionCanceledParams(workspaceId: string): Record<string, unknown> {
  // workspaceId is this product's own opaque internal id — never PII, and the
  // only stable identifier a server-side webhook (no browser, no cookie) has
  // for "who" the event is about.
  return { workspace_id: workspaceId };
}
