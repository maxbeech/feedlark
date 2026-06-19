import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "@/components/password-forms";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Set a new password",
  description: "Set a new Feedlark password.",
  path: "/reset",
  noIndex: true,
});

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token) {
    return (
      <div className="text-center text-sm text-ink-muted">
        <p>This reset link is missing or invalid.</p>
        <Link href="/forgot" className="mt-3 inline-block font-medium text-brand-600">Request a new link</Link>
      </div>
    );
  }
  return (
    <>
      <h1 className="mb-1 font-display text-2xl font-semibold tracking-tightest text-ink">Set a new password</h1>
      <p className="mb-5 text-sm text-ink-muted">Choose a new password for your account.</p>
      <ResetForm token={token} />
    </>
  );
}
