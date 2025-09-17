#!/usr/bin/env bash
set -euo pipefail
miss=0
# Only check main site HTML files, exclude coverage reports, node_modules, and components
while IFS= read -r -d '' f; do
  # Skip coverage, node_modules, and component files
  if [[ "$f" == *"/coverage/"* ]] || [[ "$f" == *"/node_modules/"* ]] || [[ "$f" == *"/components/"* ]]; then
    continue
  fi
  grep -q 'analytics-hooks\.js' "$f" || { echo "❌ [$f] missing analytics-hooks.js"; miss=1; }
done < <(find . -name '*.html' -print0)
[ $miss -eq 0 ] && echo "✅ All site HTML pages reference analytics-hooks.js"
exit $miss