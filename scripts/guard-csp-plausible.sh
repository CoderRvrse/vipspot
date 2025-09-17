#!/usr/bin/env bash
set -euo pipefail
# Only run if plausible tag exists
if grep -qR 'plausible.io/js/script.js' -- index.html 2>/dev/null; then
  # Check CSP meta contains required directives
  if ! grep -q '<meta[^>]*Content-Security-Policy' index.html; then
    echo "❌ CSP meta not found but Plausible tag is present"
    exit 1
  fi
  
  # Check script-src/script-src-elem and connect-src in the CSP content
  CSP_CONTENT=$(grep '<meta[^>]*Content-Security-Policy' index.html)
  echo "$CSP_CONTENT" | grep -q "script-src[^;]*plausible\.io" || { echo "❌ CSP missing plausible.io in script-src"; exit 1; }
  echo "$CSP_CONTENT" | grep -q "script-src-elem[^;]*plausible\.io" || { echo "❌ CSP missing plausible.io in script-src-elem"; exit 1; }
  echo "$CSP_CONTENT" | grep -q "connect-src[^;]*plausible\.io" || { echo "❌ CSP missing plausible.io in connect-src"; exit 1; }
  echo "✅ CSP allows Plausible (script + connect)."
else
  echo "ℹ️ Plausible tag not present; skipping CSP guard."
fi