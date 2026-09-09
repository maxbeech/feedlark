// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { constructEvent, workspaceUpdate, eventInsert } = vi.hoisted(() => ({
  constructEvent: vi.fn(),
  workspaceUpdate: vi.fn(),
  eventInsert: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => ({ webhooks: { constructEvent } }),
  PRICE_PRO: "price_pro",
}));
// src/lib/gate.ts does REAL ownership work: it reads STRIPE_PRICE_* out of the
// environment and, for a checkout.session, calls stripe.subscriptions.retrieve.
// This suite sets up neither (the mocked Stripe above implements only
// webhooks.constructEvent), so every test below was silently exercising the
// gate's "this product owns no prices, refuse" branch and asserting against a
// handler that never ran. The gate has its own coverage in gate.test.ts and
// stripe-guard.test.ts; here it accepts by default so the route's own retry
// safety is what gets tested, and the refusal path is exercised explicitly.
let gateResult: { ok: boolean; reason: string; message: string } = { ok: true, reason: "owned", message: "test" };
vi.mock("@/lib/gate", () => ({ guardStripeEvent: async () => gateResult }));
vi.mock("@/lib/revalidate", () => ({ revalidatePublicWorkspace: vi.fn() }));
vi.mock("@/lib/db", () => ({
  schema: {
    workspaces: { id: "id", stripeCustomerId: "stripe_customer_id" },
    stripeEvents: { id: "id" },
    workspaceMembers: { workspaceId: "workspace_id", role: "role" },
    invitations: { workspaceId: "workspace_id" },
  },
  db: {
    select: () => ({ from: () => ({ where: () => ({ limit: async () => [{ id: "ws_1", slug: "acme" }] }) }) }),
    update: () => ({ set: () => ({ where: workspaceUpdate }) }),
    delete: () => ({ where: vi.fn() }),
    insert: () => ({ values: () => ({ onConflictDoNothing: () => ({ returning: eventInsert }) }) }),
  },
}));

describe("Stripe webhook retry safety", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    gateResult = { ok: true, reason: "owned", message: "test" };
    process.env.STRIPE_WEBHOOK_SECRET = "whsec_test";
    constructEvent.mockReturnValue({
      id: "evt_checkout",
      type: "checkout.session.completed",
      data: {
        object: {
          mode: "subscription",
          payment_status: "paid",
          client_reference_id: "ws_1",
          customer: "cus_1",
          subscription: "sub_1",
        },
      },
    });
  });

  it("does not record a completed event when the entitlement write fails, so Stripe can retry", async () => {
    workspaceUpdate.mockRejectedValueOnce(new Error("database unavailable")).mockResolvedValueOnce(undefined);
    eventInsert.mockResolvedValue([{ id: "evt_checkout" }]);
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const request = () => new Request("https://feedlark.test/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": "t=1,v1=signature" },
      body: "{}",
    });

    const failed = await POST(request());
    const retried = await POST(request());

    expect(failed.status).toBe(500);
    expect(retried.status).toBe(200);
    expect(workspaceUpdate).toHaveBeenCalledTimes(2);
    expect(eventInsert).toHaveBeenCalledTimes(1);
  });

  // The gate is what stops a shared Stripe account delivering another product's
  // sale to this handler. Its own logic is covered in gate.test.ts; this asserts
  // the ROUTE consults it and honours the verdict, which is the wiring a future
  // edit to the handler could quietly drop.
  it("acknowledges an event the ownership gate refuses, without granting or recording it", async () => {
    gateResult = { ok: false, reason: "foreign", message: "another product's price" };
    eventInsert.mockResolvedValue([{ id: "evt_checkout" }]);
    const { POST } = await import("@/app/api/stripe/webhook/route");
    const res = await POST(
      new Request("https://feedlark.test/api/stripe/webhook", {
        method: "POST",
        headers: { "stripe-signature": "t=1,v1=signature" },
        body: "{}",
      }),
    );

    // 200: the event is not ours, so there is nothing to retry. A non-2xx would
    // make Stripe redeliver another product's event at us for three days.
    expect(res.status).toBe(200);
    expect(workspaceUpdate).not.toHaveBeenCalled();
    // And it must not burn the dedupe id either, or the real owner's redelivery
    // of a legitimately retried event would be swallowed as a duplicate.
    expect(eventInsert).not.toHaveBeenCalled();
  });
});
