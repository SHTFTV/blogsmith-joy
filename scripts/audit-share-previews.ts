/**
 * Blog share-preview audit.
 *
 * Prints one row per blog post with the exact head values a crawler would see:
 *   title, description, canonical, og:image, twitter:card, twitter:image, focusKeywords
 *
 * Also prints a summary of posts missing focusKeywords or images.
 *
 * Run:
 *   bun run scripts/audit-share-previews.ts
 *   bun run scripts/audit-share-previews.ts --json > share-previews.json
 */
import { blogPosts, type BlogPost } from "../src/lib/blogPosts";

const SITE = "https://weddings.io";
const asJson = process.argv.includes("--json");

function rowFor(post: BlogPost) {
  const url = `${SITE}/blog/${post.slug}/`;
  const image = post.image ?? "";
  const absImage = image.startsWith("http") ? image : `${SITE}${image}`;
  const title = post.seoTitle ?? `${post.title} | Weddings.io`;
  const description = post.metaDescription ?? post.excerpt ?? "";
  const keywords = post.focusKeywords ?? [];
  return {
    slug: post.slug,
    title,
    description,
    canonical: url,
    "og:url": url,
    "og:image": absImage,
    "twitter:card": "summary_large_image",
    "twitter:image": absImage,
    focusKeywords: keywords,
    _issues: [
      !post.image && "missing:image",
      !description && "missing:description",
      keywords.length === 0 && "missing:focusKeywords",
      title.length > 70 && `title:${title.length}>70`,
      description.length > 165 && `description:${description.length}>165`,
    ].filter(Boolean) as string[],
  };
}

const rows = blogPosts.map(rowFor);

if (asJson) {
  console.log(JSON.stringify(rows, null, 2));
  process.exit(0);
}

const missingKw = rows.filter((r) => r._issues.includes("missing:focusKeywords"));
const missingImg = rows.filter((r) => r._issues.some((i) => i.startsWith("missing:image")));

console.log(`\nWeddings.io — Blog share-preview audit`);
console.log(`Total posts: ${rows.length}`);
console.log(`Missing focusKeywords: ${missingKw.length}`);
console.log(`Missing image: ${missingImg.length}`);
console.log("─".repeat(72));

for (const r of rows) {
  const flag = r._issues.length ? `  [${r._issues.join(", ")}]` : "";
  console.log(`\n${r.slug}${flag}`);
  console.log(`  title    : ${r.title}`);
  console.log(`  desc     : ${r.description.slice(0, 140)}${r.description.length > 140 ? "…" : ""}`);
  console.log(`  canonical: ${r.canonical}`);
  console.log(`  og:image : ${r["og:image"]}`);
  console.log(`  twitter  : ${r["twitter:card"]} / ${r["twitter:image"]}`);
  console.log(`  keywords : ${r.focusKeywords.length ? r.focusKeywords.join(", ") : "(none)"}`);
}
