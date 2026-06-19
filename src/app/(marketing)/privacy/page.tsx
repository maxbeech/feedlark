import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Feedlark handles your data.",
  path: "/privacy",
  noIndex: true,
});

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tightest text-ink md:text-4xl">Privacy Policy</h1>
      <div className="prose-feedlark mt-6">
        <p>Last updated: June 18, 2026.</p>
        <h2>What we collect</h2>
        <ul>
          <li><strong>Account data:</strong> your email and (hashed) password for admins.</li>
          <li><strong>Feedback content:</strong> posts, votes and comments submitted to boards, plus optional names/emails voters choose to share.</li>
          <li><strong>Voter identity:</strong> an anonymous cookie id so one person cannot vote twice. No account required.</li>
        </ul>
        <h2>How we use it</h2>
        <p>To operate the service: show boards and roadmaps, prevent duplicate votes, and (if a voter opts in with an email) notify them when their request ships.</p>
        <h2>Sharing</h2>
        <p>We don&apos;t sell your data. We use Stripe for payments and a database/hosting provider to run the service. Public board content is, by design, publicly visible.</p>
        <h2>Your choices</h2>
        <p>Admins can delete content and close their account. Contact us to request data deletion.</p>
        <p className="text-sm text-ink-muted">This is a standard template. Operators should tailor it to their jurisdiction and have it reviewed.</p>
      </div>
    </section>
  );
}
