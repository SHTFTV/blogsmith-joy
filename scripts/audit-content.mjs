#!/usr/bin/env node
/**
 * Production content audit for Weddings.io.
 *
 * Scans every blog post and static HTML page for:
 *   - Broken or unsafe images (must be /... or https://; must resolve if local)
 *   - Broken or unsafe canonical URLs
 *   - Broken or unsafe source/citation URLs (BlogPost.sources)
 *   - Unsafe inline markdown links in title / subtitle / excerpt / body / faq
 *
 * Unsafe = javascript:, data:, protocol-relative, or non-http(s) schemes.
 * Broken (local) = referenced file does not exist under public/.
 * Broken (remote) = HTTP HEAD returns 4xx/5xx (only checked when --remote is passed).
 *
 * Exit non-zero on any issue. Wire as a build/CI step.
 */
import { readFileSync, existsSync, statSync, readdirSync } from "node:fs";
import { join, extname } from "node:path";
import { fileURLToPath } from "node:url";
import { pathToFileURL } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const PUB = join(ROOT, "public");
const CHECK_REMOTE = process.argv.includes("--remote");
const problems = [];
const record = (kind, where, detail) => problems.push({ kind, where, detail });

const SAFE_URL = /^(https?:\/\/|\/)/;
const UNSAFE_SCHEMES = /^(javascript:|data:|vbscript:|file:)/i;

function checkUrl(url, where, label) {
  if (!url) return;
  if (UNSAFE_SCHEMES.test(url)) return record("UNSAFE", where, `${label}: ${url}`);
  if (!SAFE_URL.test(url) && !url.startsWith("#") && !url.startsWith("mailto:")) {
    return record("MALFORMED", where, `${label}: ${url}`);
  }
}

function checkLocalAsset(url, where, label) {
  if (!url || !url.startsWith("/")) return;
  const clean = url.split("?")[0].split("#")[0];
  const full = join(PUB, clean);
  if (!existsSync(full)) record("BROKEN_LOCAL", where, `${label} missing: ${url}`);
}

async function checkRemote(url, where, label) {
  if (!CHECK_REMOTE || !url?.startsWith("http")) return;
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow" });
    if (r.status >= 400) record("BROKEN_REMOTE", where, `${label} ${r.status}: ${url}`);
  } catch (e) {
    record("BROKEN_REMOTE", where, `${label} ERR: ${url} (${e.message})`);
  }
}

// Scan inline markdown links in a text field
function scanMarkdown(text, where) {
  if (!text) return;
  const re = /\[([^\]]+)\]\(([^)]+)\)/g;
  let m;
  while ((m = re.exec(text)) !== null) checkUrl(m[2], where, "md-link");
}

// ---------- Load blog posts via tsx transform ----------
async function loadPosts() {
  const { blogPosts } = await import(pathToFileURL(join(ROOT, "src/lib/blogPosts.ts")).href);
  return blogPosts;
}

const posts = await loadPosts();
console.log(`Auditing ${posts.length} blog posts…`);

for (const p of posts) {
  const w = `blog:${p.slug}`;
  // Image
  checkUrl(p.image, w, "image");
  checkLocalAsset(p.image, w, "image");
  await checkRemote(p.image, w, "image");
  // Canonical (constructed by route)
  const canonical = `https://weddings.io/blog/${p.slug}/`;
  checkUrl(canonical, w, "canonical");
  // Sources
  for (const s of p.sources ?? []) {
    checkUrl(s.url, w, "source");
    await checkRemote(s.url, w, "source");
  }
  // Markdown in all text fields
  scanMarkdown(p.title, `${w}:title`);
  scanMarkdown(p.subtitle, `${w}:subtitle`);
  scanMarkdown(p.excerpt, `${w}:excerpt`);
  (p.body ?? []).forEach((b, i) => scanMarkdown(b, `${w}:body[${i}]`));
  (p.faq ?? []).forEach((f, i) => {
    scanMarkdown(f.question, `${w}:faq[${i}].q`);
    scanMarkdown(f.answer, `${w}:faq[${i}].a`);
  });
}

// ---------- Scan static HTML in public/ ----------
function walkHtml(dir, out = []) {
  for (const name of readdirSync(dir)) {
    if (name.startsWith(".") || name === "node_modules") continue;
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) walkHtml(p, out);
    else if (extname(p) === ".html") out.push(p);
  }
  return out;
}

const htmlFiles = walkHtml(PUB);
console.log(`Auditing ${htmlFiles.length} static HTML files…`);

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");
  const w = `html:${file.replace(ROOT + "/", "")}`;
  const canon = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (canon) {
    checkUrl(canon[1], w, "canonical");
    await checkRemote(canon[1], w, "canonical");
  }
  const ogImg = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (ogImg) {
    checkUrl(ogImg[1], w, "og:image");
    await checkRemote(ogImg[1], w, "og:image");
  }
  const imgRe = /<img[^>]+src=["']([^"']+)["']/gi;
  let m;
  while ((m = imgRe.exec(html)) !== null) {
    checkUrl(m[1], w, "img");
    checkLocalAsset(m[1], w, "img");
  }
  const mediaRe = /<(video|source|audio)[^>]+src=["']([^"']+)["']/gi;
  while ((m = mediaRe.exec(html)) !== null) {
    checkUrl(m[2], w, `${m[1]}.src`);
    checkLocalAsset(m[2], w, `${m[1]}.src`);
  }
}

// ---------- Report ----------
if (problems.length === 0) {
  console.log(`✔ Content audit clean (${CHECK_REMOTE ? "with" : "without"} remote checks).`);
  process.exit(0);
}

console.error(`✘ ${problems.length} content audit issue(s):`);
for (const p of problems) console.error(`  [${p.kind}] ${p.where} — ${p.detail}`);
process.exit(1);
