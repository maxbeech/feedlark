import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms governing your use of Feedlark.",
  path: "/terms",
  noIndex: true,
});

const CONTACT = "support@feedlark.com";

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="font-display text-3xl font-semibold tracking-tightest text-ink md:text-4xl">Terms of Service</h1>
      <div className="prose-feedlark mt-6">
        <p>Last updated: 25 June 2026. These terms form a binding agreement between you and Feedlark. By creating an account or using the service you agree to them.</p>

        <h2>1. Who we are</h2>
        <p>Feedlark (&quot;we&quot;, &quot;us&quot;) provides customer-feedback boards, a public roadmap and a changelog. Feedlark is operated by its founder as a sole trader based in the United Kingdom. You can reach us at <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>

        <h2>2. Accounts</h2>
        <p>You must be at least 16 and provide accurate information. You are responsible for keeping your credentials secure and for all activity under your account. Tell us promptly if you suspect unauthorised access.</p>

        <h2>3. Acceptable use</h2>
        <p>Don&apos;t use Feedlark to post unlawful, infringing, harmful or deceptive content, to send spam, to abuse or overload the service, or to attempt to bypass security or rate limits. You are responsible for content you and your end-users submit. We may remove content or suspend accounts that breach these terms.</p>

        <h2>4. Your content</h2>
        <p>You and your users keep ownership of the content you submit. You grant us a licence to host, store, process and display that content as needed to operate the service. Content posted to a public board, roadmap or changelog is, by design, publicly visible.</p>

        <h2>5. Plans, billing and taxes</h2>
        <p>The free plan is provided as-is, with unlimited end-users, votes, boards, roadmap and changelog. The Pro plan is billed at a flat rate per admin seat per month via our payment processor, Stripe, and renews automatically each month until cancelled. Adding or removing admin seats adjusts your subscription quantity on a prorated basis. Prices are exclusive of any applicable taxes (such as VAT), which are added where required.</p>

        <h2>6. Cancellation and refunds</h2>
        <p>You can cancel at any time from your billing settings; cancellation takes effect at the end of the current billing period and you keep Pro features until then. Except where the law requires otherwise, fees already paid are non-refundable and we do not provide partial-period refunds.</p>
        <p>If you are a consumer in the UK or EU, you have a statutory right to cancel a purchase within 14 days. Because Pro features are made available immediately, by subscribing you ask us to begin the service at once and acknowledge that your right to withdraw is lost once the service has been fully provided for the period paid.</p>

        <h2>7. Availability and changes</h2>
        <p>We work to keep Feedlark available but do not guarantee uninterrupted service. We may change, suspend or discontinue features, and we may update these terms; material changes will be notified through the service or by email, and continued use means you accept the updated terms.</p>

        <h2>8. Termination</h2>
        <p>You may stop using Feedlark and close your account at any time. We may suspend or terminate access for breach of these terms or to comply with the law.</p>

        <h2>9. Disclaimer and liability</h2>
        <p>Feedlark is provided &quot;as is&quot; without warranties of any kind to the extent permitted by law. We are not liable for indirect, incidental or consequential losses, or for loss of data, profit or goodwill. Our total liability for any claim is limited to the amount you paid us in the 12 months before the claim. Nothing in these terms excludes liability that cannot be excluded by law.</p>

        <h2>10. Governing law</h2>
        <p>These terms are governed by the laws of England and Wales, and the courts of England and Wales have exclusive jurisdiction, subject to any mandatory consumer-protection rights in your country of residence.</p>

        <h2>11. Contact</h2>
        <p>Questions about these terms? Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.</p>

        <p className="text-sm text-ink-muted"><em>This is a good-faith plain-language agreement. We recommend having it reviewed against your specific legal entity and jurisdiction before relying on it.</em></p>
      </div>
    </section>
  );
}
