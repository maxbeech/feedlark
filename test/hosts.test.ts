import { describe, it, expect } from "vitest";
import { isOwnHost } from "../src/lib/hosts";

describe("isOwnHost", () => {
  it("treats Feedlark's own names, local names and Helm7's product hosts as its own", () => {
    for (const host of ["feedlark.com", "www.feedlark.com", "localhost", "127.0.0.1", "feedlark-x1y2z3.helm7.app", "feedlark-x1y2z3.edge.helm7.app"]) {
      expect(isOwnHost(host), host).toBe(true);
    }
  });

  it("sends a customer's domain to the workspace lookup, including lookalikes", () => {
    for (const host of ["feedback.acme.com", "acme.helm7.app.evil.com", "notfeedlark.com", "feedlark.com.evil.com", "feedlark.vercel.app"]) {
      expect(isOwnHost(host), host).toBe(false);
    }
  });
});
