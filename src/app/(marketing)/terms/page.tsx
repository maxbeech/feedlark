import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Terms of Service",
  description: "The terms governing your use of Feedlark.",
  path: "/terms",
  noIndex: true,
});

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold text-ink">Terms of Service</h1>
      <div className="prose-feedlark mt-6">
        <p>Last updated: June 18, 2026. By using Feedlark you agree to these terms.</p>
        <h2>Using Feedlark</h2>
        <p>You may use Feedlark to collect, organise and display product feedback. You are responsible for the content you and your users post, and for complying with applicable laws.</p>
        <h2>Accounts</h2>
        <p>You must provide accurate information and keep your credentials secure. You are responsible for activity under your account.</p>
        <h2>Plans &amp; billing</h2>
        <p>The free plan is provided as-is. Paid plans are billed per admin seat via Stripe and renew until cancelled. You can cancel at any time from your billing settings.</p>
        <h2>Acceptable use</h2>
        <p>Don&apos;t use Feedlark for unlawful content, spam, or to infringe others&apos; rights. We may suspend accounts that violate these terms.</p>
        <h2>Disclaimer</h2>
        <p>Feedlark is provided &quot;as is&quot; without warranties. To the extent permitted by law, we are not liable for indirect or consequential damages.</p>
        <p className="text-sm text-ink-muted">This is a standard template — operators should have it reviewed by a lawyer before commercial launch.</p>
      </div>
    </section>
  );
}
