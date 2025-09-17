#!/usr/bin/env bash
set -euo pipefail
if grep -RInE "https?://(www\.)?linkedin\.com/" -- *.html css js components 2>/dev/null; then
  echo "❌ Found linkedin.com references. Remove them before merging."
  exit 1
fi
echo "✅ No linkedin.com references detected."