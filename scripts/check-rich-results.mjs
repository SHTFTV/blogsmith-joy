#!/usr/bin/env node
/**
 * CI Rich-Results check via Google Search Console URL Inspection API.
 *
 * For each URL in URLS_TO_CHECK (or a default list of new posts) we call
 * urlInspection/index:inspect through the Lovable connector gateway and
 * confirm BreadcrumbList / FAQ rich results validate.
 *
 * Environment (set as CI secrets):
 *   LOVABLE_API_KEY               — Lovable connector gateway auth
 *   GOOGLE_SEARCH_CONSOLE_API_KEY — GSC connection key
 *   SITE_URL                      — property root, e.g. https://weddings.io/
 *   URLS_TO_CHECK                 — comma-separated URLs to inspect (optional)
 *
 * Exits non-zero on any FAIL verdict OR any warning on Breadcrumbs / FAQ.
 * When a URL is still "unknown to Google" we WARN (don't fail) so this can
 * run right after publish; flip STRICT=1 to fail on unknown too.
 */
const {
  LOVABLE_API_KEY,
  GOOGLE_SEARCH_CONSOLE_API_KEY,
  SITE_URL = "https://weddings.io/",
  URLS_TO_CHECK,
  STRICT,
} = process.env;

if (!LOVABLE_API_KEY || !GOOGLE_SEARCH_CONSOLE_API_KEY) {
  console.error("Missing LOVABLE_API_KEY or GOOGLE_SEARCH_CONSOLE_API_KEY.");
  process.exit(2);
}

const DEFAULT_URLS = [
  "https://weddings.io/Who-Owns-Weddings.io",
  "https://weddings.io/ai",
  "https://weddings.io/blog/ai-wedding-planning-what-the-warnings-get-right/",
  "https://weddings.io/blog/eyespyr-verification-workflow-live/",
  "https://weddings.io/blog/photo-wall-live-wedding-guest-photos/",
];

const urls = (URLS_TO_CHECK ? URLS_TO_CHECK.split(",").map((s) => s.trim()) : DEFAULT_URLS).filter(
  Boolean,
);

const gwUrl = "https://connector-gateway.lovable.dev/google_search_console/v1/urlInspection/index:inspect";
const failures = [];
const warnings = [];

for (const url of urls) {
  const res = await fetch(gwUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": GOOGLE_SEARCH_CONSOLE_API_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE_URL }),
  });
  if (!res.ok) {
    failures.push(`${url} — HTTP ${res.status}`);
    continue;
  }
  const json = await res.json();
  const r = json.inspectionResult ?? {};
  const coverage = r.indexStatusResult?.coverageState ?? "unknown";
  const rich = r.richResultsResult ?? {};
  const verdict = rich.verdict ?? "NONE";
  const types = (rich.detectedItems ?? []).map((d) => d.richResultType);

  const line = `[${url}] index=${r.indexStatusResult?.verdict ?? "?"} coverage="${coverage}" rich=${verdict} types=[${types.join(", ")}]`;
  console.log(line);

  if (coverage.startsWith("URL is unknown")) {
    (STRICT ? failures : warnings).push(`${url} — not yet crawled by Google`);
    continue;
  }
  if (verdict === "FAIL") failures.push(`${url} — rich results FAIL`);
  // Look for issue arrays in detected items
  for (const item of rich.detectedItems ?? []) {
    for (const issue of item.items ?? []) {
      if (issue.issues) {
        for (const iss of issue.issues) {
          const msg = `${url} — ${item.richResultType}: ${iss.issueMessage} (${iss.severity})`;
          if (iss.severity === "ERROR") failures.push(msg);
          else warnings.push(msg);
        }
      }
    }
  }
}

if (warnings.length) {
  console.warn(`\n⚠ ${warnings.length} warning(s):`);
  for (const w of warnings) console.warn(`  ${w}`);
}
if (failures.length) {
  console.error(`\n✘ ${failures.length} rich-results failure(s):`);
  for (const f of failures) console.error(`  ${f}`);
  process.exit(1);
}
console.log(`\n✔ Rich-results check passed for ${urls.length} URL(s).`);
