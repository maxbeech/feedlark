// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const { drain, del } = vi.hoisted(() => ({ drain: vi.fn(), del: vi.fn() }));

vi.mock("@/lib/ship-drain", () => ({ drainShipNotifications: drain }));
vi.mock("@/lib/db", () => ({
  schema: { rateLimits: { expiresAt: "e", bucket: "b" }, errorEvents: { createdAt: "c", id: "i" } },
  db: { delete: () => ({ where: () => ({ returning: del }) }) },
}));

import { GET } from "@/app/api/cron/ship-notifications/route";

const call = (authorization?: string) =>
  GET(new Request("https://www.feedlark.com/api/cron/ship-notifications", authorization ? { headers: { authorization } } : undefined));

describe("ship-notifications cron route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete process.env.CRON_SECRET;
    drain.mockResolvedValue({ sent: 0 });
    del.mockResolvedValue([]);
  });

  it("fails closed with 503 and does no work when CRON_SECRET is unset", async () => {
    const res = await call();
    expect(res.status).toBe(503);
    expect(drain).not.toHaveBeenCalled();
  });

  it("is 401 with a wrong token and does no work", async () => {
    process.env.CRON_SECRET = "right-secret";
    const res = await call("Bearer wrong-secret");
    expect(res.status).toBe(401);
    expect(drain).not.toHaveBeenCalled();
  });

  it("runs with the right token", async () => {
    process.env.CRON_SECRET = "right-secret";
    const res = await call("Bearer right-secret");
    expect(res.status).toBe(200);
    expect(drain).toHaveBeenCalledOnce();
  });
});
