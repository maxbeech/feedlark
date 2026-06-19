"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Input, Label } from "@/components/ui";
import { forgotPasswordAction, resetPasswordAction, type ForgotResult } from "@/lib/actions/password";

export function ForgotForm() {
  const [state, action, pending] = useActionState<ForgotResult, FormData>(forgotPasswordAction, {});
  if (state.ok) {
    return (
      <div className="space-y-3 text-sm">
        <p className="rounded-lg bg-spruce-50 px-3 py-2 text-spruce-700">
          If an account exists for that email, we&apos;ve sent a reset link.
        </p>
        {state.emailUnconfigured && (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-amber-800">
            Note: email delivery isn&apos;t configured on this deployment yet, so the link could not be sent. Contact support to reset your password.
          </p>
        )}
        <Link href="/login" className="block text-center font-medium text-brand-600">Back to log in</Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-4">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@company.com" autoComplete="email" />
      </div>
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? "Sending…" : "Send reset link"}</Button>
      <p className="text-center text-sm text-ink-muted">
        Remembered it? <Link href="/login" className="font-medium text-brand-600">Log in</Link>
      </p>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(resetPasswordAction, {} as { error?: string });
  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <div>
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" required minLength={8} placeholder="At least 8 characters" autoComplete="new-password" />
      </div>
      {state.error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>{pending ? "Saving…" : "Set new password"}</Button>
    </form>
  );
}
