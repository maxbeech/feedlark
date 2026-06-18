"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button, Input, Label } from "@/components/ui";
import type { ActionResult } from "@/lib/actions/auth";

type Action = (prev: ActionResult, fd: FormData) => Promise<ActionResult>;

export function AuthForm({ mode, action }: { mode: "login" | "signup"; action: Action }) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSignup = mode === "signup";

  return (
    <form action={formAction} className="space-y-4">
      {isSignup && (
        <div>
          <Label htmlFor="company">Company / product name</Label>
          <Input id="company" name="company" placeholder="Acme" autoComplete="organization" />
        </div>
      )}
      <div>
        <Label htmlFor="email">Work email</Label>
        <Input id="email" name="email" type="email" required placeholder="you@company.com" autoComplete="email" />
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
      </div>

      {state.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Please wait…" : isSignup ? "Create free account" : "Log in"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        {isSignup ? (
          <>Already have an account? <Link href="/login" className="font-medium text-brand-600">Log in</Link></>
        ) : (
          <>New to Feedlark? <Link href="/signup" className="font-medium text-brand-600">Start free</Link></>
        )}
      </p>
    </form>
  );
}
