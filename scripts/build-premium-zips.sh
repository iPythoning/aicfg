#!/bin/bash
# Build premium stack zip archives for x402 server distribution
# Usage: bash scripts/build-premium-zips.sh

set -e

PREMIUM_DIR="$(dirname "$0")/../premium"
STACKS_DIR="$(dirname "$0")/../stacks"
mkdir -p "$STACKS_DIR"

echo "Building premium stack zips..."
for dir in "$PREMIUM_DIR"/*/; do
  name=$(basename "$dir")
  zipfile="$STACKS_DIR/${name}.zip"
  (cd "$PREMIUM_DIR" && zip -r "../stacks/${name}.zip" "$name/" -x "*.DS_Store")
  size=$(du -h "$zipfile" | cut -f1)
  echo "  ✓ $name.zip ($size)"
done

echo ""
echo "Done! Zip files in $STACKS_DIR/:"
ls -lh "$STACKS_DIR"/*.zip
