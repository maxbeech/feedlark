"use client";

import { useEffect } from "react";
import { Logo } from "@/components/logo";
import { Button, LinkButton } from "@/components/ui";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Surface to the console (and any attached monitoring) — never swallow.
    console.error(error);
  }, [error]);

  return (
    <div className="grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-4 text-center">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
      <div className="relative flex flex-col items-center">
        <Logo className="mb-8" />
        <h1 className="font-display text-2xl font-semibold tracking-tightest text-ink">Something went wrong</h1>
        <p className="mt-2 max-w-md text-ink-muted">An unexpected error occurred. Please try again. If it keeps happening, let us know.</p>
        <div className="mt-6 flex gap-3">
          <Button onClick={reset}>Try again</Button>
          <LinkButton href="/" variant="outline">Back home</LinkButton>
        </div>
      </div>
    </div>
  );
}
