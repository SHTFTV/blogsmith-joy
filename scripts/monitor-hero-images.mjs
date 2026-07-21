#!/usr/bin/env node
/**
 * monitor-hero-images.mjs
 * Alerts (non-zero exit) when any hero image or responsive variant
 * (JPG/PNG/WebP/AVIF) in /blog-images or /opengraph-images returns
 * non-200 on production. Intended to run in CI post-deploy and on
 * a schedule (cron/GitHub Actions).
 *
 * Env:
 *   SITE_BASE          default https://weddings.io
 *   ALERT_WEBHOOK_URL  optional Slack/Discord/generic POST target
 */
import fs from "node:fs/promises";
import path from "node:path";

const BASE = (process.env.SITE_BASE || "https://weddings.io").replace(/\/$/, "");
const WEBHOOK = process.env.ALERT_WEBHOOK_URL;
const ROOTS = ["public/blog-images", "public/opengraph-images"];
const EXT = /\.(jpe?g|png|webp|avif)$/i;

async function walk(dir) {
  const out = [];
  let entries;
  try { entries = await fs.readdir(dir, { withFileTypes: true }); }
  catch { return out; }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else if (EXT.test(e.name)) out.push(p);
  }
  return out;
}

async function head(url) {
  try {
    const r = await fetch(url, { method: "HEAD", redirect: "follow" });
    return { status: r.status, cc: r.headers.get("cache-control") || "" };
  } catch (e) {
    return { status: 0, cc: "", error: e.message };
  }
}

const files = (await Promise.all(ROOTS.map(walk))).flat();
if (!files.length) { console.error("No hero images found under", ROOTS.join(", ")); process.exit(2); }

const results = await Promise.all(files.map(async f => {
  const url = `${BASE}/${f.replace(/^public\//, "")}`;
  const r = await head(url);
  return { url, ...r };
}));

const missing = results.filter(r => r.status !== 200);
const total = results.length;
console.log(`Checked ${total} hero image URLs on ${BASE} — ${missing.length} failing.`);
for (const m of missing) console.log(`  ✗ ${m.status || "ERR"}  ${m.url}${m.error ? ` (${m.error})` : ""}`);

if (missing.length && WEBHOOK) {
  const text = `🚨 weddings.io hero-image monitor: ${missing.length}/${total} non-200\n` +
    missing.slice(0, 20).map(m => `• ${m.status} ${m.url}`).join("\n");
  await fetch(WEBHOOK, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text, content: text }),
  }).catch(e => console.error("Webhook post failed:", e.message));
}

if (missing.length) process.exit(1);
console.log("✓ All hero images return 200.");
