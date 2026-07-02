import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { renderInlineMarkdown } from "../renderInlineMarkdown";

const html = (input: string) =>
  renderToStaticMarkup(<>{renderInlineMarkdown(input)}</>);

describe("renderInlineMarkdown", () => {
  it("renders plain text unchanged", () => {
    expect(html("hello world")).toBe("hello world");
  });

  it("renders external markdown link with target=_blank + rel=noopener", () => {
    const out = html("See [NY Post](https://nypost.com/x) today.");
    expect(out).toContain('href="https://nypost.com/x"');
    expect(out).toContain('target="_blank"');
    expect(out).toContain('rel="noopener noreferrer"');
    expect(out).toContain(">NY Post</a>");
  });

  it("does not open internal links in a new tab", () => {
    const out = html("Read [pricing](/pricing).");
    // internal links should NOT get target=_blank
    expect(out).not.toMatch(/href="\/pricing"[^>]*target=/);
  });

  it("escapes raw HTML and never injects tags", () => {
    const out = html('<script>alert(1)</script> and <img src=x>');
    expect(out).not.toContain("<script");
    expect(out).not.toContain("<img");
    expect(out).toContain("&lt;script&gt;");
  });

  it("ignores javascript: and data: urls (only http/https matched)", () => {
    const out = html("[click](javascript:alert(1)) and [x](data:text/html,<b>)");
    // No href should ever be created for non-http(s) schemes
    expect(out).not.toMatch(/href="javascript:/);
    expect(out).not.toMatch(/href="data:/);
    expect(out).not.toContain("<a ");
  });

  it("renders **bold**, *italic*, and `code`", () => {
    expect(html("**b**")).toContain("<strong");
    expect(html("*i*")).toContain("<em");
    expect(html("`c`")).toContain("<code");
  });

  it("autolinks bare https URLs as external", () => {
    const out = html("visit https://example.com now");
    expect(out).toContain('href="https://example.com"');
    expect(out).toContain('target="_blank"');
  });

  it("snapshot: mixed content", () => {
    expect(html("**Bold** and [link](https://a.co) and `code`.")).toMatchInlineSnapshot(
      `"<strong class="text-foreground">Bold</strong> and <a href="https://a.co" class="font-medium text-primary underline-offset-4 hover:underline" target="_blank" rel="noopener noreferrer">link</a> and <code class="rounded bg-secondary/60 px-1.5 py-0.5 font-mono text-[0.9em]">code</code>."`,
    );
  });
});
