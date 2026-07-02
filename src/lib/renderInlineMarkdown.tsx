import type { ReactNode } from "react";

/**
 * Minimal, safe inline markdown renderer.
 * Supports: [text](https://url), **bold**, *italic*, `code`, and bare https URLs.
 * All other input renders as plain text — no raw HTML is ever injected.
 * External links get target=_blank + rel=noopener noreferrer.
 */
export function renderInlineMarkdown(input: string): ReactNode {
  const nodes: ReactNode[] = [];
  const pattern =
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(\*\*|__)(.+?)\3|(\*|_)(.+?)\5|`([^`]+)`|(https?:\/\/[^\s)]+)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  const isExternal = (u: string) =>
    !u.startsWith("https://weddings.io") && !u.startsWith("/");
  while ((m = pattern.exec(input)) !== null) {
    if (m.index > last) nodes.push(input.slice(last, m.index));
    if (m[1] && m[2]) {
      const ext = isExternal(m[2]);
      nodes.push(
        <a
          key={key++}
          href={m[2]}
          className="font-medium text-primary underline-offset-4 hover:underline"
          {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {m[1]}
        </a>,
      );
    } else if (m[3] && m[4]) {
      nodes.push(
        <strong key={key++} className="text-foreground">
          {m[4]}
        </strong>,
      );
    } else if (m[5] && m[6]) {
      nodes.push(<em key={key++}>{m[6]}</em>);
    } else if (m[7]) {
      nodes.push(
        <code
          key={key++}
          className="rounded bg-secondary/60 px-1.5 py-0.5 font-mono text-[0.9em]"
        >
          {m[7]}
        </code>,
      );
    } else if (m[8]) {
      nodes.push(
        <a
          key={key++}
          href={m[8]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          {m[8]}
        </a>,
      );
    }
    last = m.index + m[0].length;
  }
  if (last < input.length) nodes.push(input.slice(last));
  return nodes.length > 0 ? nodes : input;
}
