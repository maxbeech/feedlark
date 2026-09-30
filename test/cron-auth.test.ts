import { describe, it, expect, beforeEach } from "vitest";
import { checkCronAuth } from "../src/lib/cron-auth";

const req = (authorization?: string) =>
  new Request("https://example.com/api/cron/x", authorization ? { headers: { authorization } } : undefined);

describe("checkCronAuth", () => {
  beforeEach(() => {
    delete process.env.CRON_SECRET;
  });

  it("is 503 when CRON_SECRET is unset, whatever the caller sends", () => {
    expect(checkCronAuth(req())).toEqual({ ok: false, status: 503, error: "CRON_SECRET is not configured" });
    expect(checkCronAuth(req("Bearer undefined"))).toMatchObject({ ok: false, status: 503 });
    expect(checkCronAuth(req("Bearer "))).toMatchObject({ ok: false, status: 503 });
  });

  it("is 503 when CRON_SECRET is the empty string", () => {
    process.env.CRON_SECRET = "";
    expect(checkCronAuth(req("Bearer "))).toMatchObject({ ok: false, status: 503 });
  });

  it("is 401 for a missing, wrong or different-length token", () => {
    process.env.CRON_SECRET = "s3cret-value";
    expect(checkCronAuth(req())).toMatchObject({ ok: false, status: 401 });
    expect(checkCronAuth(req("Bearer s3cret-valuX"))).toMatchObject({ ok: false, status: 401 });
    expect(checkCronAuth(req("Bearer s3cret"))).toMatchObject({ ok: false, status: 401 });
    expect(checkCronAuth(req("s3cret-value"))).toMatchObject({ ok: false, status: 401 });
  });

  it("accepts the exact bearer token", () => {
    process.env.CRON_SECRET = "s3cret-value";
    expect(checkCronAuth(req("Bearer s3cret-value"))).toEqual({ ok: true });
  });
});
