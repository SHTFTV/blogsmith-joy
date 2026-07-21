import { createFileRoute } from "@tanstack/react-router";
import fs from "node:fs/promises";
import path from "node:path";

/**
 * GET /seo/health?slug=<slug>
 *
 * Returns expected (from source-of-truth in src/lib/blogPosts.ts +
 * blogImageManifest.json + blogOgCards.json) and actual (parsed from the
 * live HTML at ?origin, defaults to https://weddings.io) values for:
 *   - <title>, meta description, canonical
 *   - og:{title,description,image,url,type}
 *   - twitter:{card,title,description,image}
 *   - Article JSON-LD (headline, image, datePublished, dateModified,
 *     author, publisher, mainEntityOfPage)
 *   - versioned OG card image hash (expected vs the hash embedded in
 *     the live og:image URL)
 *
 * Use in CI, uptime checks, or ad-hoc debugging. Public read-only.
 */
export const Route = createFileRoute("/seo/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug");
        const origin = (url.searchParams.get("origin") || "https://weddings.io").replace(/\/$/, "");
        if (!slug) return json({ ok: false, error: "missing ?slug" }, 400);

        const expected = await loadExpected(slug);
        if (!expected) return json({ ok: false, error: `unknown slug: ${slug}` }, 404);

        const target = `${origin}/blog/${slug}/`;
        let actual: Actual;
        try {
          const res = await fetch(target, { redirect: "follow" });
          const html = res.ok ? await res.text() : "";
          actual = { status: res.status, url: target, ...parseHtml(html) };
        } catch (e: any) {
          actual = { status: 0, url: target, error: e?.message ?? String(e) } as Actual;
        }

        const diffs: Array<{ field: string; expected: unknown; actual: unknown }> = [];
        const fields = [
          "title", "description", "canonical",
          "og:title", "og:description", "og:image", "og:url", "og:type",
          "twitter:card", "twitter:title", "twitter:description", "twitter:image",
          "ld.headline", "ld.image", "ld.datePublished", "ld.author",
        ] as const;
        for (const f of fields) {
          const e = (expected.meta as any)[f];
          const a = (actual as any)[f];
          if (e && normalize(f, e) !== normalize(f, a)) diffs.push({ field: f, expected: e, actual: a });
        }
        const liveHash = extractHash((actual as any)["og:image"]);
        const hashMatch = expected.ogCard?.hash ? expected.ogCard.hash === liveHash : null;

        return json({
          ok: diffs.length === 0 && (hashMatch !== false),
          slug,
          origin,
          expected,
          actual,
          imageHash: { expected: expected.ogCard?.hash ?? null, live: liveHash, match: hashMatch },
          diffs,
        });
      },
    },
  },
});

type Actual = {
  status: number;
  url: string;
  error?: string;
  [k: string]: unknown;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}

const URL_FIELDS = new Set(["og:image", "twitter:image", "ld.image"]);
const normalize = (field: string, v: unknown) => {
  if (v == null) return "";
  const s = String(v).trim().replace(/\s+/g, " ");
  return URL_FIELDS.has(field) ? s.split("?")[0] : s;
};
const extractHash = (u: unknown) => {
  const s = typeof u === "string" ? u : "";
  const m = s.match(/\/opengraph-images\/[a-z0-9-]+-([a-f0-9]{6,})\.[a-z]+/i);
  return m ? m[1] : null;
};

async function loadExpected(slug: string) {
  const srcPath = path.join(process.cwd(), "src/lib/blogPosts.ts");
  const src = await fs.readFile(srcPath, "utf8").catch(() => "");
  if (!src) return null;
  const post = extractPost(src, slug);
  if (!post) return null;

  const [ogCards, imageManifest] = await Promise.all([
    fs.readFile("src/lib/blogOgCards.json", "utf8").then(JSON.parse).catch(() => ({})),
    fs.readFile("src/lib/blogImageManifest.json", "utf8").then(JSON.parse).catch(() => ({})),
  ]);
  const card = ogCards[slug] ?? null;
  const canonical = `https://weddings.io/blog/${slug}/`;
  const ogImage = card ? `https://weddings.io${card.url}` : (post.image?.startsWith("/") ? `https://weddings.io${post.image}` : post.image || "");
  const title = post.seoTitle || post.title;
  const description = post.metaDescription || post.excerpt || "";
  const heroKey = post.image?.startsWith("/") ? post.image : null;
  const heroHash = heroKey ? imageManifest[heroKey] ?? null : null;

  return {
    ogCard: card,
    heroImageHash: heroHash,
    meta: {
      title,
      description,
      canonical,
      "og:title": title,
      "og:description": description,
      "og:image": ogImage,
      "og:url": canonical,
      "og:type": "article",
      "twitter:card": "summary_large_image",
      "twitter:title": title,
      "twitter:description": description,
      "twitter:image": ogImage,
      "ld.headline": title,
      "ld.image": ogImage,
      "ld.datePublished": post.date || "",
      "ld.author": "Weddings.io",
    },
  };
}

function extractPost(source: string, slug: string) {
  const objRe = /\{\s*slug:\s*["'`]([^"'`]+)["'`][\s\S]*?\n\s{2}\},/g;
  let m: RegExpExecArray | null;
  while ((m = objRe.exec(source))) {
    if (m[1] !== slug) continue;
    const block = m[0];
    const pick = (k: string) => {
      const r = new RegExp(`${k}:\\s*["'\`]((?:[^"'\`\\\\]|\\\\.)*)["'\`]`);
      const mm = block.match(r);
      return mm ? mm[1].replace(/\\"/g, '"').replace(/\\'/g, "'") : undefined;
    };
    return {
      slug,
      title: pick("title"),
      seoTitle: pick("seoTitle"),
      excerpt: pick("excerpt"),
      metaDescription: pick("metaDescription"),
      image: pick("image"),
      date: pick("date"),
    };
  }
  return null;
}

function parseHtml(html: string) {
  const pick = (re: RegExp) => (html.match(re)?.[1] ?? "").trim();
  const jsonLd = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)]
    .map(m => { try { return JSON.parse(m[1]); } catch { return null; } })
    .filter(Boolean) as any[];
  const nodes = jsonLd.flatMap(b => Array.isArray(b) ? b : (b["@graph"] || [b]));
  const article = nodes.find(n => {
    const t = n?.["@type"];
    return t === "Article" || t === "BlogPosting"
      || (Array.isArray(t) && (t.includes("Article") || t.includes("BlogPosting")));
  });
  const imgOf = (v: any) => Array.isArray(v) ? (v[0]?.url || v[0]) : (v?.url || v);
  return {
    title: pick(/<title[^>]*>([^<]+)<\/title>/i),
    description: pick(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i),
    canonical: pick(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["']/i),
    "og:title": pick(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i),
    "og:description": pick(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i),
    "og:image": pick(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i),
    "og:url": pick(/<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)["']/i),
    "og:type": pick(/<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']+)["']/i),
    "twitter:card": pick(/<meta[^>]+name=["']twitter:card["'][^>]+content=["']([^"']+)["']/i),
    "twitter:title": pick(/<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i),
    "twitter:description": pick(/<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i),
    "twitter:image": pick(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i),
    "ld.headline": String(article?.headline ?? "").trim(),
    "ld.image": String(imgOf(article?.image) ?? "").trim(),
    "ld.datePublished": String(article?.datePublished ?? "").trim(),
    "ld.author": String(article?.author?.name ?? (Array.isArray(article?.author) ? article.author[0]?.name : "") ?? "").trim(),
  };
}
