import { Logo } from "@/components/logo";
import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-4 text-center">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-0 glow-brand" aria-hidden="true" />
      <div className="relative flex flex-col items-center">
        <Logo className="mb-8" />
        <p className="font-display text-7xl font-semibold text-brand-500">404</p>
        <h1 className="mt-3 font-display text-2xl font-semibold tracking-tightest text-ink">This page flew the nest</h1>
        <p className="mt-2 max-w-md text-ink-muted">We couldn&apos;t find what you were looking for. It may have moved, or never existed.</p>
        <div className="mt-6 flex gap-3">
          <LinkButton href="/">Back home</LinkButton>
          <LinkButton href="/feedback" variant="outline">See a live board</LinkButton>
        </div>
      </div>
    </div>
  );
}
