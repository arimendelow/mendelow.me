#!/usr/bin/env bash
# Deploys the current checkout to the noindex preview Worker
# (https://mendelow-me-preview.mendelow-studio.workers.dev). The build
# regenerates the social card and checks the share metadata first.
# Needs `npx wrangler login` on the Mendelow Studio Cloudflare account.
set -euo pipefail
cd "$(dirname "$0")/.."
WORK="$(mktemp -d)"
node scripts/build-site.mjs "$WORK/public" --preview
cat > "$WORK/wrangler.jsonc" <<'JSON'
{
  "name": "mendelow-me-preview",
  "compatibility_date": "2026-10-01",
  "assets": { "directory": "./public", "not_found_handling": "404-page" }
}
JSON
(cd "$WORK" && npx -y wrangler@4 deploy)
echo "deployed $(git rev-parse --short HEAD) from $WORK"
