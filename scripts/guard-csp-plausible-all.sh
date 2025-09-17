#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob
status=0
while IFS= read -r -d '' f; do
  if grep -q 'plausible.io/js/script.js' "$f"; then
    if ! grep -q '<meta http-equiv="Content-Security-Policy"' "$f"; then
      echo "❌ [$f] CSP meta missing while Plausible tag present"; status=1; continue
    fi
    CSP_CONTENT=$(rg -z -o '<meta[^>]*http-equiv=["'"']Content-Security-Policy["'"'][^>]*>' "$f" | tr -d '\0' | tr '\n' ' ')
    if [ -z "$CSP_CONTENT" ]; then
      echo "❌ [$f] Unable to extract CSP meta content"; status=1; continue
    fi
    if ! echo "$CSP_CONTENT" | grep -qi "script-src[^;]*plausible\.io"; then
      echo "❌ [$f] CSP missing plausible.io in script-src"; status=1
    fi
    if ! echo "$CSP_CONTENT" | grep -qi "connect-src[^;]*plausible\.io"; then
      echo "❌ [$f] CSP missing plausible.io in connect-src"; status=1
    fi
  fi
done < <(find . -name '*.html' -print0)
[ $status -eq 0 ] && echo "✅ CSP/Plausible alignment OK across pages"
exit $status