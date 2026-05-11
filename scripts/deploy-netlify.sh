#!/usr/bin/env bash
# Deploy the latest weddings-io-site-as-is-plus-blog-ecosystem-updates_v*.zip
# to Netlify production using netlify-cli.
#
# Prereqs (one-time):
#   1. npm i -g netlify-cli
#   2. netlify login                        # opens browser, stores auth token
#   3. export NETLIFY_SITE_ID=<your-site-id>   # find at: Netlify → Site settings → Site information → API ID
#      (or put it in .env.deploy as NETLIFY_SITE_ID=...)
#
# Usage:
#   ./scripts/deploy-netlify.sh                       # deploys newest matching zip from /mnt/documents
#   ./scripts/deploy-netlify.sh path/to/site.zip      # deploys a specific zip
#
# After deploy, runs scripts/verify-blog-heroes.mjs against https://weddings.io.

set -euo pipefail

ZIP_GLOB="weddings-io-site-as-is-plus-blog-ecosystem-updates_v*.zip"
ZIP_DIRS=("/mnt/documents" "$HOME/Downloads" "$PWD")
WORKDIR="$(mktemp -d -t netlify-deploy.XXXXXX)"
trap 'rm -rf "$WORKDIR"' EXIT

# --- 1. Load NETLIFY_SITE_ID from .env.deploy if present
if [ -f "./.env.deploy" ]; then
  # shellcheck disable=SC1091
  set -a; . ./.env.deploy; set +a
fi

if [ -z "${NETLIFY_SITE_ID:-}" ]; then
  echo "❌ NETLIFY_SITE_ID is not set."
  echo "   Find it at: Netlify → your site → Site settings → Site information → API ID"
  echo "   Then either:"
  echo "     export NETLIFY_SITE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  echo "   or create ./.env.deploy with:"
  echo "     NETLIFY_SITE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  exit 1
fi

# --- 2. Verify netlify-cli is installed
if ! command -v netlify >/dev/null 2>&1; then
  echo "❌ netlify-cli not found. Install with:  npm i -g netlify-cli"
  exit 1
fi

# --- 3. Locate the zip (CLI arg wins, otherwise newest match)
ZIP="${1:-}"
if [ -z "$ZIP" ]; then
  for d in "${ZIP_DIRS[@]}"; do
    [ -d "$d" ] || continue
    candidate=$(ls -1t "$d"/$ZIP_GLOB 2>/dev/null | head -n1 || true)
    if [ -n "$candidate" ]; then ZIP="$candidate"; break; fi
  done
fi

if [ -z "$ZIP" ] || [ ! -f "$ZIP" ]; then
  echo "❌ Could not find a deploy zip matching: $ZIP_GLOB"
  echo "   Searched: ${ZIP_DIRS[*]}"
  echo "   Pass a path explicitly:  ./scripts/deploy-netlify.sh /path/to/site.zip"
  exit 1
fi

echo "📦 Deploying: $ZIP"
echo "🎯 Site ID:   $NETLIFY_SITE_ID"

# --- 4. Unzip into a clean dir
unzip -q -o "$ZIP" -d "$WORKDIR/site"

# Some zips contain a top-level folder; auto-detect the publish dir
PUB_DIR="$WORKDIR/site"
if [ ! -f "$PUB_DIR/index.html" ]; then
  inner=$(find "$PUB_DIR" -maxdepth 2 -type f -name index.html | head -n1 || true)
  if [ -n "$inner" ]; then PUB_DIR="$(dirname "$inner")"; fi
fi
echo "📁 Publish dir: $PUB_DIR"

# --- 5. Deploy to production
netlify deploy \
  --dir="$PUB_DIR" \
  --site="$NETLIFY_SITE_ID" \
  --prod \
  --message="Deploy $(basename "$ZIP")"

# --- 6. Verify against weddings.io
if [ -f "scripts/verify-blog-heroes.mjs" ]; then
  echo ""
  echo "🔍 Verifying production…"
  node scripts/verify-blog-heroes.mjs https://weddings.io || {
    echo "⚠️  Verification reported failures — Netlify CDN may need ~30s to propagate. Re-run:"
    echo "    node scripts/verify-blog-heroes.mjs https://weddings.io"
    exit 1
  }
fi

echo "✅ Done."
