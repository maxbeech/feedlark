// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { retrieveSession, retrieveSubscription, workspaceUpdate } = vi.hoisted(() => ({
  retrieveSession: vi.fn(),
  retrieveSubscription: vi.fn(),
  workspaceUpdate: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  PRICE_PRO: "price_pro",
  getStripe: () => ({
    checkout: { sessions: { retrieve: retrieveSession } },
    subscriptions: { retrieve: retrieveSubscription },
  }),
}));
vi.mock("@/lib/revalidate", () => ({ revalidatePublicWorkspace: vi.fn() }));
vi.mock("@/lib/db", () => ({
  schema: { workspaces: { id: "id" } },
  db: { update: () => ({ set: () => ({ where: workspaceUpdate }) }) },
}));

const workspace = {
  id: "ws_1",
  slug: "acme",
  stripeCustomerId: "cus_1",
} as never;

describe("Checkout return reconciliation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("recovers a paid Pro checkout for the matching workspace", async () => {
    retrieveSession.mockResolvedValue({
      mode: "subscription",
      payment_status: "paid",
      client_reference_id: "ws_1",
      customer: "cus_1",
      subscription: "sub_1",
    });
    retrieveSubscription.mockResolvedValue({
      id: "sub_1",
      status: "active",
      items: { data: [{ price: { id: "price_pro" } }] },
    });
    workspaceUpdate.mockResolvedValue(undefined);

    const { reconcileCheckoutSuccess } = await import("@/lib/billing/reconcile");
    await expect(reconcileCheckoutSuccess(workspace, "cs_1")).resolves.toBe("reconciled");
    expect(workspaceUpdate).toHaveBeenCalledOnce();
  });

  it("does not grant Pro for a Checkout Session owned by another workspace", async () => {
    retrieveSession.mockResolvedValue({
      mode: "subscription",
      payment_status: "paid",
      client_reference_id: "ws_other",
      customer: "cus_1",
      subscription: "sub_1",
    });

    const { reconcileCheckoutSuccess } = await import("@/lib/billing/reconcile");
    await expect(reconcileCheckoutSuccess(workspace, "cs_other")).resolves.toBe("not_owned");
    expect(workspaceUpdate).not.toHaveBeenCalled();
  });
});
