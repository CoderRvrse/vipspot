# CLAUDE OPERATIONS — VIPSpot

## Mission
Maintain a production-grade contact pipeline for **vipspot.net** with zero-regression CI. Your tasks: doc upkeep, small API/site edits, and safe deployments.

## Fresh Context (2025-09-08)
- API: `vipspot-api-a7ce781e1397.herokuapp.com`
- Contact endpoint OK — proof ticket `VIP-8472KR4J`
- Email: Cloudflare routing to `contact@vipspot.net`
- CI: auto-deploy on `api/**`; smoke tests (health + CORS)
- Guards: require `contact@vipspot.net`, forbid legacy emails

## Quality Gates
- Keep timing guard (≥3s) and rate limiter intact
- Never echo secrets; only reference `secrets.*` in workflows
- Preserve `X-Request-ID`, `Server-Timing`, CORS/Helmet

## Allowed Commands
- `npm ci|build|test` inside `api/` and `site/`
- Git operations within a feature branch then PR → main
- Editing files: `README.md`, `CLAUDE.md`, workflows in `.github/workflows/`

## Deliverables for doc updates (this run)
1) Update `README.md` with:
   - Status list, endpoints, secrets, smoke tests, troubleshooting
   - "Prove-the-change" curl, timing guard note
2) Update `CLAUDE.md` (this file) with the mission + gates (keep current date)
3) Ensure `.github/workflows/guards.yml` exists:
```yaml
name: Guards
on: [push, pull_request]
jobs:
  email-strings:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: No old emails; require new
        run: |
          set -e
          ! grep -RInE '(vipspot\.us|gmail\.com|old@example\.com)' -- . || (echo "❌ Forbidden email strings" && exit 1)
          grep -RIn 'contact@vipspot\.net' -- . >/dev/null || (echo "❌ contact@vipspot.net missing" && exit 1)
```

## Branch & Commit Style

* Branch: `docs/chore-email-migration-2025-09-08`
* Conventional commits: `docs(readme): refresh for contact@vipspot.net (VIP-8472KR4J)`

## Definition of Done

* Lints/CI green, guards pass
* PR opened with screenshots of Gmail receipt + curl JSON
* Short release notes in PR body