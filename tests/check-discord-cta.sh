#!/usr/bin/env bash
set -euo pipefail
grep -RIn 'id="vip-discord"' -- *.html || { echo "❌ Discord CTA not found"; exit 2; }
grep -RIn 'discord\.gg/FJxrnAcawn' -- *.html || { echo "❌ Discord URL missing"; exit 2; }
echo "✅ Discord CTA present."