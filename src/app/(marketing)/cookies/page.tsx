import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Cookie Notice",
  description: "The cookies Feedlark uses and why.",
  path: "/cookies",
  noIndex: true,
});

export default function CookiesPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tightest text-ink md:text-4xl">Cookie Notice</h1>
      <div className="prose-feedlark mt-6">
        <p>Last updated: 25 June 2026. Feedlark uses only strictly-necessary cookies, so we don&apos;t show a consent banner. We don&apos;t use advertising or cross-site tracking cookies.</p>
        <h2>Cookies we set</h2>
        <ul>
          <li><strong>fl_session</strong> — keeps signed-in admins logged in. Essential; set only after you log in.</li>
          <li><strong>fl_ws</strong> — remembers which workspace an admin is viewing. Essential preference for multi-workspace admins.</li>
          <li><strong>fl_voter</strong> — an anonymous id that stops the same person voting twice on a board. Essential to the voting feature; contains no personal data.</li>
        </ul>
        <h2>Analytics</h2>
        <p>We use privacy-friendly, aggregate analytics that do not set cross-site tracking cookies or build advertising profiles. If we ever introduce cookies that aren&apos;t strictly necessary, we&apos;ll ask for your consent first.</p>
        <h2>Managing cookies</h2>
        <p>You can clear or block cookies in your browser settings, but the service won&apos;t work properly without the essential ones above.</p>
      </div>
    </section>
  );
}
