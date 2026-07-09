import Link from "next/link";
import type { ReactNode } from "react";

const LINK_RE = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Splits "text with a [link](/blog/x) inside" into strings and anchor elements. */
export function renderRich(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  LINK_RE.lastIndex = 0;
  while ((match = LINK_RE.exec(text))) {
    if (match.index > lastIndex) parts.push(text.slice(lastIndex, match.index));
    const [, label, href] = match;
    const cls = "text-brand-700 underline underline-offset-2 hover:text-brand-800";
    parts.push(
      href.startsWith("/") ? (
        <Link key={key++} href={href} className={cls}>{label}</Link>
      ) : (
        <a key={key++} href={href} target="_blank" rel="noopener noreferrer" className={cls}>{label}</a>
      )
    );
    lastIndex = LINK_RE.lastIndex;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

/** Strips markdown link syntax down to plain label text, e.g. for meta descriptions or plain-text contexts. */
export function stripRichLinks(text: string): string {
  return text.replace(LINK_RE, "$1");
}
