#!/usr/bin/env node
/**
 * post-diff-pr-comment.mjs
 *
 * Reads tests/seo/staging-vs-prod-diff.json (produced by
 * diff-staging-vs-prod-meta.mjs) and posts a formatted comment on the
 * current GitHub PR. Reuses any prior comment marked with the hidden
 * marker so consecutive runs update in place instead of spamming.
 *
 * Env (all provided automatically inside GitHub Actions):
 *   GITHUB_TOKEN         standard actions token
 *   GITHUB_REPOSITORY    "owner/repo"
 *   GITHUB_EVENT_PATH    JSON payload with pull_request.number
 *   PR_NUMBER            optional override (for manual runs)
 *   DIFF_REPORT          override report path
 */
import fs from "node:fs/promises";

const MARKER = "<!-- weddings-io:staging-vs-prod-seo-diff -->";
const REPORT = process.env.DIFF_REPORT || "tests/seo/staging-vs-prod-diff.json";
const token = process.env.GITHUB_TOKEN;
const repo = process.env.GITHUB_REPOSITORY;

async function resolvePrNumber() {
  if (process.env.PR_NUMBER) return Number(process.env.PR_NUMBER);
  if (process.env.GITHUB_EVENT_PATH) {
    try {
      const evt = JSON.parse(await fs.readFile(process.env.GITHUB_EVENT_PATH, "utf8"));
      return evt.pull_request?.number ?? evt.number ?? null;
    } catch { /* fallthrough */ }
  }
  return null;
}

function truncate(v, n = 140) {
  const s = v == null ? "" : String(v);
  return s.length > n ? s.slice(0, n - 1) + "…" : s;
}

function renderBody(report) {
  const total = report.results.length;
  const bad = report.results.filter(r => r.diffs.length);
  const header = [
    MARKER,
    "## 🔍 Staging vs Production SEO diff",
    "",
    `- **Staging:** \`${report.staging}\``,
    `- **Production:** \`${report.prod}\``,
    `- **Posts checked:** ${total}`,
    `- **Posts with mismatches:** ${bad.length}`,
    `- **Generated:** ${report.generatedAt}`,
    "",
  ];
  if (!bad.length) {
    header.push("✅ All meta tags and Article JSON-LD match between staging and production.");
    return header.join("\n");
  }
  const parts = [...header, "### Mismatched posts", ""];
  for (const r of bad) {
    parts.push(`<details><summary><strong>${r.slug}</strong> · ${r.diffs.length} diff(s)</summary>`);
    parts.push("");
    parts.push("| Field | Staging | Production |");
    parts.push("|---|---|---|");
    for (const d of r.diffs) {
      const s = truncate(d.staging).replace(/\|/g, "\\|");
      const p = truncate(d.prod).replace(/\|/g, "\\|");
      parts.push(`| \`${d.field}\` | ${s || "_(empty)_"} | ${p || "_(empty)_"} |`);
    }
    parts.push("");
    parts.push(`- staging: ${r.staging.url} (HTTP ${r.staging.status})`);
    parts.push(`- production: ${r.prod.url} (HTTP ${r.prod.status})`);
    parts.push("</details>");
    parts.push("");
  }
  return parts.join("\n");
}

async function gh(url, init = {}) {
  const res = await fetch(`https://api.github.com${url}`, {
    ...init,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "weddings-io-seo-bot",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(`GitHub ${init.method || "GET"} ${url} → ${res.status} ${await res.text()}`);
  return res.json();
}

async function main() {
  const raw = await fs.readFile(REPORT, "utf8").catch(() => null);
  if (!raw) { console.error(`No diff report at ${REPORT}`); process.exit(0); }
  const report = JSON.parse(raw);
  const body = renderBody(report);

  if (!token || !repo) {
    console.log("--- PR comment preview (no GITHUB_TOKEN / GITHUB_REPOSITORY) ---\n");
    console.log(body);
    return;
  }
  const pr = await resolvePrNumber();
  if (!pr) { console.log("No PR number in event payload; skipping comment."); return; }

  const existing = await gh(`/repos/${repo}/issues/${pr}/comments?per_page=100`);
  const prior = existing.find(c => c.body?.includes(MARKER));
  if (prior) {
    await gh(`/repos/${repo}/issues/comments/${prior.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    console.log(`Updated PR #${pr} comment ${prior.id}`);
  } else {
    const created = await gh(`/repos/${repo}/issues/${pr}/comments`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    console.log(`Created PR #${pr} comment ${created.id}`);
  }
}
main().catch(e => { console.error(e); process.exit(1); });
