import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { FeedbackButton } from "@/components/feedback-button";

describe("FeedbackButton", () => {
  it("renders the footer link and the header variant", () => {
    expect(renderToStaticMarkup(createElement(FeedbackButton))).toContain("Send feedback");
    const header = renderToStaticMarkup(createElement(FeedbackButton, { variant: "header", user: { email: "a@b.com" } }));
    expect(header).toContain("Feedback");
    expect(header).toContain("<svg");
  });
});
