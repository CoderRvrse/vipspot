# CLAUDE.md — Operator Playbook for VIPSpot

This document teaches your AI pair (Claude/LLM) how to operate the repo with production rigor.

## Repo Map (short)
```
.
├── .claude/
│   ├── prompts/
│   └── settings.local.json
├── .github/
│   ├── workflows/
│   │   ├── ci-pages.yml
│   │   ├── deploy-api.yml
│   │   ├── guards.yml
│   │   └── release.yml
│   └── CODEOWNERS
├── api/
│   ├── index.js
│   ├── package.json
│   └── package-lock.json
├── assets/
├── css/
├── js/
├── scripts/
├── site/
├── index.html
├── package.json
├── README.md
└── CHANGELOG.md
```

## Golden Rules
- **Never echo secrets** (API keys, tokens). Redact with `***`.
- Prefer **surgical edits** + **idempotent scripts**.
- Keep guardrails up to date: email policy + Featured Pens link verification (+ UTM).
- Use **squash merges** for clean history unless directed otherwise.

## Common Prompts (ready to paste)

### 1) Update a Featured Pen link safely
- Scripted, block-scoped update + tests:
```bash
node scripts/update-featured-pen-link.mjs "3D\\s*Card\\s*Hover" "https://codepen.io/CoderRvrse/pen/VYvNzzN?utm_source=vipspot&utm_medium=featured_pens&utm_campaign=portfolio"
npm run test:links && npm run test:branding && ./scripts/smoke-grep.sh
```

### 2) Enforce UTM on CodePen links in Featured Pens
```bash
node scripts/add-utm-to-codepen.mjs
npm run test:branding
```

### 3) Prove canonical links + placeholders
```bash
npm run test:links
npm run test:no-placeholders   # if present
```

### 4) Merge + tag + verify (Pages deploy on main)
```bash
gh pr merge <NUM> --squash --delete-branch
git checkout main && git pull --ff-only
npm ci && npm run test:links && npm run test:branding && ./scripts/smoke-grep.sh
```

### 5) New CodePen Demo: Rocket Back-to-Top
- 🚀 **[Rocket Back-to-Top](https://codepen.io/CoderRvrse/pen/QwjXGom?utm_source=github&utm_medium=readme&utm_campaign=featured_pen_back_to_top)** — Production-grade component with neon progress ring

## Commit & Branch Strategy
- Branch: `feat/`, `fix/`, `docs/`, `ci/`, `chore/` + date suffix.
- Conventional commits; examples:
  - `feat(site): add neon button samples`
  - `fix(api): tighten CORS to vipspot.net (VIP-####)`
  - `ci(guards): enforce Featured Pens UTM`
  - `docs: refresh README/CLAUDE with architecture diagram`

## Guards Overview
- **email-strings:** forbids legacy domains; requires `contact@vipspot.net` in the codebase
- **featured-pen-links:** 3D + Matrix cards must use **canonical CodePen** base URLs and include **UTM**
- Guard failures: reproduce locally with `npm run test:links`, `npm run test:branding`, `./scripts/smoke-grep.sh`

## API Cheats
- Health: `https://vipspot-api-a7ce781e1397.herokuapp.com/healthz`
- Contact curl:
```bash
TIMESTAMP=$(($(date +%s) - 5))000
curl -sS -X POST https://vipspot-api-a7ce781e1397.herokuapp.com/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://vipspot.net" \
  -H "X-Request-ID: test-$(date +%s)" \
  -d '{"name":"Routing Test","email":"visitor@example.com","message":"Hello from VIPSpot!","timestamp":'${TIMESTAMP}'}'
```

## Quality Gates
- Keep timing guard (≥3s) and rate limiter intact
- Never echo secrets; only reference `secrets.*` in workflows  
- Preserve `X-Request-ID`, `Server-Timing`, CORS/Helmet
- All PRs require guards to pass + 1 approval from CODEOWNERS

## Environment & Deployment
- **Heroku API:** auto-deploys on `api/**` changes to main
- **GitHub Pages:** auto-deploys site on main branch push
- **Secrets:** HEROKU_API_KEY, HEROKU_EMAIL, RESEND_API_KEY (never commit)
- **Email routing:** Cloudflare forwards contact@vipspot.net → Gmail

## Featured Pens UTM Requirements
All CodePen links in Featured Pens section MUST include:
- Base URL: canonical CodePen URL (pen ID only)
- UTM params: `?utm_source=vipspot&utm_medium=featured_pens&utm_campaign=portfolio`

Example:
- ✅ `https://codepen.io/CoderRvrse/pen/VYvNzzN?utm_source=vipspot&utm_medium=featured_pens&utm_campaign=portfolio`
- ❌ `https://codepen.io/CoderRvrse/pen/VYvNzzN` (missing UTM)
- ❌ `https://codepen.io/CoderRvrse/full/VYvNzzN` (non-canonical)

## Guard Failure Playbook
1. **Email strings failure:** Search for forbidden domains:
   ```bash
   grep -RInE '(vipspot\.us|gmail\.com|old@example\.com)' -- .
   ```
   Replace with `contact@vipspot.net`

2. **Featured Pens links failure:** Run link tests locally:
   ```bash
   npm run test:links
   npm run test:branding
   ```
   Fix canonical URLs and add missing UTM parameters

3. **Smoke grep failure:** Check for placeholders:
   ```bash
   ./scripts/smoke-grep.sh
   ```
   Remove YYYYY, ZZZZZ placeholders from HTML

## FAQ
- **Why Pages deploy not on PR?** We deploy only on main. PRs run guards; merge triggers Pages.
- **Where are env vars?** See README + `.env.example`. Never commit real secrets.
- **Matrix/3D links changed?** Use the updater script and re-run tests.
- **CI failing on Unicode?** Check JS files for smart quotes, em-dashes, use ASCII equivalents.
- **RAF handle errors?** Use `rafId` not `animationId`, ensure `VIPSpot._raf` API is present.

## Release Management

### Automated Releases
- **Trigger**: Merges to main with `feat:`, `fix:`, or `docs:` commits
- **Versioning**: Date-based (vYYYY.MM.DD-type)
- **Types**: major, feature (-feat), fix (-fix), docs (-docs)

### Manual Release
```bash
# Trigger manual release
gh workflow run "Release Management" -f release_type=feature

# Check release status
gh run list --workflow="Release Management" --limit 3
```

### Release Types
- **feat!:** or **BREAKING CHANGE** → vYYYY.MM.DD (major)
- **feat:** → vYYYY.MM.DD-feat (feature)
- **fix:** → vYYYY.MM.DD-fix (bug fix)  
- **docs:** → vYYYY.MM.DD-docs (documentation)

### CHANGELOG Updates
- Automatically maintained via GitHub Actions
- Follows [Keep a Changelog](https://keepachangelog.com/) format
- Links to release comparisons and tags

### Release Notes
- Generated from conventional commit messages
- Grouped by type (Features, Bug Fixes, Documentation, etc.)
- Includes links to live site and documentation

## Do Not Commit
- Secrets/tokens (.env with real values)
- node_modules, dist/build artifacts  
- Private PII
- Smart quotes/Unicode in JS files
- Legacy email addresses (redacted legacy domains) are disallowed by guards.
- Non-canonical CodePen URLs without UTM

## Mission
Maintain a production-grade contact pipeline for **vipspot.net** with zero-regression CI. Your tasks: doc upkeep, small API/site edits, and safe deployments.

— End of operator playbook —