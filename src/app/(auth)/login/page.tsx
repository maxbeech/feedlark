import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { loginAction } from "@/lib/actions/auth";
import { getSessionUserId } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Log in",
  description: "Log in to your Feedlark workspace.",
  path: "/login",
  noIndex: true,
});

export default async function LoginPage() {
  if (await getSessionUserId()) redirect("/dashboard");
  return (
    <>
      <h1 className="mb-1 font-display text-2xl font-semibold tracking-tightest text-ink">Welcome back</h1>
      <p className="mb-5 text-sm text-ink-muted">Log in to manage your feedback.</p>
      <AuthForm mode="login" action={loginAction} />
    </>
  );
}
