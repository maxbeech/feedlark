import { describe, it, expect, vi, beforeEach } from "vitest";

const captureException = vi.fn();
const captureMessage = vi.fn();
vi.mock("@sentry/nextjs", () => ({
  withScope: (fn: (s: unknown) => void) => fn({ setTag() {}, setExtra() {}, setLevel() {}, captureException, captureMessage }),
}));

import { captureServerError, captureServerMessage } from "@/lib/capture";

describe("captureServerError", () => {
  beforeEach(() => { captureException.mockReset(); captureMessage.mockReset(); });

  it("reports to Sentry when a DSN is set", () => {
    process.env.SENTRY_DSN = "https://k@o.ingest.sentry.io/1";
    captureServerError(new Error("boom"), { scope: "t" });
    expect(captureException).toHaveBeenCalledOnce();
    captureServerMessage("hm", { scope: "t" });
    expect(captureMessage).toHaveBeenCalledOnce();
  });

  it("fails visibly on the console with no DSN", () => {
    delete process.env.SENTRY_DSN; delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    captureServerError(new Error("boom"), { scope: "t" });
    expect(captureException).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

import { safeContext } from "@/lib/capture";
describe("safeContext", () => {
  it("keeps ids, counts and enums; drops objects, arrays and long text", () => {
    expect(safeContext({ scope: "x", id: "u_1", n: 3, ok: true, body: { a: 1 }, list: [1], text: "z".repeat(500) }).text).toHaveLength(83);
    const out = safeContext({ scope: "x", id: "u_1", n: 3, ok: true, body: { a: 1 }, list: [1] });
    expect(out).toEqual({ id: "u_1", n: 3, ok: true });
  });
});
