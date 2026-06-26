import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Privacy Policy",
  description: "How Feedlark collects, uses and protects your data.",
  path: "/privacy",
  noIndex: true,
});

const CONTACT = "privacy@feedlark.com";

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tightest text-ink md:text-4xl">Privacy Policy</h1>
      <div className="prose-feedlark mt-6">
        <p>Last updated: 25 June 2026. This policy explains what we collect, why, and your rights under the UK GDPR and EU GDPR.</p>

        <h2>Who is the data controller</h2>
        <p>Feedlark, operated by its founder as a sole trader based in the United Kingdom, is the controller of personal data described here. Contact: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>

        <h2>What we collect</h2>
        <ul>
          <li><strong>Account data</strong> — admin name, email and a securely hashed password.</li>
          <li><strong>Billing data</strong> — handled by Stripe; we store your Stripe customer/subscription identifiers and plan, not your card number.</li>
          <li><strong>Feedback content</strong> — posts, votes and comments submitted to boards, plus any name or email a contributor chooses to share.</li>
          <li><strong>Voter identifier</strong> — an anonymous cookie id so one person can&apos;t vote twice; no account needed.</li>
          <li><strong>Technical data</strong> — IP address and request metadata used for security, abuse prevention and rate limiting, and diagnostic error reports.</li>
        </ul>

        <h2>Why we use it (lawful bases)</h2>
        <ul>
          <li><strong>To provide the service</strong> (performance of a contract) — accounts, boards, roadmaps, billing.</li>
          <li><strong>Legitimate interests</strong> — keeping the service secure, preventing abuse/spam, and improving the product.</li>
          <li><strong>Consent</strong> — sending you &quot;your request shipped&quot; update emails when you opt in by leaving an email; you can unsubscribe at any time from any such email.</li>
          <li><strong>Legal obligation</strong> — keeping billing and tax records.</li>
        </ul>

        <h2>Processors we use</h2>
        <p>We don&apos;t sell your data. We share it only with the providers that run Feedlark, each under data-processing terms:</p>
        <ul>
          <li><strong>Vercel</strong> — application hosting and content delivery.</li>
          <li><strong>Turso</strong> — database hosting.</li>
          <li><strong>Stripe</strong> — payment processing.</li>
          <li><strong>Resend</strong> — transactional and notification email.</li>
        </ul>
        <p>Some providers process data outside the UK/EEA; where they do, transfers are covered by appropriate safeguards such as Standard Contractual Clauses. Public board, roadmap and changelog content is publicly visible by design.</p>

        <h2>How long we keep it</h2>
        <p>We keep account and feedback data for as long as your account is active and for a reasonable period afterwards. Billing records are retained as long as required by law (typically up to six years in the UK). We delete or anonymise data when it is no longer needed, or sooner on a valid request.</p>

        <h2>Your rights</h2>
        <p>You have the right to access, correct, delete, restrict or object to processing of your personal data, to data portability, and to withdraw consent at any time. Admins can edit or delete board content and close their account in-app. To exercise any right, email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>. You also have the right to complain to the UK Information Commissioner&apos;s Office (ICO) or your local supervisory authority.</p>

        <h2>Cookies</h2>
        <p>We use only the cookies needed to run the service: a session cookie for signed-in admins, an active-workspace preference, and an anonymous voter id that prevents double-voting. We don&apos;t use advertising or cross-site tracking cookies. See our <a href="/cookies">cookie notice</a> for details.</p>

        <h2>Children</h2>
        <p>Feedlark isn&apos;t intended for anyone under 16, and we don&apos;t knowingly collect their data.</p>

        <h2>Changes and contact</h2>
        <p>We&apos;ll post any changes here and update the date above. Questions or requests: <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>

        <p className="text-sm text-ink-muted"><em>This is a good-faith policy written for Feedlark&apos;s actual data practices. We recommend a legal review against your registered entity before relying on it.</em></p>
      </div>
    </section>
  );
}
