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
});
