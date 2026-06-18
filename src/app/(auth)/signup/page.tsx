import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { signupAction } from "@/lib/actions/auth";
import { getSessionUserId } from "@/lib/auth/session";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Start free",
  description: "Create a free Feedlark account — unlimited feedback, voters and boards. No credit card.",
  path: "/signup",
  noIndex: true,
});

export default async function SignupPage() {
  if (await getSessionUserId()) redirect("/dashboard");
  return (
    <>
      <h1 className="mb-1 text-xl font-bold text-ink">Create your free board</h1>
      <p className="mb-5 text-sm text-ink-muted">Unlimited users and votes. No card required.</p>
      <AuthForm mode="signup" action={signupAction} />
    </>
  );
}
