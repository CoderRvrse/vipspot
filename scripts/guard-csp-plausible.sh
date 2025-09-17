#!/usr/bin/env bash
set -euo pipefail
# Only run if plausible tag exists
if grep -qR 'plausible.io/js/script.js' -- index.html 2>/dev/null; then
  # Check CSP meta contains required directives
  if ! grep -q '<meta[^>]*Content-Security-Policy' index.html; then
    echo "❌ CSP meta not found but Plausible tag is present"
    exit 1
  fi

  # Check script-src and connect-src in the CSP content
  CSP_CONTENT=$(rg -z -o '<meta[^>]*http-equiv=["'"']Content-Security-Policy["'"'][^>]*>' index.html | tr -d '\0' | tr '\n' ' ')
  if [ -z "$CSP_CONTENT" ]; then
    echo "❌ Unable to extract CSP meta content"
    exit 1
  fi

  echo "$CSP_CONTENT" | grep -q "script-src[^;]*plausible\.io" || { echo "❌ CSP missing plausible.io in script-src"; exit 1; }
  echo "$CSP_CONTENT" | grep -q "connect-src[^;]*plausible\.io" || { echo "❌ CSP missing plausible.io in connect-src"; exit 1; }
  echo "✅ CSP allows Plausible (script + connect)."
else
  echo "ℹ️ Plausible tag not present; skipping CSP guard."
fi