#!/bin/bash
set -e
cd "$(dirname "$0")/assets"

echo "=== Compressing logos (lossy WebP @85, max 800px) ==="
for f in clients/*.png logo.png; do
  out="${f%.png}.webp"
  ffmpeg -hide_banner -loglevel error -y -i "$f" \
    -vf "scale='min(800,iw)':-1" \
    -c:v libwebp -lossless 0 -quality 85 -compression_level 6 \
    -preset picture "$out"
  before=$(stat -c %s "$f")
  after=$(stat -c %s "$out")
  echo "  $f: $before -> $after bytes"
done

echo ""
echo "=== Compressing cases (lossy WebP @78, max 1200px) ==="
for f in case-*.jpg; do
  out="${f%.jpg}.webp"
  ffmpeg -hide_banner -loglevel error -y -i "$f" \
    -vf "scale='min(1200,iw)':-1" \
    -c:v libwebp -lossless 0 -quality 78 -compression_level 6 \
    -preset photo "$out"
  before=$(stat -c %s "$f")
  after=$(stat -c %s "$out")
  echo "  $f: $before -> $after bytes"
done

echo ""
echo "=== Total bytes ==="
echo "WebP:"
du -bc clients/*.webp logo.webp case-*.webp | tail -1
echo "Original:"
du -bc clients/*.png logo.png case-*.jpg | tail -1
