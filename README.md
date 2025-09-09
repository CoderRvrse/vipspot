# VIPSpot — API + Site

Production-ready contact pipeline for **vipspot.net** with auto-deploys, rate limiting, timing guard, CORS/Helmet, and email routing via Cloudflare → Gmail.

## Status

[![Featured Pens](https://img.shields.io/badge/Featured%20Pens-passing-brightgreen)](https://github.com/CoderRvrse/vipspot/actions)

## Current Status (2025-09-08)
- ✅ **API live:** `vipspot-api-a7ce781e1397.herokuapp.com`
- ✅ **Contact endpoint working** (Proof: ticket `VIP-8472KR4J`)
- ✅ **Email routing:** `contact@vipspot.net` (Cloudflare → Gmail)
- ✅ **CORS fix & security headers** enabled
- ✅ **CI/CD:** GitHub Actions auto-deploys on `api/**` changes
- ✅ **Smoke tests in CI:** Health + CORS
- ✅ **Guards:** CI blocks forbidden legacy emails and requires `contact@vipspot.net`

---

## Monorepo layout
```
api/        # Express/Node API for contact form
js/         # Frontend JavaScript (vipspot.net)
css/        # Stylesheets and assets
.github/    # Workflows: deploy + guards
```

## Environment (Heroku)
Required config vars:
- `CONTACT_TO=contact@vipspot.net`
- `CONTACT_FROM=VIPSpot <noreply@vipspot.net>`
- `CONTACT_REPLY_TO=contact@vipspot.net`
- `RESEND_API_KEY=re_*********`
- `ALLOWED_ORIGINS=https://vipspot.net,https://www.vipspot.net,http://localhost:8000`
- Other app secrets as already configured

> Rotate Heroku API keys via Heroku Account → API Key if ever exposed.

---

## CI/CD (GitHub Actions)
- **Deploy API to Heroku:** triggers on pushes to `api/**`.
- **Guards:** fail the build if legacy emails are present, and require `contact@vipspot.net`.

Secrets (repo → Settings → *Secrets and variables* → *Actions*):
- `HEROKU_API_KEY` (never echo)
- `HEROKU_EMAIL`

---

## Prove-the-change (Smoke Test)
**Timing guard:** backend expects `timestamp` ≥ 3s in the past to thwart bots.

```bash
TIMESTAMP=$(($(date +%s) - 5))000
curl -sS -X POST https://vipspot-api-a7ce781e1397.herokuapp.com/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://vipspot.net" \
  -H "X-Request-ID: test-$(date +%s)" \
  -d "{\"name\":\"Routing Test\",\"email\":\"visitor@example.com\",\"message\":\"Hello from VIPSpot!\",\"timestamp\":$TIMESTAMP}"
# → {"ok":true,"ticketId":"VIP-..."} and owner + visitor emails
```

Health & CORS:

```bash
curl -fsS https://vipspot-api-a7ce781e1397.herokuapp.com/healthz
curl -fsSI -X OPTIONS https://vipspot-api-a7ce781e1397.herokuapp.com/contact \
  -H "Origin: https://vipspot.net" \
  -H "Access-Control-Request-Headers: content-type, x-request-id" | grep -i "access-control-allow-"
```

---

## Local dev

```bash
# API
cd api && npm ci && npm start

# Site
npm run dev  # Python HTTP server on port 8000
```

---

## Observability

* **X-Request-ID** headers added; include in logs for correlation.
* **Server-Timing** exposes validation/mail timings.
* **Debug mode** available via `?debug=1` URL parameter or localStorage toggle.

---

## Troubleshooting

* **429/"Too fast"** → timestamp not ≥3s old or rate limit hit (1 req/30s).
* **CORS errors** → ensure Origin header matches allowed origins.
* **No owner email** → verify Cloudflare routing for `contact@vipspot.net`.
* **CI fails on guards** → find/remove legacy emails (`grep -RInE 'vipspot\\.us|gmail\\.com|old@example\\.com' .`).

---

## Changelog

* **2025-09-08** CORS fix deployed (v17), auto-deploy workflow, correlation tracking, bulletproof error handling. Proof: `VIP-8472KR4J`.
* **2025-09-04** Email migration → `contact@vipspot.net`, deploy workflow, smoke tests. Proof: `VIP-4203TN8G`.