import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * The Feedlark mark: a lark rising — two wing strokes that also read as an
 * upvote chevron, the heart of a feedback product. Warm gradient squircle.
 */
export function LarkMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden="true">
      <defs>
        <linearGradient id="lark-tile" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#fb8b3c" />
          <stop offset="100%" stopColor="#df520c" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9.5" fill="url(#lark-tile)" />
      {/* Wings: a soaring lark that doubles as an upvote chevron. */}
      <path
        d="M6.5 19.5c3.4-.2 5.2-1.9 7-4.8C14.7 12.6 15.3 12 16 12s1.3.6 2.5 2.7c1.8 2.9 3.6 4.6 7 4.8"
        fill="none"
        stroke="#fff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="20.5" r="1.5" fill="#fff" />
    </svg>
  );
}

export function Logo({ className, wordmark = true }: { className?: string; wordmark?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)}>
      <LarkMark className="transition-transform duration-200 group-hover:-translate-y-0.5" />
      {wordmark && (
        <span className="font-display text-[1.35rem] font-semibold tracking-tightest text-ink">Feedlark</span>
      )}
    </Link>
  );
}
