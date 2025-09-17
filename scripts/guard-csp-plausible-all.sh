#!/usr/bin/env bash
set -euo pipefail
shopt -s nullglob
status=0
while IFS= read -r -d '' f; do
  if grep -q 'plausible.io/js/script.js' "$f"; then
    if ! grep -q '<meta http-equiv="Content-Security-Policy"' "$f"; then
      echo "❌ [$f] CSP meta missing while Plausible tag present"; status=1; continue
    fi
    if ! grep -qi "script-src[^>]*plausible\.io" "$f"; then
      echo "❌ [$f] CSP missing plausible.io in script-src"; status=1
    fi
    if ! grep -qi "connect-src[^>]*plausible\.io" "$f"; then
      echo "❌ [$f] CSP missing plausible.io in connect-src"; status=1
    fi
  fi
done < <(find . -name '*.html' -print0)
[ $status -eq 0 ] && echo "✅ CSP/Plausible alignment OK across pages"
exit $status