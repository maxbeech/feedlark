import Link from "next/link";
import { cn } from "@/lib/utils";

/** The Feedlark mark: a friendly upward "lark" chevron in brand orange. */
export function LarkMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-7 w-7", className)} aria-hidden="true">
      <rect width="32" height="32" rx="9" className="fill-brand-500" />
      <path
        d="M8 20c4-1 6-3 8-9 2 6 4 8 8 9-4 .5-6 2-8 5-2-3-4-4.5-8-5Z"
        className="fill-white"
      />
    </svg>
  );
}

export function Logo({ className, wordmark = true }: { className?: string; wordmark?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2", className)}>
      <LarkMark />
      {wordmark && <span className="text-lg font-bold tracking-tight text-ink">Feedlark</span>}
    </Link>
  );
}
