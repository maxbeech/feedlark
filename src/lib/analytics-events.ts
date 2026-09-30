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
  /** Signup was submitted and refused; carries a short `reason` code. */
  SIGN_UP_FAILED: "sign_up_failed",
  /** An existing user logged in. */
  LOGIN: "login",
  /** Login was submitted and refused; carries a short `reason` code. */
  LOGIN_FAILED: "login_failed",
  /** A free workspace was shown a Pro-only feature and its upgrade prompt. */
  PAYWALL_SHOWN: "paywall_shown",
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
  /** Checkout could not be started (billing off, or Stripe refused); carries `reason`. */
  CHECKOUT_FAILED: "checkout_failed",
  /** The buyer backed out of Stripe Checkout and came back via the cancel link. */
  CHECKOUT_CANCELLED: "checkout_cancelled",
  /** Stripe confirmed the Pro subscription (verified checkout return). */
  PURCHASE: "purchase",
  /** The checkout return could not be confirmed with Stripe; carries `reason`. */
  PURCHASE_CONFIRMATION_FAILED: "purchase_confirmation_failed",
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

// ---------------------------------------------------------------------------
// OpenHelm journey contract: who the user is, why a step failed, and which
// return trips a page has to report. All pure, so none of it needs a browser.
// ---------------------------------------------------------------------------

export type AnalyticsPlan = "anonymous" | "free" | "paid";
export type AnalyticsIdentity = { userRef: string; plan: AnalyticsPlan };

/** True for a value shaped like the identity the server hands the browser. */
export function isAnalyticsIdentity(value: unknown): value is AnalyticsIdentity {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return typeof v.userRef === "string" && /^[0-9a-f]{16}$/.test(v.userRef)
    && (v.plan === "anonymous" || v.plan === "free" || v.plan === "paid");
}

/**
 * `oh_plan` for a signed-in user, from the workspace they are working in.
 * `paid` means that workspace is on Pro; the plan only becomes `pro` through an
 * active or trialing Pro subscription (Stripe webhook or the verified checkout
 * return), so a lapsed or cancelled subscription is `free` again.
 */
export function analyticsPlanFor(workspacePlan: string | null | undefined): "free" | "paid" {
  return workspacePlan === "pro" ? "paid" : "free";
}

/**
 * A failure `reason` is a short lowercase code, never free text: it goes to a
 * third party, and an error message can carry an email address or an id.
 */
export function failureReason(code: unknown): string {
  return typeof code === "string" && /^[a-z][a-z0-9_]{0,39}$/.test(code) ? code : "unknown";
}

export function failedParams(code: unknown): Record<string, unknown> {
  return { reason: failureReason(code) };
}

export function paywallShownParams(feature: "team_invites" | "custom_domain"): Record<string, unknown> {
  return { feature };
}

/** Query flag a redirect adds so the landing page can report what just happened. */
export const SIGNED_IN_PARAM = "signed_in";

/**
 * Add a one-off marker to an in-app path, keeping any query and hash it has.
 * The marker's value is a nonce, so a refresh of the same URL can be told apart
 * from a second real login.
 */
export function withMarker(path: string, key: string, value: string): string {
  const url = new URL(path, "http://feedlark.invalid");
  url.searchParams.set(key, value);
  return `${url.pathname}${url.search}${url.hash}`;
}

export type CheckoutReconcile = "reconciled" | "not_paid" | "not_owned" | "not_entitled" | "error";

/**
 * The failure or cancel event a Checkout return has to report, or null when
 * there is none (the plain settings page, or a confirmed purchase, which
 * PurchaseTracker reports with its value).
 */
export function checkoutReturnEvent(input: {
  checkout?: string;
  reason?: string;
  upgraded?: string;
  sessionId?: string;
  reconcile?: CheckoutReconcile;
}): { name: EventName; params: Record<string, unknown> } | null {
  if (input.checkout === "cancelled") return { name: EVENTS.CHECKOUT_CANCELLED, params: {} };
  if (input.checkout === "failed") return { name: EVENTS.CHECKOUT_FAILED, params: failedParams(input.reason) };
  if (!input.upgraded) return null;
  if (!input.sessionId) return { name: EVENTS.PURCHASE_CONFIRMATION_FAILED, params: failedParams("missing_session_id") };
  const reasons: Record<Exclude<CheckoutReconcile, "reconciled">, string> = {
    not_paid: "payment_not_confirmed",
    not_owned: "session_not_yours",
    not_entitled: "not_entitled",
    error: "confirmation_unavailable",
  };
  if (!input.reconcile || input.reconcile === "reconciled") return null;
  return { name: EVENTS.PURCHASE_CONFIRMATION_FAILED, params: failedParams(reasons[input.reconcile]) };
}
