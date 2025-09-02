# scripts/fresh-reset.ps1
param(
  [string]$RepoUrl = "https://github.com/CoderRvrse/vipspot.git",
  [string]$CNAME   = "vipspot.net"
)

# 1) Backup the remote (bare mirror clone in case you ever need history)
$bk = "vipspot-remote-backup-$(Get-Date -Format yyyyMMdd-HHmmss).git"
git clone --mirror $RepoUrl $bk

# 2) Ensure minimal hygiene files exist
New-Item -Force -ItemType Directory ".github/workflows" | Out-Null
@"
# dependencies
node_modules/
# builds
dist/
_site/
# OS/IDE
.DS_Store
Thumbs.db
.vscode/
"@ | Set-Content -NoNewline ".gitignore"

# Pages workflow
@"
name: Deploy VIPSpot to GitHub Pages
on:
  push:
    branches: [ main ]
permissions: { contents: read, pages: write, id-token: write }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci || npm i
      - run: npm run build:css
      - name: Prepare static site
        run: |
          mkdir _site
          cp -r vipspot/* _site/
          echo $env:CNAME > _site/CNAME
      - uses: actions/upload-pages-artifact@v3
        with: { path: _site }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
"@ | Set-Content ".github/workflows/pages.yml"

# Verify workflow (blocks bad PRs)
@"
name: Verify VIPSpot
on:
  pull_request:
    branches: [ main ]
jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci || npm i
      - run: npm run build:css
      - run: node vipspot/server.js & echo $! > server.pid
      - run: |
          for i in {1..40}; do curl -fsS http://localhost:8000 >/dev/null && break; sleep 0.5; done
      - run: node scripts/prove-local.mjs
      - if: always()
        run: kill $(cat server.pid) || true
"@ | Set-Content ".github/workflows/verify.yml"

# 3) Nuke local git & start fresh
if (Test-Path .git) { Remove-Item -Recurse -Force .git }
git init
git branch -m main
git add -A
git commit -m "feat: VIPSpot 2025 fresh start (clean history)"
git remote add origin $RepoUrl
git push -u --force origin main

Write-Host "✅ Fresh push done. Check Actions → pages deploy."