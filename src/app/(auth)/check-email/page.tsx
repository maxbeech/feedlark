import type { Metadata } from "next";
import Link from "next/link";
import { ResendVerification } from "@/components/resend-verification";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Confirm your email",
  description: "Confirm your email to finish setting up Feedlark.",
  path: "/check-email",
  noIndex: true,
});

export default async function CheckEmailPage({ searchParams }: { searchParams: Promise<{ email?: string }> }) {
  const { email } = await searchParams;
  return (
    <>
      <h1 className="mb-1 font-display text-2xl font-semibold tracking-tightest text-ink">Confirm your email</h1>
      <p className="mb-2 text-sm text-ink-muted">
        We sent a confirmation link{email ? <> to <span className="font-medium text-ink">{email}</span></> : ""}. Click it to finish setting up your account.
      </p>
      <p className="text-sm text-ink-muted">Didn&apos;t get it? Check your spam folder, or resend below.</p>
      {email && <ResendVerification email={email} />}
      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link href="/login" className="font-medium text-brand-600">Back to log in</Link>
      </p>
    </>
  );
}
