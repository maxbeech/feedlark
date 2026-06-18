import { Logo } from "@/components/logo";
import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-dotted px-4 text-center">
      <Logo className="mb-8" />
      <p className="text-6xl font-extrabold text-brand-500">404</p>
      <h1 className="mt-3 text-2xl font-bold text-ink">This page flew the nest</h1>
      <p className="mt-2 max-w-md text-ink-muted">We couldn&apos;t find what you were looking for. It may have moved or never existed.</p>
      <div className="mt-6 flex gap-3">
        <LinkButton href="/">Back home</LinkButton>
        <LinkButton href="/feedback" variant="outline">See a live board</LinkButton>
      </div>
    </div>
  );
}
