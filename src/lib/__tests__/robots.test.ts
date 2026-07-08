import { describe, it, expect } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(__dirname, "..", "..", "..");
const robotsPath = join(ROOT, "public/robots.txt");

describe("robots.txt", () => {
  it("exists in /public so it's served at /robots.txt", () => {
    expect(existsSync(robotsPath)).toBe(true);
  });

  const content = existsSync(robotsPath) ? readFileSync(robotsPath, "utf8") : "";

  it("declares User-agent and Allow rules", () => {
    expect(content).toMatch(/^User-agent:\s*\*/m);
    expect(content).toMatch(/^Allow:\s*\//m);
  });

  it("references sitemap.xml with an absolute URL", () => {
    expect(content).toMatch(/^Sitemap:\s*https:\/\/weddings\.io\/sitemap\.xml\s*$/m);
  });

  it("does not blanket-block the primary user-agent", () => {
    const primaryBlock = content.split(/\nUser-agent:/)[0]; // first block = User-agent: *
    expect(primaryBlock).not.toMatch(/^Disallow:\s*\/\s*$/m);
  });
});
