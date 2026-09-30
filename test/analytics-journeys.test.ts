// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import {
  EVENTS,
  SIGNED_IN_PARAM,
  analyticsPlanFor,
  checkoutReturnEvent,
  failedParams,
  failureReason,
  isAnalyticsIdentity,
  paywallShownParams,
  withMarker,
} from "@/lib/analytics-events";
import { analyticsUserRef, buildAnalyticsIdentity } from "@/lib/analytics-identity";
import { parsePendingSignup } from "@/lib/auth/pending-signup";
import { isValidEventName, userRefFor } from "@/lib/openhelm-analytics-mp";

const ID = "00000000-0000-0000-0000-000000000000";

describe("oh_user_ref", () => {
  it("matches OpenHelm's contract vector", () => {
    expect(analyticsUserRef(ID)).toBe("12b9377cbe7e5c94");
  });

  it("agrees with the shared client's userRefFor for this product's own id shape", async () => {
    expect(analyticsUserRef("usr_abc123")).toBe(await userRefFor("usr_abc123"));
  });

  it("is 16 lowercase hex characters and never contains the id", () => {
    const ref = analyticsUserRef("usr_abc123");
    expect(ref).toMatch(/^[0-9a-f]{16}$/);
    expect(ref).not.toContain("abc123");
  });
});

describe("oh_plan", () => {
  it("is paid only for a Pro workspace", () => {
    expect(analyticsPlanFor("pro")).toBe("paid");
    expect(analyticsPlanFor("free")).toBe("free");
    expect(analyticsPlanFor(undefined)).toBe("free");
    expect(analyticsPlanFor(null)).toBe("free");
  });

  it("builds an identity from the id and workspace plan without exposing the id", () => {
    const identity = buildAnalyticsIdentity(ID, "pro");
    expect(identity).toEqual({ userRef: "12b9377cbe7e5c94", plan: "paid" });
    expect(JSON.stringify(identity)).not.toContain(ID);
    expect(isAnalyticsIdentity(identity)).toBe(true);
  });

  it("rejects anything that is not a ref and a known plan", () => {
    expect(isAnalyticsIdentity(null)).toBe(false);
    expect(isAnalyticsIdentity({ userRef: "a@b.com", plan: "free" })).toBe(false);
    expect(isAnalyticsIdentity({ userRef: "12b9377cbe7e5c94", plan: "team" })).toBe(false);
  });
});

describe("journey events", () => {
  it("adds only GA-legal names", () => {
    for (const name of Object.values(EVENTS)) expect(isValidEventName(name)).toBe(true);
  });

  it("uses GA's recommended names where they fit", () => {
    expect(EVENTS.LOGIN).toBe("login");
    expect(EVENTS.SIGN_UP).toBe("sign_up");
    expect(EVENTS.PURCHASE).toBe("purchase");
  });

  it("keeps a failure reason to a short code, never free text", () => {
    expect(failureReason("invalid_credentials")).toBe("invalid_credentials");
    expect(failureReason("Invalid email or password.")).toBe("unknown");
    expect(failureReason("someone@example.com")).toBe("unknown");
    expect(failureReason(undefined)).toBe("unknown");
    expect(failedParams("rate_limited")).toEqual({ reason: "rate_limited" });
  });

  it("names the paywall's feature and nothing else", () => {
    expect(paywallShownParams("team_invites")).toEqual({ feature: "team_invites" });
  });
});

describe("withMarker", () => {
  it("adds the flag to a bare path", () => {
    expect(withMarker("/dashboard", SIGNED_IN_PARAM, "abc")).toBe("/dashboard?signed_in=abc");
  });

  it("keeps an existing query and hash", () => {
    expect(withMarker("/dashboard/boards?x=1#top", SIGNED_IN_PARAM, "abc")).toBe("/dashboard/boards?x=1&signed_in=abc#top");
  });

  it("replaces a stale marker instead of stacking two", () => {
    expect(withMarker("/dashboard?signed_in=old", SIGNED_IN_PARAM, "new")).toBe("/dashboard?signed_in=new");
  });
});

describe("checkoutReturnEvent", () => {
  it("reports a cancelled checkout", () => {
    expect(checkoutReturnEvent({ checkout: "cancelled" })).toEqual({ name: "checkout_cancelled", params: {} });
  });

  it("reports a checkout that could not start, with its reason", () => {
    expect(checkoutReturnEvent({ checkout: "failed", reason: "stripe_error" })).toEqual({
      name: "checkout_failed",
      params: { reason: "stripe_error" },
    });
  });

  it("never lets a hand-edited reason through as free text", () => {
    expect(checkoutReturnEvent({ checkout: "failed", reason: "<script>alert(1)</script>" })?.params).toEqual({ reason: "unknown" });
  });

  it("reports a return with no session id", () => {
    expect(checkoutReturnEvent({ upgraded: "1" })).toEqual({
      name: "purchase_confirmation_failed",
      params: { reason: "missing_session_id" },
    });
  });

  it.each([
    ["not_paid", "payment_not_confirmed"],
    ["not_owned", "session_not_yours"],
    ["not_entitled", "not_entitled"],
    ["error", "confirmation_unavailable"],
  ] as const)("reports an unconfirmed return (%s)", (reconcile, reason) => {
    expect(checkoutReturnEvent({ upgraded: "1", sessionId: "cs_1", reconcile })).toEqual({
      name: "purchase_confirmation_failed",
      params: { reason },
    });
  });

  it("leaves a confirmed purchase to PurchaseTracker, and a plain visit alone", () => {
    expect(checkoutReturnEvent({ upgraded: "1", sessionId: "cs_1", reconcile: "reconciled" })).toBeNull();
    expect(checkoutReturnEvent({})).toBeNull();
  });
});

describe("pending signup cookie", () => {
  it("reads back the email and ref it stored", () => {
    expect(parsePendingSignup(JSON.stringify({ e: "a@example.com", r: "12b9377cbe7e5c94" }))).toEqual({
      email: "a@example.com",
      userRef: "12b9377cbe7e5c94",
    });
  });

  it.each([undefined, "", "not json", JSON.stringify({ e: "a@example.com", r: "nope" }), JSON.stringify({ r: "12b9377cbe7e5c94" })])(
    "treats %s as no pending signup",
    (raw) => {
      expect(parsePendingSignup(raw)).toBeNull();
    },
  );
});
