import { describe, it, expect } from "vitest";
import { clientIpFrom } from "../src/lib/client-ip";

const h = (o: Record<string, string>) => new Headers(o);

describe("clientIpFrom", () => {
  it("prefers the edge's own X-Helm7-Client-Ip, then x-real-ip, then the LAST x-forwarded-for hop, then a placeholder", () => {
    expect(clientIpFrom(h({ "x-helm7-client-ip": "7.7.7.7", "x-real-ip": "9.9.9.9", "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("7.7.7.7");
    expect(clientIpFrom(h({ "x-real-ip": "9.9.9.9", "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("9.9.9.9");
    expect(clientIpFrom(h({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }))).toBe("5.6.7.8");
    expect(clientIpFrom(h({}))).toBe("0.0.0.0");
  });

  it("cannot be moved to a fresh bucket by a forged leading x-forwarded-for entry", () => {
    const a = clientIpFrom(h({ "x-forwarded-for": "6.6.6.6, 203.0.113.9" }));
    const b = clientIpFrom(h({ "x-forwarded-for": "8.8.8.8, 203.0.113.9" }));
    expect(a).toBe(b);
  });
});
