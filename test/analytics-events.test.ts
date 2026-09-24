import { describe, expect, it } from "vitest";
import {
  EVENTS,
  signUpParams,
  boardCreatedParams,
  voteCastParams,
  postSubmittedParams,
  postShippedParams,
  shipNotifiedParams,
  beginCheckoutParams,
  purchaseParams,
  billingPortalOpenedParams,
  subscriptionCanceledParams,
} from "@/lib/analytics-events";
import { isValidEventName } from "@/lib/openhelm-analytics-mp";

describe("event names", () => {
  it("are all GA4-legal (checked by the same validator the MP sender uses)", () => {
    for (const name of Object.values(EVENTS)) {
      expect(isValidEventName(name)).toBe(true);
    }
  });

  it("uses GA4's own recommended names where semantics match", () => {
    expect(EVENTS.SIGN_UP).toBe("sign_up");
    expect(EVENTS.BEGIN_CHECKOUT).toBe("begin_checkout");
    expect(EVENTS.PURCHASE).toBe("purchase");
  });
});

describe("param builders", () => {
  it("sign up records the method", () => {
    expect(signUpParams("email")).toEqual({ method: "email" });
    expect(signUpParams("invite")).toEqual({ method: "invite" });
  });

  it("board created records privacy", () => {
    expect(boardCreatedParams(true)).toEqual({ is_private: true });
    expect(boardCreatedParams(false)).toEqual({ is_private: false });
  });

  it("vote cast carries only the post id — no voter PII", () => {
    const p = voteCastParams("post_abc123");
    expect(p).toEqual({ post_id: "post_abc123" });
  });

  it("post submitted carries the board id", () => {
    expect(postSubmittedParams("brd_1")).toEqual({ board_id: "brd_1" });
  });

  it("post shipped carries the post id and its vote count", () => {
    expect(postShippedParams("post_1", 12)).toEqual({ post_id: "post_1", vote_count: 12 });
  });

  it("ship notified carries the recipient count", () => {
    expect(shipNotifiedParams(7)).toEqual({ count: 7 });
  });

  it("begin checkout values the whole line (price * seats)", () => {
    expect(beginCheckoutParams(19, 3)).toEqual({ currency: "USD", value: 57, seats: 3 });
  });

  it("purchase carries a transaction id for GA4 de-dup", () => {
    expect(purchaseParams("cs_test_1", 19, 2)).toEqual({
      transaction_id: "cs_test_1",
      currency: "USD",
      value: 38,
      seats: 2,
    });
  });

  it("billing portal opened has no params (nothing meaningful to attach)", () => {
    expect(billingPortalOpenedParams()).toEqual({});
  });

  it("subscription canceled carries only our own opaque workspace id", () => {
    expect(subscriptionCanceledParams("ws_1")).toEqual({ workspace_id: "ws_1" });
  });
});
