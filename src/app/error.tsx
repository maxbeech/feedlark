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
    <div className="flex min-h-screen flex-col items-center justify-center bg-dotted px-4 text-center">
      <Logo className="mb-8" />
      <h1 className="text-2xl font-bold text-ink">Something went wrong</h1>
      <p className="mt-2 max-w-md text-ink-muted">An unexpected error occurred. Please try again — if it keeps happening, let us know.</p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <LinkButton href="/" variant="outline">Back home</LinkButton>
      </div>
    </div>
  );
}
