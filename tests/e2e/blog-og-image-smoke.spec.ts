import { test, expect, request as pwRequest } from "@playwright/test";
import fs from "node:fs/promises";

/**
 * blog-og-image-smoke.spec.ts
 *
 * For each visible blog post, loads staging + production HTML and asserts
 * that og:image and twitter:image point to a versioned
 * /opengraph-images/<slug>-<hash>.jpg URL AND that URL actually returns
 * 200 (i.e. the file exists on the deployed origin). Catches:
 *  - card generator didn't run before deploy
 *  - CDN serving a stale card that no longer exists
 *  - post shipped pointing at the shared fallback /opengraph.jpg
 *
 * Env:
 *   STAGING_BASE  default https://blogsmith-joy.lovable.app
 *   PROD_BASE     default https://weddings.io
 *   SLUGS         optional comma-separated slug override
 */
const STAGING = (process.env.STAGING_BASE || "https://blogsmith-joy.lovable.app").replace(/\/$/, "");
const PROD = (process.env.PROD_BASE || "https://weddings.io").replace(/\/$/, "");

const visible = await (async () => {
  const src = await fs.readFile("src/lib/blogPosts.ts", "utf8");
  const m = src.match(/visibleBlogSlugs\s*=\s*\[([\s\S]*?)\]/);
  return m ? [...m[1].matchAll(/["'`]([^"'`]+)["'`]/g)].map(x => x[1]) : [];
})();
const slugs = (process.env.SLUGS?.split(",").map(s => s.trim()).filter(Boolean)) || visible;

const pick = (html: string, re: RegExp) => html.match(re)?.[1]?.trim() ?? "";
const ogImageOf = (html: string) => pick(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
const twImageOf = (html: string) => pick(html, /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);

const VERSIONED_RE = /\/opengraph-images\/[a-z0-9-]+-[a-f0-9]{6,}\.(?:jpg|jpeg|png|webp|avif)(?:\?|$)/i;

for (const origin of [STAGING, PROD]) {
  test.describe(`OG image smoke @ ${origin}`, () => {
    for (const slug of slugs) {
      test(`${slug}`, async () => {
        const api = await pwRequest.newContext();
        const url = `${origin}/blog/${slug}/`;
        const pageRes = await api.get(url, { failOnStatusCode: false });
        expect(pageRes.status(), `${url} returned ${pageRes.status()}`).toBe(200);
        const html = await pageRes.text();

        const og = ogImageOf(html);
        const tw = twImageOf(html);
        expect(og, "og:image missing").toBeTruthy();
        expect(tw, "twitter:image missing").toBeTruthy();

        for (const [tag, val] of [["og:image", og], ["twitter:image", tw]] as const) {
          expect(val, `${tag} not a versioned /opengraph-images/* URL: ${val}`).toMatch(VERSIONED_RE);
          const abs = val.startsWith("http") ? val : `${origin}${val}`;
          const head = await api.fetch(abs, { method: "HEAD", failOnStatusCode: false });
          const status = head.status();
          // Some CDNs 405 HEAD -> fall back to GET.
          const finalStatus = status === 405 || status === 501
            ? (await api.get(abs, { failOnStatusCode: false })).status()
            : status;
          expect(finalStatus, `${tag} URL ${abs} returned ${finalStatus}`).toBe(200);
        }
        await api.dispose();
      });
    }
  });
}
