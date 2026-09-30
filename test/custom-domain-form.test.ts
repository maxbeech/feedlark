// @vitest-environment node
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

// Capture the TrackOnMount props instead of running the browser-only effect.
const tracked: Array<{ name: string; params?: Record<string, unknown> }> = [];
vi.mock("@/components/analytics/track-on-mount", () => ({
  TrackOnMount: (props: { name: string; params?: Record<string, unknown> }) => {
    tracked.push(props);
    return null;
  },
}));
vi.mock("@/lib/actions/admin", () => ({ updateCustomDomainAction: vi.fn() }));

import { CustomDomainForm } from "@/components/dashboard/custom-domain-form";
import { EVENTS } from "@/lib/analytics-events";

const base = { workspaceId: "w1", current: null, record: null, certificate: null };

describe("CustomDomainForm (upstream DNS hint + journey analytics)", () => {
  it("fires paywall_shown for custom_domain on the Free plan and offers no form", () => {
    tracked.length = 0;
    const html = renderToStaticMarkup(createElement(CustomDomainForm, { ...base, isPro: false }));
    expect(tracked).toEqual([{ name: EVENTS.PAYWALL_SHOWN, params: { feature: "custom_domain" } }]);
    expect(html).toContain("on the Pro plan");
    expect(html).not.toContain("customDomain");
  });

  it("does not fire the paywall event for Pro and still shows the DNS record for a saved domain", () => {
    tracked.length = 0;
    const html = renderToStaticMarkup(
      createElement(CustomDomainForm, {
        ...base,
        isPro: true,
        current: "feedback.acme.com",
        record: { type: "CNAME", name: "feedback.acme.com", value: "edge.helm7.app" },
        certificate: "pending",
      }),
    );
    expect(tracked).toEqual([]);
    expect(html).toContain("Add this record at your DNS provider");
    expect(html).toContain("CNAME feedback.acme.com edge.helm7.app");
  });
});
