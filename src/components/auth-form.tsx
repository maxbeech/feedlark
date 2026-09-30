"use client";

import { useActionState, useEffect } from "react";
import Link from "next/link";
import { Button, Input, Label } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/auth";
import { track } from "@/lib/openhelm-analytics";
import { EVENTS, failedParams } from "@/lib/analytics-events";

type Action = (prev: ActionResult, fd: FormData) => Promise<ActionResult>;

export function AuthForm({
  mode,
  action,
  defaultEmail,
  hiddenFields,
  joining = false,
}: {
  mode: "login" | "signup";
  action: Action;
  defaultEmail?: string;
  hiddenFields?: Record<string, string>;
  joining?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = mode === "signup";

  // A refused signup or login is otherwise a step with no event: report it, with
  // a short reason code, so a failing step is not mistaken for an abandoned one.
  useEffect(() => {
    if (!state.error) return;
    track(isSignup ? EVENTS.SIGN_UP_FAILED : EVENTS.LOGIN_FAILED, failedParams(state.reason));
  }, [state, isSignup]);

  return (
    <form action={formAction} className="space-y-4">
      {hiddenFields &&
        Object.entries(hiddenFields).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {isSignup && !joining && (
        <div>
          <Label htmlFor="company">Company / product name</Label>
          <Input id="company" name="company" placeholder="Acme" autoComplete="organization" />
        </div>
      )}
      <div>
        <Label htmlFor="email">Work email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@company.com" autoComplete="email" defaultValue={defaultEmail} readOnly={Boolean(defaultEmail)} />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={isSignup ? 8 : undefined}
          placeholder={isSignup ? "At least 8 characters" : "Your password"}
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
        {!isSignup && (
          <div className="mt-1 text-right">
            <Link href="/forgot" className="text-xs font-medium text-brand-600">Forgot password?</Link>
          </div>
        )}
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Please wait…" : isSignup ? (joining ? "Create account & join" : "Create free account") : "Log in"}
      </Button>

      {!joining && (
        <p className="text-center text-sm text-ink-muted">
          {isSignup ? (
            <>Already have an account? <Link href="/login" className="font-medium text-brand-600">Log in</Link></>
          ) : (
            <>New to Feedlark? <Link href="/signup" className="font-medium text-brand-600">Start free</Link></>
          )}
        </p>
      )}
    </form>
  );
}
