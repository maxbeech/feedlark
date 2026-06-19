/**
 * Pure helpers for the "You asked -> We shipped" loop. No DB / IO here so the
 * notify + changelog-generation logic is unit-testable in isolation.
 */

import { isValidEmail } from "@/lib/utils";

/** Normalise + dedupe a list of (possibly null) emails into unique, valid, lowercased ones. */
export function dedupeEmails(emails: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  for (const raw of emails) {
    if (!raw) continue;
    const e = raw.trim().toLowerCase();
    if (isValidEmail(e) && !seen.has(e)) seen.add(e);
  }
  return [...seen];
}

export function shipChangelogTitle(postTitle: string): string {
  const t = postTitle.trim();
  return t.length > 64 ? `${t.slice(0, 61)}…` : t;
}

export function shipChangelogBody(postTitle: string, voterCount: number): string {
  const who = voterCount === 1 ? "1 person" : `${voterCount} people`;
  return `You asked, we shipped: **${postTitle.trim()}**.\n\nThanks to the ${who} who requested and voted for this. It's now live.`;
}

export function notifyEmailSubject(workspaceName: string, postTitle: string): string {
  return `Shipped: ${postTitle.trim()} (${workspaceName})`;
}
