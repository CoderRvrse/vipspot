#!/usr/bin/env bash
set -euo pipefail
URL='href="https://discord.gg/FJxrnAcawn?utm_source=vipspot&utm_medium=footer&utm_campaign=social_discord"'
violations=0
while IFS= read -r -d '' f; do
  if grep -q 'id="vip-discord"' "$f"; then
    if ! grep -q "$URL" "$f"; then
      echo "❌ UTM drift in $f"
      violations=1
    fi
  fi
done < <(find . -name "*.html" -print0)
[ $violations -eq 0 ] && echo "✅ Discord CTA URL exact across site."
exit $violations