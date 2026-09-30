// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  stripe: null as unknown,
  enabled: true,
  user: { id: "usr_1", email: "a@example.com" } as { id: string; email: string } | null,
  create: vi.fn(),
  list: vi.fn(),
}));

vi.mock("@/lib/stripe", () => ({
  getStripe: () => state.stripe,
  get stripeEnabled() {
    return state.enabled;
  },
  PRICE_PRO: "price_pro",
}));
vi.mock("@/lib/db", () => ({
  schema: { workspaces: { id: "id" } },
  db: { update: () => ({ set: () => ({ where: async () => undefined }) }) },
}));
vi.mock("@/lib/auth/session", () => ({ getCurrentUser: async () => state.user }));
vi.mock("@/lib/data/team", () => ({
  getActiveWorkspaceForUser: async () => ({ id: "ws_1", stripeCustomerId: "cus_1" }),
  seatUsage: async () => ({ members: 2, invites: 0, used: 2 }),
}));

import { POST } from "@/app/api/stripe/checkout/route";

const location = (res: Response) => new URL(res.headers.get("location")!);

beforeEach(() => {
  state.enabled = true;
  state.user = { id: "usr_1", email: "a@example.com" };
  state.list = vi.fn().mockResolvedValue({ data: [] });
  state.create = vi.fn().mockResolvedValue({ url: "https://checkout.stripe.com/c/pay/cs_1" });
  state.stripe = { subscriptions: { list: state.list }, checkout: { sessions: { create: state.create } } };
});

describe("POST /api/stripe/checkout", () => {
  it("marks the cancel return so the abandonment can be measured", async () => {
    await POST();
    expect(new URL(state.create.mock.calls[0][0].cancel_url).search).toBe("?checkout=cancelled");
  });

  it("still returns to settings with the session id on success", async () => {
    await POST();
    expect(state.create.mock.calls[0][0].success_url).toContain("/dashboard/settings?upgraded=1&session_id={CHECKOUT_SESSION_ID}");
  });

  it("redirects to the Checkout URL", async () => {
    const res = await POST();
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe("https://checkout.stripe.com/c/pay/cs_1");
  });

  it("reports billing being off as a failed checkout, not a bare JSON error", async () => {
    state.enabled = false;
    const res = await POST();
    expect(res.status).toBe(303);
    expect(location(res).pathname).toBe("/dashboard/settings");
    expect(location(res).searchParams.get("checkout")).toBe("failed");
    expect(location(res).searchParams.get("reason")).toBe("billing_unconfigured");
  });

  it("reports Stripe refusing the session as a failed checkout", async () => {
    state.create.mockRejectedValue(new Error("Stripe is down"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST();
    spy.mockRestore();
    expect(location(res).searchParams.get("checkout")).toBe("failed");
    expect(location(res).searchParams.get("reason")).toBe("stripe_error");
  });

  it("reports a session with no URL as a failed checkout", async () => {
    state.create.mockResolvedValue({ url: null });
    expect(location(await POST()).searchParams.get("reason")).toBe("missing_checkout_url");
  });

  it("does not put the error text in the redirect", async () => {
    state.create.mockRejectedValue(new Error("secret detail"));
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await POST();
    spy.mockRestore();
    expect(res.headers.get("location")).not.toContain("secret");
  });
});
