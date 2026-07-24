#!/usr/bin/env bash
# Regenerates every derived visual asset for mendelow.me from committed sources.
# Run from anywhere: scripts/build-assets.sh  (requires ImageMagick `magick`).
#
# Sources (committed to the repo):
#   assets/favicon-source.jpg     800x800 square headshot — the same crop used on LinkedIn
#   assets/ari-portrait-wide.jpg  1600x2400 portrait — the social-card photo
#
# Outputs (all under assets/): favicon-16/32/48/512.png, favicon.png, favicon.ico,
#   apple-touch-icon.png, and social-card.png (1200x630 Open Graph / Twitter card).
set -euo pipefail
cd "$(dirname "$0")/.."
A=assets

SERIF="/System/Library/Fonts/Supplemental/Georgia.ttf"
SERIF_B="/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
SERIF_I="/System/Library/Fonts/Supplemental/Georgia Italic.ttf"

# Brand palette (mirrors styles.css :root)
BG='#f6f2ea'; INK='#211f1b'; ACCENT='#a8431f'; LEDE='#37342d'; FOOT='#6f6659'; LINE='#e2dccf'

echo "» favicons (face-zoom of $A/favicon-source.jpg — the LinkedIn crop, tightened to the head so it reads at 16px)"
FSRC="$A/favicon-source.jpg"
FAV_TMP=$(mktemp -d)
# Tighten the 800x800 LinkedIn crop to the face so it stays recognizable at tab sizes.
magick "$FSRC" -crop 380x380+210+30 +repage "$FAV_TMP/face.png"
for s in 16 32 48 512; do
  magick "$FAV_TMP/face.png" -resize ${s}x${s}^ -gravity center -extent ${s}x${s} -strip "$A/favicon-${s}.png"
done
magick "$FAV_TMP/face.png" -resize 180x180^ -gravity center -extent 180x180 -strip "$A/apple-touch-icon.png"
cp "$A/favicon-512.png" "$A/favicon.png"        # generic sizes="any"
magick "$A/favicon-16.png" "$A/favicon-32.png" "$A/favicon-48.png" "$A/favicon.ico"
cp "$A/favicon.ico" favicon.ico                 # root /favicon.ico (browsers request it by default)
rm -rf "$FAV_TMP"

echo "» social card (1200x630)"
W=1200; H=630; PW=470; PANEL=$((W-PW))
CARD_TMP=$(mktemp -d)

# Right: photo cropped to fill PWxH, face kept high in frame
magick "$A/ari-portrait-wide.jpg" -resize ${PW}x^ -gravity north -crop ${PW}x${H}+0+30 +repage "$CARD_TMP/photo.png"

# Text blocks (rendered separately so nothing can clip). No greeting eyebrow — a share
# card leads with the name; the "Hello!!" hero device only works fused into "…I'm Ari."
# H1 auto-fit: probe at 100pt, then scale down so the rendered width never exceeds the text budget.
H1_MAXW=600
probe_w=$(magick -background none -font "$SERIF_B" -pointsize 100 label:'Ari Mendelow' -format '%w' info:)
h1_ps=$(python3 -c "print(min(100, int(100*$H1_MAXW/$probe_w)))")
magick -background none -fill "$INK"    -font "$SERIF_B" -pointsize "$h1_ps" label:'Ari Mendelow'  "$CARD_TMP/h1.png"

magick -background none -fill "$LEDE"   -font "$SERIF"   -pointsize 40 -size 600x \
       caption:$'Building products for\nhumans + agents.'                                          "$CARD_TMP/lede.png"
magick -background none -fill "$FOOT"   -font "$SERIF_I" -pointsize 30 label:'mendelow.me'          "$CARD_TMP/foot.png"

echo "   H1 fitted to ${h1_ps}pt, width $(magick identify -format '%w' "$CARD_TMP/h1.png")px (budget ${H1_MAXW})"

# Compose: cream canvas, photo on right, thin brand divider, name + tagline centered on left
magick -size ${W}x${H} xc:"$BG" \
  \( "$CARD_TMP/photo.png" \) -gravity east -compose over -composite \
  -fill "$LINE" -draw "rectangle $((PANEL-2)),0 ${PANEL},${H}" \
  "$CARD_TMP/h1.png"   -gravity northwest -geometry +76+205 -composite \
  "$CARD_TMP/lede.png" -gravity northwest -geometry +80+340 -composite \
  "$CARD_TMP/foot.png" -gravity southwest -geometry +80+70  -composite \
  -strip "$A/social-card.png"

rm -rf "$CARD_TMP"
echo "✓ assets rebuilt"
