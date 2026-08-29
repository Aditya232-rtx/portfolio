#!/usr/bin/env bash
#
# Turn a raw screen recording into a web-ready loop for the projects marquee.
#
#   ./scripts/encode-reel.sh <input> <slug> <start-seconds> [duration-seconds]
#
# Produces, in public/projects/:
#   <slug>.mp4   h264, muted, faststart  — the card + zoom loop
#   <slug>.webm  vp9, muted              — smaller where supported
#   <slug>.jpg   poster frame            — shown before the video plays
#
# Muted because the cards autoplay on hover; browsers block audible autoplay
# and a portfolio should never make noise unprompted.

set -euo pipefail

if [ $# -lt 3 ]; then
  echo "usage: $0 <input> <slug> <start-seconds> [duration-seconds]" >&2
  exit 1
fi

INPUT="$1"
SLUG="$2"
START="$3"
DURATION="${4:-12}"

OUT_DIR="$(cd "$(dirname "$0")/.." && pwd)/public/projects"
mkdir -p "$OUT_DIR"

# Cap the long edge at 1280 and force even dimensions (h264 requires them).
SCALE="scale='min(1280,iw)':-2"

# Optional: trim pixels off the scaled frame to remove recording toolbars
# (bottom) or browser chrome (top).
#   CROP_BOTTOM=80 CROP_TOP=34 ./scripts/encode-reel.sh ...
CROP_BOTTOM="${CROP_BOTTOM:-0}"
CROP_TOP="${CROP_TOP:-0}"
TRIM=$((CROP_TOP + CROP_BOTTOM))
if [ "$TRIM" -gt 0 ]; then
  SCALE="${SCALE},crop=iw:ih-${TRIM}:0:${CROP_TOP}"
fi

echo "→ ${SLUG}: ${DURATION}s from ${START}s"

# 25fps is plenty for UI capture and saves ~15% over 30. `veryslow` buys real
# compression at the same CRF — worth it since these encode once and ship
# forever. No -tune: `stillimage` inflated these files noticeably without a
# visible gain on motion-heavy screen capture.
FPS="${FPS:-25}"
CRF="${CRF:-30}"

ffmpeg -v error -ss "$START" -i "$INPUT" -t "$DURATION" \
  -an -vf "$SCALE,fps=${FPS}" \
  -c:v libx264 -profile:v high -pix_fmt yuv420p \
  -crf "$CRF" -preset veryslow \
  -g 50 -movflags +faststart \
  "$OUT_DIR/${SLUG}.mp4" -y

# VP9 is meaningfully more efficient than h264; cpu-used 1 trades encode time
# for a smaller file at the same visual quality.
ffmpeg -v error -ss "$START" -i "$INPUT" -t "$DURATION" \
  -an -vf "$SCALE,fps=${FPS}" \
  -c:v libvpx-vp9 -crf $((CRF + 6)) -b:v 0 -row-mt 1 \
  -deadline good -cpu-used 1 \
  "$OUT_DIR/${SLUG}.webm" -y

ffmpeg -v error -ss "$START" -i "$INPUT" -frames:v 1 \
  -vf "$SCALE" -q:v 5 "$OUT_DIR/${SLUG}.jpg" -y

# VP9 usually wins, but on dark UI with dense text it can come out heavier than
# h264. Shipping a larger "optimised" file would be worse than not shipping it,
# so keep the WebM only when it is meaningfully smaller.
MP4_BYTES=$(wc -c < "$OUT_DIR/${SLUG}.mp4")
WEBM_BYTES=$(wc -c < "$OUT_DIR/${SLUG}.webm")
if [ "$WEBM_BYTES" -ge $((MP4_BYTES * 90 / 100)) ]; then
  rm -f "$OUT_DIR/${SLUG}.webm"
  echo "   (webm dropped — not smaller than mp4)"
fi

for f in "${SLUG}.mp4" "${SLUG}.webm" "${SLUG}.jpg"; do
  [ -f "$OUT_DIR/$f" ] && printf '   %-18s %s\n' "$f" "$(du -h "$OUT_DIR/$f" | cut -f1)"
done
exit 0
