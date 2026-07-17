#!/usr/bin/env node
/**
 * Diff the current SEO report against the previous successful run.
 * Writes ci-artifacts/seo/diff.md and prints a readable summary.
 *
 * Inputs:
 *   ci-artifacts/seo/report.json         — current run (produced by ci-seo-report.mjs)
 *   ci-artifacts/seo-previous/report.json — previous baseline (downloaded in CI)
 *   ci-artifacts/seo-previous/manifesto-metadata.log
 *   ci-artifacts/seo-previous/manifesto-images.log
 *   ci-artifacts/seo-previous/manifesto-links.log
 *
 * Compared fields:
 *   - per-check status (pass/fail transitions)
 *   - title length, description length (from metadata log)
 *   - canonical URL
 *   - image variant sizes in KB (from images log)
 *   - link status transitions (from links log)
 *
 * Exits 0 always — the diff is informational; ci-seo-report.mjs owns pass/fail.
 */
import { readFileSync, existsSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const CUR = join(ROOT, "ci-artifacts/seo");
const PREV = join(ROOT, "ci-artifacts/seo-previous");

const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : null);
const readText = (p) => (existsSync(p) ? readFileSync(p, "utf8") : "");

const curReport = readJson(join(CUR, "report.json"));
const prevReport = readJson(join(PREV, "report.json"));

if (!curReport) { console.error("✗ current ci-artifacts/seo/report.json missing"); process.exit(0); }
if (!prevReport) {
  console.log("ℹ No previous SEO report to diff against — this is the first baseline.");
  writeFileSync(join(CUR, "diff.md"), "# SEO diff\n\nNo previous run to compare against — this run establishes the baseline.\n");
  process.exit(0);
}

const lines = [`# SEO diff — ${prevReport.generatedAt} → ${curReport.generatedAt}`, ""];

// 1. Check status transitions.
const byName = (rs) => Object.fromEntries(rs.map((r) => [r.name, r.status]));
const cur = byName(curReport.results);
const prev = byName(prevReport.results);
const statusRows = [];
for (const name of new Set([...Object.keys(cur), ...Object.keys(prev)])) {
  const p = prev[name] ?? "—";
  const c = cur[name] ?? "—";
  if (p !== c) statusRows.push(`| ${name} | ${p} | ${c} |`);
}
lines.push("## Check status");
if (!statusRows.length) lines.push(`No changes — ${curReport.passed}/${curReport.totalChecks} passing (same as previous).`, "");
else {
  lines.push("| Check | Before | After |", "| ----- | ------ | ----- |", ...statusRows, "");
}

// 2. Metadata deltas — parse the metadata log.
function parseMetadata(log) {
  const t = log.match(/title\s+\[(\d+)\/70\]:\s*(.+)/);
  const d = log.match(/desc\s+\[(\d+)\/160\]:\s*(.+)/);
  const c = log.match(/canonical:\s+(\S+)/);
  const i = log.match(/image:\s+(\S+)\s+\(alt (\d+) chars\)/);
  return {
    titleLen: t ? Number(t[1]) : null, title: t?.[2],
    descLen: d ? Number(d[1]) : null, desc: d?.[2],
    canonical: c?.[1],
    image: i?.[1], altLen: i ? Number(i[2]) : null,
  };
}
const mCur = parseMetadata(readText(join(CUR, "manifesto-metadata.log")));
const mPrev = parseMetadata(readText(join(PREV, "manifesto-metadata.log")));
lines.push("## Metadata");
const mRows = [];
const cmp = (label, a, b, fmt = (x) => String(x ?? "—")) => {
  if (fmt(a) !== fmt(b)) mRows.push(`| ${label} | ${fmt(a)} | ${fmt(b)} |`);
};
cmp("title length", mPrev.titleLen, mCur.titleLen, (x) => `${x ?? "?"}/70`);
cmp("title", mPrev.title, mCur.title);
cmp("description length", mPrev.descLen, mCur.descLen, (x) => `${x ?? "?"}/160`);
cmp("description", mPrev.desc, mCur.desc);
cmp("canonical", mPrev.canonical, mCur.canonical);
cmp("og:image", mPrev.image, mCur.image);
cmp("alt length", mPrev.altLen, mCur.altLen, (x) => `${x} chars`);
if (!mRows.length) lines.push("No changes.", "");
else lines.push("| Field | Before | After |", "| ----- | ------ | ----- |", ...mRows, "");

// 3. Image size deltas.
function parseImages(log) {
  const map = {};
  for (const m of log.matchAll(/variant:\s+(\S+)\s+(\d+)\s*KB/g)) map[m[1]] = Number(m[2]);
  const src = log.match(/source:\s+\S+\s+\d+×\d+\s+(\d+)\s*KB/);
  if (src) map["source"] = Number(src[1]);
  return map;
}
const iCur = parseImages(readText(join(CUR, "manifesto-images.log")));
const iPrev = parseImages(readText(join(PREV, "manifesto-images.log")));
lines.push("## Image sizes (KB)");
const iRows = [];
for (const k of new Set([...Object.keys(iCur), ...Object.keys(iPrev)])) {
  const p = iPrev[k], c = iCur[k];
  if (p !== c) {
    const delta = p != null && c != null ? `${c - p > 0 ? "+" : ""}${c - p}` : "";
    iRows.push(`| ${k} | ${p ?? "—"} | ${c ?? "—"} | ${delta} |`);
  }
}
if (!iRows.length) lines.push("No changes.", "");
else lines.push("| Variant | Before | After | Δ |", "| ------- | ------ | ----- | - |", ...iRows, "");

// 4. Link status transitions.
function parseLinks(log) {
  const map = {};
  for (const m of log.matchAll(/[✓✗]\s+(\S+)\s+.+?\s+(https?:\/\/\S+)/g)) map[m[2]] = m[1];
  return map;
}
const lCur = parseLinks(readText(join(CUR, "manifesto-links.log")));
const lPrev = parseLinks(readText(join(PREV, "manifesto-links.log")));
lines.push("## Internal links");
const lRows = [];
for (const url of new Set([...Object.keys(lCur), ...Object.keys(lPrev)])) {
  if (lCur[url] !== lPrev[url]) lRows.push(`| ${url} | ${lPrev[url] ?? "new"} | ${lCur[url] ?? "removed"} |`);
}
if (!lRows.length) lines.push("No changes.", "");
else lines.push("| URL | Before | After |", "| --- | ------ | ----- |", ...lRows, "");

const out = lines.join("\n") + "\n";
writeFileSync(join(CUR, "diff.md"), out);
console.log(out);
if (process.env.GITHUB_STEP_SUMMARY) {
  writeFileSync(process.env.GITHUB_STEP_SUMMARY, out, { flag: "a" });
}
