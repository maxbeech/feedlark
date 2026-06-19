import type { Metadata } from "next";
import { ForgotForm } from "@/components/password-forms";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Reset password",
  description: "Reset your Feedlark password.",
  path: "/forgot",
  noIndex: true,
});

export default function ForgotPage() {
  return (
    <>
      <h1 className="mb-1 font-display text-2xl font-semibold tracking-tightest text-ink">Reset your password</h1>
      <p className="mb-5 text-sm text-ink-muted">We&apos;ll email you a link to set a new one.</p>
      <ForgotForm />
    </>
  );
}
