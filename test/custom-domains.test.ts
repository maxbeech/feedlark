// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { normaliseCustomDomain } from "../src/lib/custom-domain-name";
import { attachCustomDomain, customDomainState, removeCustomDomain } from "../src/lib/custom-domains";

describe("normaliseCustomDomain", () => {
  it("accepts a name under the customer's domain and cleans it", () => {
    expect(normaliseCustomDomain(" https://Feedback.Acme.com/path ")).toEqual({ ok: true, hostname: "feedback.acme.com" });
    expect(normaliseCustomDomain("feedback.acme.co.uk")).toEqual({ ok: true, hostname: "feedback.acme.co.uk" });
  });

  it("refuses bare domains, which cannot take a CNAME", () => {
    for (const bad of ["acme.com", "acme.co.uk"]) expect(normaliseCustomDomain(bad), bad).toMatchObject({ ok: false });
  });

  it("refuses names that would shadow Feedlark or its hosting, and malformed names", () => {
    for (const bad of ["www.feedlark.com", "x.feedlark.com", "x.helm7.app", "x.helm7.com", "not a domain", "localhost", "-a.acme.com"]) {
      expect(normaliseCustomDomain(bad), bad).toMatchObject({ ok: false });
    }
  });
});

const listBody = (rows: unknown[]) => new Response(JSON.stringify({ data: rows }), { status: 200 });
const record = { type: "CNAME", name: "feedback.acme.com", value: "feedlark-abc123.edge.helm7.app" };

describe("Helm7 custom domains", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    process.env.HELM7_API_KEY = "hlm_sk_test";
    process.env.HELM7_PRODUCT_ID = "prd_test";
    delete process.env.HELM7_API_URL;
  });
  afterEach(() => vi.unstubAllGlobals());

  it("fails with a readable error, and never calls out, when Helm7 is not configured", async () => {
    delete process.env.HELM7_API_KEY;
    expect(await attachCustomDomain("feedback.acme.com")).toMatchObject({ ok: false });
    expect(await removeCustomDomain("feedback.acme.com")).toMatchObject({ ok: false });
    expect(await customDomainState("feedback.acme.com")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("attaches through the product's domains endpoint and returns the DNS record", async () => {
    fetchMock
      .mockResolvedValueOnce(listBody([]))
      .mockResolvedValueOnce(new Response("{}", { status: 200 }))
      .mockResolvedValueOnce(listBody([{ id: "dom_1", hostname: "feedback.acme.com", certificate: "pending", expected_record: record }]));
    const out = await attachCustomDomain("Feedback.Acme.com");
    expect(out).toMatchObject({ ok: true, hostname: "feedback.acme.com", record, certificate: "pending" });
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe("https://www.helm7.com/api/v1/products/prd_test/domains");
    expect(init.method).toBe("POST");
    expect(init.headers.authorization).toBe("Bearer hlm_sk_test");
    expect(JSON.parse(init.body)).toEqual({ hostname: "feedback.acme.com", environment: "production" });
  });

  it("does not attach twice when the host is already on the product", async () => {
    fetchMock.mockResolvedValueOnce(listBody([{ id: "dom_1", hostname: "feedback.acme.com", expected_record: record }]));
    expect(await attachCustomDomain("feedback.acme.com")).toMatchObject({ ok: true, record });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("reports a conflict as another workspace's domain and any other refusal generically", async () => {
    fetchMock.mockResolvedValueOnce(listBody([])).mockResolvedValueOnce(new Response(JSON.stringify({ error: { code: "conflict" } }), { status: 409 }));
    expect(await attachCustomDomain("feedback.acme.com")).toEqual({ ok: false, error: "That domain is already connected to another Feedlark workspace." });
    fetchMock.mockResolvedValueOnce(listBody([])).mockResolvedValueOnce(new Response("{}", { status: 500 }));
    expect(await attachCustomDomain("feedback.acme.com")).toMatchObject({ ok: false });
  });

  it("returns an error, not a throw, when Helm7 is unreachable", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    expect(await attachCustomDomain("feedback.acme.com")).toMatchObject({ ok: false });
    expect(await removeCustomDomain("feedback.acme.com")).toMatchObject({ ok: false });
    expect(await customDomainState("feedback.acme.com")).toBeNull();
  });

  it("removes by domain id with confirm, and treats an unknown host as already removed", async () => {
    fetchMock.mockResolvedValueOnce(listBody([{ id: "dom_1", hostname: "feedback.acme.com" }])).mockResolvedValueOnce(new Response("{}", { status: 200 }));
    expect(await removeCustomDomain("feedback.acme.com")).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[1];
    expect(url).toBe("https://www.helm7.com/api/v1/products/prd_test/domains/dom_1?confirm=true");
    expect(init.method).toBe("DELETE");

    fetchMock.mockResolvedValueOnce(listBody([]));
    expect(await removeCustomDomain("gone.acme.com")).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
