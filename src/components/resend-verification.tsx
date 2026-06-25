"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui";
import { resendVerificationAction } from "@/lib/actions/auth";

export function ResendVerification({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState(resendVerificationAction, {});
  return (
    <form action={formAction} className="mt-4">
      <input type="hidden" name="email" value={email} />
      {state.ok ? (
        <p className="rounded-lg bg-spruce-50 px-3 py-2 text-sm text-spruce-700">
          Sent. Check your inbox (and spam folder).
        </p>
      ) : (
        <Button type="submit" variant="secondary" disabled={pending} className="w-full">
          {pending ? "Sending…" : "Resend confirmation email"}
        </Button>
      )}
      {state.error && <p role="alert" className="mt-2 text-sm text-red-700">{state.error}</p>}
    </form>
  );
}
