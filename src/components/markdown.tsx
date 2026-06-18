import React from "react";

export type InlineToken =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "link"; value: string; href: string };

/**
 * Tiny, safe inline parser: **bold** and [text](url). Pure + unit-tested.
 * Returns plain tokens — rendered as React elements (never dangerouslySetInnerHTML),
 * so user-supplied changelog/post bodies can't inject HTML.
 */
export function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  const re = /\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) tokens.push({ type: "text", value: text.slice(last, m.index) });
    if (m[1] !== undefined) {
      tokens.push({ type: "bold", value: m[1] });
    } else if (m[2] !== undefined && m[3] !== undefined) {
      const href = /^https?:\/\//.test(m[3]) || m[3].startsWith("/") ? m[3] : "#";
      tokens.push({ type: "link", value: m[2], href });
    }
    last = re.lastIndex;
  }
  if (last < text.length) tokens.push({ type: "text", value: text.slice(last) });
  return tokens;
}

function Inline({ text }: { text: string }) {
  return (
    <>
      {parseInline(text).map((t, i) => {
        if (t.type === "bold") return <strong key={i} className="font-semibold text-ink">{t.value}</strong>;
        if (t.type === "link")
          return (
            <a key={i} href={t.href} className="font-medium text-brand-600 underline underline-offset-2" rel="noreferrer">
              {t.value}
            </a>
          );
        return <React.Fragment key={i}>{t.value}</React.Fragment>;
      })}
    </>
  );
}

/** Renders blank-line-separated paragraphs with inline bold/links. Safe by construction. */
export function Markdown({ text, className }: { text: string; className?: string }) {
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  return (
    <div className={className}>
      {paras.map((p, i) => (
        <p key={i} className={i > 0 ? "mt-3" : ""}>
          {p.split("\n").map((line, j) => (
            <React.Fragment key={j}>
              {j > 0 && <br />}
              <Inline text={line} />
            </React.Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}
