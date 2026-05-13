#!/usr/bin/env bash
# One-command deploy + verify for weddings.io.
#
# Deploys /mnt/documents/weddings-io-netlify_v8.zip (or whatever you pass as $1)
# to Netlify production, then runs scripts/verify-blog-heroes.mjs against
# https://weddings.io.
#
# Prereqs (one-time):
#   1. npm i -g netlify-cli
#   2. netlify login
#   3. echo "NETLIFY_SITE_ID=<your-site-api-id>" > .env.deploy
#      (find at: Netlify → Site settings → Site information → API ID)
#
# Usage:
#   ./scripts/deploy-and-verify.sh
#   ./scripts/deploy-and-verify.sh /path/to/another.zip

set -euo pipefail

ZIP="${1:-/mnt/documents/weddings-io-netlify_v8.zip}"
BASE_URL="${BASE_URL:-https://weddings.io}"
WORKDIR="$(mktemp -d -t netlify-deploy.XXXXXX)"
trap 'rm -rf "$WORKDIR"' EXIT

# 1. Load NETLIFY_SITE_ID
if [ -f "./.env.deploy" ]; then
  set -a; . ./.env.deploy; set +a
fi
if [ -z "${NETLIFY_SITE_ID:-}" ]; then
  echo "❌ NETLIFY_SITE_ID is not set."
  echo "   Create ./.env.deploy with: NETLIFY_SITE_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  echo "   Find it at: Netlify → Site settings → Site information → API ID"
  exit 1
fi

# 2. Check tools
command -v netlify >/dev/null 2>&1 || { echo "❌ netlify-cli missing. Run: npm i -g netlify-cli"; exit 1; }
command -v unzip   >/dev/null 2>&1 || { echo "❌ unzip is required"; exit 1; }
command -v node    >/dev/null 2>&1 || { echo "❌ node is required"; exit 1; }

# 3. Locate zip
[ -f "$ZIP" ] || { echo "❌ Zip not found: $ZIP"; exit 1; }
echo "📦 Deploying: $ZIP"
echo "🎯 Site ID:   $NETLIFY_SITE_ID"
echo "🌐 Verify:    $BASE_URL"

# 4. Unzip + auto-detect publish dir
unzip -q -o "$ZIP" -d "$WORKDIR/site"
PUB_DIR="$WORKDIR/site"
if [ ! -f "$PUB_DIR/index.html" ]; then
  inner=$(find "$PUB_DIR" -maxdepth 3 -type f -name index.html | head -n1 || true)
  [ -n "$inner" ] && PUB_DIR="$(dirname "$inner")"
fi
echo "📁 Publish dir: $PUB_DIR"

# 5. Deploy to production
netlify deploy \
  --dir="$PUB_DIR" \
  --site="$NETLIFY_SITE_ID" \
  --prod \
  --message="Deploy $(basename "$ZIP")"

# 6. Wait briefly for CDN, then verify
echo ""
echo "⏳ Waiting 10s for CDN propagation…"
sleep 10

echo "🔍 Running verify-blog-heroes against $BASE_URL"
node scripts/verify-blog-heroes.mjs "$BASE_URL" || {
  echo ""
  echo "⚠️  Verify reported failures. Re-run after another ~30s:"
  echo "    node scripts/verify-blog-heroes.mjs $BASE_URL"
  exit 1
}

echo ""
echo "✅ Deploy + verify complete."
