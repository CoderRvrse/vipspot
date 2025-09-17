#!/usr/bin/env bash
set -euo pipefail
if grep -RIn 'analytics-hooks\.js' -- *.html 2>/dev/null; then
  echo "✅ analytics-hooks referenced"
else
  echo "❌ analytics-hooks.js not referenced in any HTML"
  exit 1
fi