import { Logo } from "@/components/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grain relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-paper px-4 py-12">
      <div className="absolute inset-0 bg-grid bg-grid-fade" aria-hidden="true" />
      <div className="absolute inset-0 glow-brand" aria-hidden="true" />
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex justify-center"><Logo /></div>
        <div className="rounded-2xl border border-sand-200 bg-white/90 p-7 shadow-lift backdrop-blur-sm">
          {children}
        </div>
        <p className="mt-5 text-center text-xs text-ink-muted">Unlimited voters, free forever. No card required.</p>
      </div>
    </div>
  );
}
