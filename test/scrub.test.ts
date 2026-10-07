import { describe, it, expect } from "vitest";
import { scrubString, scrubLog, scrubBreadcrumb, scrubEvent, scrubTransaction, scrubValue } from "@/lib/scrub";
import { sharedSentryOptions } from "@/lib/sentry-options";

const SECRETS = [
  "rory@example.com",
  "+44 7700 900123",
  "sk_live_abcdef123456",
  "whsec_abcdef123456",
  "hlm_sk_abcdef123456",
  "sntrys_abcdef123456",
  "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0In0.abcdefghij",
];

describe("scrubString", () => {
  it.each(SECRETS)("redacts %s", (s) => {
    expect(scrubString(`failed for ${s} today`)).not.toContain(s);
  });
  it("redacts bearer tokens and serialised secret fields", () => {
    expect(scrubString("Authorization: Bearer abcdef1234567890")).not.toContain("abcdef1234567890");
    expect(scrubString('{"password":"hunter2hunter","ok":1}')).not.toContain("hunter2hunter");
  });
});

describe("scrubLog", () => {
  it("scrubs message and attributes", () => {
    const out = scrubLog({ level: "error", message: "mail to a@b.com", attributes: { token: "x", note: "call +447700900123", scope: "mail" } })!;
    expect(out.message).toBe("mail to [redacted]");
    expect(JSON.stringify(out.attributes)).not.toContain("447700900123");
    expect((out.attributes as Record<string, unknown>).token).toBe("[redacted]");
    expect((out.attributes as Record<string, unknown>).scope).toBe("mail");
  });
});

describe("scrubBreadcrumb", () => {
  it("scrubs message, data and strips query strings from url/to/from", () => {
    const b = scrubBreadcrumb({
      message: "login a@b.com",
      data: { url: "https://x.test/a?token=abc", to: "/b?x=1#h", from: "/c?y=2", authorization: "Bearer zzzzzzzzzz" },
    })!;
    expect(b.message).toBe("login [redacted]");
    expect(b.data).toEqual({ url: "https://x.test/a", to: "/b", from: "/c", authorization: "[redacted]" });
  });
});

describe("scrubEvent", () => {
  it("scrubs exception text, request url, headers, extra and breadcrumbs", () => {
    const ev = scrubEvent({
      exception: { values: [{ type: "Error", value: "bad sk_live_abcdef123456 for a@b.com" }] },
      request: { url: "https://x.test/p?token=1", headers: { authorization: "Bearer abcdefgh1234" } },
      extra: { stripe_secret_key: "sk_x", note: "fine" },
      breadcrumbs: [{ message: "hi a@b.com", data: { url: "/q?z=1" } }],
    } as never)!;
    const json = JSON.stringify(ev);
    expect(json).not.toContain("a@b.com");
    expect(json).not.toContain("sk_live_abcdef123456");
    expect(json).not.toContain("token=1");
    expect(json).not.toContain("z=1");
    expect(ev.extra).toEqual({ stripe_secret_key: "[redacted]", note: "fine" });
  });
});

describe("scrubTransaction", () => {
  it("strips query strings from request url and span http.url / url.query data", () => {
    const tx = scrubTransaction({
      type: "transaction",
      transaction: "GET /b/x?token=1",
      request: { url: "https://x.test/b/x?token=abc" },
      spans: [
        { span_id: "1", trace_id: "2", start_timestamp: 0, data: { "http.url": "https://api.test/v1?key=abc", "url.query": "key=abc", "url.full": "https://api.test/v1?key=abc" } },
      ],
    } as never)!;
    const json = JSON.stringify(tx);
    expect(json).not.toContain("token=");
    expect(json).not.toContain("key=abc");
    expect(tx.spans?.[0].data?.["http.url"]).toBe("https://api.test/v1");
  });
});

describe("scrubValue", () => {
  it("redacts sensitive keys recursively", () => {
    expect(scrubValue({ a: { password: "p", email: "e", ok: 1 } })).toEqual({ a: { password: "[redacted]", email: "[redacted]", ok: 1 } });
  });
});

describe("sharedSentryOptions", () => {
  it("enables logs with every scrubber wired and PII off", () => {
    const o = sharedSentryOptions();
    expect(o.enableLogs).toBe(true);
    expect(o.beforeSendLog).toBe(scrubLog);
    expect(o.beforeSend).toBe(scrubEvent);
    expect(o.beforeBreadcrumb).toBe(scrubBreadcrumb);
    expect(o.beforeSendTransaction).toBe(scrubTransaction);
    expect(o.sendDefaultPii).toBe(false);
    expect(o.integrations.some((i) => i.name === "ConsoleLogs")).toBe(true);
  });
});

describe("hardening (SENTRY_STANDARD section 2)", () => {
  it("truncates and finishes fast on a long adversarial string", () => {
    const hostile = "a".repeat(200_000) + "@" + "1 ".repeat(100_000) + "Bearer " + "x".repeat(100_000);
    const t = Date.now();
    const out = scrubString(hostile);
    expect(Date.now() - t).toBeLessThan(1000);
    expect(out.length).toBeLessThan(10_100);
    expect(out.endsWith("...[truncated]")).toBe(true);
  });

  it("drops events, logs, breadcrumbs and transactions when scrubbing throws", () => {
    const boom = { get message(): string { throw new Error("boom"); } };
    const throwing = new Proxy({}, { get() { throw new Error("boom"); }, ownKeys() { throw new Error("boom"); } });
    expect(scrubEvent(throwing as never)).toBeNull();
    expect(scrubTransaction(throwing as never)).toBeNull();
    expect(scrubLog(boom as never)).toBeNull();
    expect(scrubBreadcrumb(throwing as never)).toBeNull();
  });

  it("scrubs a feedback event except the reporter's own contexts.feedback and user", () => {
    const ev = scrubEvent({
      type: "feedback",
      contexts: { feedback: { message: "love it", contact_email: "me@x.com", name: "Me" }, device: { note: "tok a@b.com" } },
      user: { email: "me@x.com", name: "Me", ip_address: "1.2.3.4" },
      tags: { who: "c@d.com" },
      extra: { password: "p" },
      request: { url: "https://x.test/p?token=1", cookies: { a: "b" } },
      breadcrumbs: [{ message: "hi e@f.com", data: { url: "/q?z=1" } }],
    } as never)!;
    const json = JSON.stringify(ev);
    expect(ev.contexts?.feedback).toEqual({ message: "love it", contact_email: "me@x.com", name: "Me" });
    expect(ev.user?.email).toBe("me@x.com");
    expect(ev.user).not.toHaveProperty("ip_address");
    for (const leak of ["a@b.com", "c@d.com", "e@f.com", "token=1", "z=1", '"password":"p"']) expect(json).not.toContain(leak);
  });
});
