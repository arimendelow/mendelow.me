#!/usr/bin/env bash
# Regenerates every derived visual asset for mendelow.me from committed sources.
# Run from anywhere: scripts/build-assets.sh  (requires ImageMagick `magick`).
#
# Sources (committed to the repo):
#   public/assets/favicon-source.jpg     800x800 square headshot — the same crop used on LinkedIn
#   (public/assets/ari-portrait-wide.jpg is the social-card photo; scripts/build-site.mjs
#   generates the card itself on every deploy.)
#
# Outputs (all under public/assets/): favicon-16/32/48/512.png, favicon.png, favicon.ico,
#   and apple-touch-icon.png, plus the root public/favicon.ico; and the hero portrait's 600w and 800w sizes.
set -euo pipefail
cd "$(dirname "$0")/.."
A=public/assets

echo "» favicons (face-zoom of $A/favicon-source.jpg — the LinkedIn crop, tightened to the head so it reads at 16px)"
FSRC="$A/favicon-source.jpg"
FAV_TMP=.favicon-work
rm -rf "$FAV_TMP" && mkdir -p "$FAV_TMP"
# Tighten the 800x800 LinkedIn crop to the face so it stays recognizable at tab sizes.
magick "$FSRC" -crop 380x380+210+30 +repage "$FAV_TMP/face.png"
for s in 16 32 48 512; do
  magick "$FAV_TMP/face.png" -resize ${s}x${s}^ -gravity center -extent ${s}x${s} -strip "$A/favicon-${s}.png"
done
magick "$FAV_TMP/face.png" -resize 180x180^ -gravity center -extent 180x180 -strip "$A/apple-touch-icon.png"
cp "$A/favicon-512.png" "$A/favicon.png"        # generic sizes="any"
magick "$A/favicon-16.png" "$A/favicon-32.png" "$A/favicon-48.png" "$A/favicon.ico"
cp "$A/favicon.ico" public/favicon.ico          # root /favicon.ico (browsers request it by default)
rm -rf "$FAV_TMP"

echo "» hero portrait sizes (600w and 800w for phones and small screens; ari-portrait.jpg is the 1200w original)"
for w in 600 800; do
  magick "$A/ari-portrait.jpg" -resize ${w}x -quality 70 -strip "$A/ari-portrait-${w}.jpg"
done

echo "✓ assets rebuilt"
