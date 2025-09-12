# VIPSpot — Portfolio + Contact Pipeline

<div align="center">

[![Latest Release](https://img.shields.io/github/v/release/CoderRvrse/vipspot?label=Release&style=for-the-badge&color=00d4aa)](https://github.com/CoderRvrse/vipspot/releases/latest)
[![Release Date](https://img.shields.io/github/release-date/CoderRvrse/vipspot?label=Released&style=for-the-badge&color=blue)](https://github.com/CoderRvrse/vipspot/releases)
[![Build Status](https://img.shields.io/github/actions/workflow/status/CoderRvrse/vipspot/ci-pages.yml?branch=main&label=Build&style=for-the-badge)](https://github.com/CoderRvrse/vipspot/actions)
[![Live Site](https://img.shields.io/badge/Live_Site-vipspot.net-00d4aa?style=for-the-badge&logo=github-pages)](https://vipspot.net?utm_source=github&utm_medium=readme&utm_campaign=badge_click)

[![Documentation](https://img.shields.io/badge/Docs-GitHub_Pages-blue?style=for-the-badge&logo=gitbook)](https://coderrrvrse.github.io/vipspot/docs)
[![Test Coverage](https://img.shields.io/badge/Coverage-Ready-lightgrey?style=for-the-badge&logo=codecov)](https://codecov.io/gh/CoderRvrse/vipspot)
[![CodePen Views](https://img.shields.io/badge/CodePen-Featured_Pens-000000?style=for-the-badge&logo=codepen)](https://codepen.io/CoderRvrse?utm_source=github&utm_medium=readme&utm_campaign=profile_badge)
[![Contact](https://img.shields.io/badge/Contact-vipspot.net-00d4aa?style=for-the-badge&logo=gmail)](mailto:contact@vipspot.net?subject=GitHub%20Inquiry&utm_source=github&utm_medium=readme&utm_campaign=contact_badge)

</div>

**Status:** GREEN · proof ticket **VIP-8472KR4J** (Cloudflare → Gmail) · API **v17** on Heroku

VIPSpot is a fast, secure portfolio site with a hardened contact pipeline. The site runs on **GitHub Pages** with strict CSP; the **Node/Express API** on **Heroku** delivers dual emails (owner + visitor auto-reply) via **Resend**. CI enforces **zero-regression guardrails** for email migration and Featured Pens canonical links.

> 📊 **Analytics Ready**: All links include UTM tracking (`github/readme/*`) for comprehensive engagement analytics. Future integrations: GitHub Pages `/docs`, Codecov coverage, and CodePen view tracking.

<p align="center"><img alt="Featured Pens" src="assets/featured-pens.png" width="820"></p>

## Live Demo
- **Site:** https://vipspot.net
- **API health:** `https://vipspot-api-a7ce781e1397.herokuapp.com/healthz` → `{"ok":true}`
- **Featured Pens:** *(Click to track README engagement)*  
  - [🎨 3D Card Hover](https://codepen.io/CoderRvrse/pen/VYvNzzN?utm_source=github&utm_medium=readme&utm_campaign=featured_pen_3d_card&utm_content=demo_links) → Interactive hover effects with CSS transforms  
  - [🔮 Matrix Rain Effect](https://codepen.io/CoderRvrse/pen/azvxEZG?utm_source=github&utm_medium=readme&utm_campaign=featured_pen_matrix&utm_content=demo_links) → Animated background with digital rain

## Highlights
- ⚡ **PWA-style UX:** neon UI, matrix visuals, accessible components
- 🛡️ **Defense-in-depth:** Helmet, CORS whitelist, timing guard (≥3s), rate limit (1 req/30s), request correlation, Server-Timing
- 🧪 **Guards on PRs:** email-strings policy + Featured Pens canonical links (with UTM)
- 🚀 **Auto deploys:** GitHub Pages on push to `main`; Heroku API auto-deploys on `api/**`
- 🔒 **Branch protection:** PR required, required checks, CODEOWNERS, linear history

## Architecture
```
Browser (PWA)
  │  HTTPS + strict CSP
  ▼
GitHub Pages (https://vipspot.net)
  • Featured Pens (CodePen canonical + UTM)
  • Contact form (timing guard ≥3s)
  • Matrix background / UI glow
  ▼  fetch()
Cloudflare (DNS + Email Routing)
  • DNS → Pages
  • Email: contact@vipspot.net → Gmail
  ▼
Heroku API (vipspot-api-a7ce781e1397)
  • Express + Helmet + CORS
  • Rate limit: 1 req / 30s / IP
  • X-Request-ID + Server-Timing
  ▼
Resend (Email)
  • Owner notify + visitor auto-reply
  • From: VIPSpot <noreply@vipspot.net>
```

## Tech Stack
- **Site:** HTML/CSS/JS (GitHub Pages), CSP whitelist for API
- **API:** Node 20 / Express, Helmet, CORS, Morgan, express-rate-limit, Resend
- **CI/CD:** GitHub Actions (guards + Pages deploy), Heroku deploy (api/**)
- **Email:** Cloudflare routing to Gmail, Resend API for sending

## API Endpoints
- **GET /healthz** — health probe → `{"ok":true}`
- **POST /contact** — processes contact form + sends dual emails  
  **Body:** `{ name, email, message, timestamp }` (honeypot: `company`)  
  **Timing Guard:** `timestamp` must be ≥ 3s in the past  
  **Rate limit:** 1 req / 30s / IP

### Ready-to-run curl
```bash
TIMESTAMP=$(($(date +%s) - 5))000
curl -sS -X POST https://vipspot-api-a7ce781e1397.herokuapp.com/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://vipspot.net" \
  -H "X-Request-ID: test-$(date +%s)" \
  -d '{"name":"Routing Test","email":"visitor@example.com","message":"Hello from VIPSpot!","timestamp":'${TIMESTAMP}'}'
```

## Environment

| NAME             | Used In        | Purpose                     | Required | Default/Example |
|------------------|----------------|-----------------------------|---------:|-----------------|
| ALLOWED_ORIGINS  | api/index.js   | CORS whitelist              | No       | https://vipspot.net,https://www.vipspot.net,http://localhost:8000 |
| RESEND_API_KEY   | api/index.js   | Email provider auth         | Yes      | re_*** |
| CONTACT_TO       | api/index.js   | Owner destination email     | No       | contact@vipspot.net |
| CONTACT_FROM     | api/index.js   | Sender identity             | No       | VIPSpot <noreply@vipspot.net> |
| CONTACT_REPLY_TO | api/index.js   | Reply-To header             | No       | (visitor email or contact@vipspot.net) |
| COMPANY_NAME     | api/index.js   | Branding name               | No       | VIPSpot |
| BOOKING_URL      | api/index.js   | Contact/booking link        | No       | mailto:contact@vipspot.net |
| PORT             | api/index.js   | API port (local)            | No       | 8080 |
| HEROKU_API_KEY   | CI only        | Heroku deploy auth          | Yes      | *** |
| HEROKU_EMAIL     | CI only        | Heroku deploy identity      | Yes      | *** |

### .env.example
```dotenv
CONTACT_TO=contact@vipspot.net
CONTACT_FROM="VIPSpot <noreply@vipspot.net>"
CONTACT_REPLY_TO=contact@vipspot.net
RESEND_API_KEY=re_your_key_here
ALLOWED_ORIGINS=https://vipspot.net,https://www.vipspot.net,http://localhost:8000
COMPANY_NAME=VIPSpot
BOOKING_URL=mailto:contact@vipspot.net
```

## Local Development
```bash
# root
npm ci
npm run dev           # if defined (site dev)
# API
cd api && npm ci
npm run dev           # nodemon style task if defined
```

## CI/CD
- **PRs:** guards only (no deploy). Required checks:
  - `guards.yml / email-strings`
  - `guards.yml / Featured Pens canonical links`
- **Main:** deploys Pages; API auto-deploys on `api/**`
- **Releases:** automated tagging and changelog generation
  - Date-based versioning: `vYYYY.MM.DD-type`
  - Conventional commits trigger releases automatically
  - Professional release notes with grouped changes

## Security Posture
- **CSP:** site whitelists API endpoint in `connect-src` and `form-action`
- **CORS:** `https://vipspot.net`, `www`, and `localhost:8000`
- **Helmet headers** on API, CSP handled by site
- **Rate limiting:** 1/30s per IP per endpoint
- **Observability:** X-Request-ID, Server-Timing metrics

## Troubleshooting
- **CORS preflight:** OPTIONS /contact should 204  
- **Timing guard fails:** ensure `timestamp` ≥ 3s old  
- **Delivery issues:** check Resend API key + Cloudflare routing

## Contributing
- Branch naming: `feat/..-YYYY-MM-DD`, `fix/..-YYYY-MM-DD`, `docs/..-YYYY-MM-DD`  
- Conventional commits: `feat:`, `fix:`, `docs:`, `ci:`, `chore:`
- PRs require 1 approval (CODEOWNERS) + passing guards

---

© 2025 VIPSpot · Built by Rvrse™ · contact@vipspot.net