import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** URL-safe slug. Falls back to a short random suffix if empty. */
export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return base || "item";
}

/** A few reserved slugs that must never become a workspace handle. */
export const RESERVED_SLUGS = new Set([
  "api", "app", "admin", "dashboard", "login", "signup", "logout", "settings",
  "pricing", "blog", "about", "terms", "privacy", "widget", "www", "docs",
  "alternatives", "compare", "vs", "use-cases", "changelog", "roadmap", "feedback",
  "billing", "support", "help", "status", "assets", "static", "_next", "llms",
]);

export function isReservedSlug(slug: string): boolean {
  return RESERVED_SLUGS.has(slug);
}

/**
 * Single source of truth for email validity. Stricter than a bare `includes("@")`
 * so we never store/send to junk addresses like "@", "a@" or "@b".
 */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function statusLabel(status: string): string {
  return (
    {
      open: "Open",
      under_review: "Under Review",
      planned: "Planned",
      in_progress: "In Progress",
      complete: "Shipped",
      closed: "Closed",
    } as Record<string, string>
  )[status] ?? status;
}

/** Columns shown on the public roadmap (ordered). */
export const ROADMAP_COLUMNS: { status: string; label: string }[] = [
  { status: "planned", label: "Planned" },
  { status: "in_progress", label: "In Progress" },
  { status: "complete", label: "Shipped" },
];

export function timeAgo(epochSeconds: number): string {
  const diff = Math.floor(Date.now() / 1000) - epochSeconds;
  if (diff < 60) return "just now";
  const mins = Math.floor(diff / 60);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export function absoluteUrl(path = ""): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://feedlark.com";
  return `${base.replace(/\/$/, "")}${path}`;
}
