#!/usr/bin/env bash
set -euo pipefail
URL="https://codepen.io/CoderRvrse/pen/VYvNzzN"
echo "Smoke: searching for canonical URL → $URL"
if grep -RIn "$URL" -- *.html 2>/dev/null; then
  echo "✅ Smoke grep passed"
else
  echo "URL not found in HTML files"; exit 2;
fi