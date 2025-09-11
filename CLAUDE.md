# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

VIPSpot is a full-stack developer portfolio and contact management system with two main components:

- **Frontend (Static Site)**: Portfolio website at `vipspot.net` with interactive elements
- **Backend (API)**: Express.js contact form API deployed on Heroku at `vipspot-api-a7ce781e1397.herokuapp.com`

### Monorepo Structure
```
api/           # Express.js API for contact form handling
css/           # Stylesheets (Tailwind CSS build output)
js/            # Frontend JavaScript modules
scripts/       # Build tools and utilities
assets/        # Static assets (images, icons, fonts)
tests/         # Verification tests for links and branding
.github/       # CI/CD workflows (deployment, guards, testing)
```

## Development Commands

### Frontend Development
```bash
# Development server (Python HTTP server)
npm run dev

# Build CSS from Tailwind
npm run build:css

# Build icons from SVG sources
npm run build:icons

# Full build (CSS + icons)
npm run build

# Production server with build
npm run prod

# Node.js express server (alternative)
npm run serve
npm run start
```

### API Development
```bash
cd api
npm ci                    # Install dependencies
npm start                # Production server
npm run dev              # Development with NODE_ENV=development
```

### Testing & Verification
```bash
npm run test             # Generate ok.json and prove local server
npm run test:links       # Verify featured pen links consistency
npm run test:branding    # Verify branding consistency across files
npm run ok               # Generate ok.json health check file
npm run prove            # Smoke test local server
```

## Key Architecture Patterns

### Contact Form Pipeline
The contact form follows a production-grade pipeline with multiple safety mechanisms:

1. **Rate Limiting**: 1 request per 30 seconds per IP
2. **Timing Guard**: Requires form to be loaded for ≥3 seconds (anti-bot measure)
3. **Honeypot**: Silent `company` field trap for bots
4. **Idempotency**: Request deduplication using X-Request-ID headers
5. **CORS**: Strict origin validation for allowed domains
6. **Email Routing**: Owner notifications to `contact@vipspot.net` via Cloudflare → Gmail

### Security Headers & Middleware
- Helmet.js for security headers
- Custom CORS implementation with proper preflight support
- Request correlation via X-Request-ID
- Server-Timing headers for performance monitoring
- Morgan structured logging with request IDs

### CI/CD Pipeline
Three main workflows in `.github/workflows/`:

1. **deploy-api.yml**: Auto-deploys API to Heroku on `api/**` changes
2. **guards.yml**: Prevents forbidden email patterns, ensures canonical links
3. **ci-pages.yml**: Tests and validates site content

## Quality Gates

### Email Migration Enforcement
- Guards workflow prevents legacy emails (`vipspot.us`, `gmail.com`, `old@example.com`)
- Requires `contact@vipspot.net` to be present in codebase
- All contact forms route through Cloudflare Email Routing

### API Safety Requirements
- Never expose secrets in code or logs (use `process.env` only)
- Maintain timing guard (≥3s) and rate limiter integrity
- Preserve correlation headers (X-Request-ID, Server-Timing)
- Keep CORS/Helmet security middleware intact

### Featured Pen Consistency
- All CodePen links must use canonical URLs with UTM parameters
- Matrix Rain Effect links specifically monitored for consistency
- Automated tests verify link formats and update scripts available

## Environment Configuration

### Heroku API Config
Required environment variables:
- `CONTACT_TO=contact@vipspot.net`
- `CONTACT_FROM=VIPSpot <noreply@vipspot.net>`
- `CONTACT_REPLY_TO=contact@vipspot.net`
- `RESEND_API_KEY=re_*********`
- `ALLOWED_ORIGINS=https://vipspot.net,https://www.vipspot.net,http://localhost:8000`

### Deployment Secrets
GitHub Actions secrets:
- `HEROKU_API_KEY` (deployment)
- `HEROKU_EMAIL` (deployment)

## Common Development Tasks

### Updating Featured Pen Links
Use provided scripts to maintain consistency:
```bash
node scripts/fix-matrix-links.mjs          # Fix Matrix Rain Effect links
node scripts/update-featured-pen-link.mjs  # Update featured pen references
node scripts/add-utm-to-codepen.mjs        # Add UTM parameters to CodePen links
```

### Local Testing
```bash
# Smoke test local server
npm run prove

# Smoke test deployed API with CORS
curl -fsS -X OPTIONS https://vipspot-api-a7ce781e1397.herokuapp.com/contact \
  -H 'Origin: https://vipspot.net' \
  -H 'Access-Control-Request-Headers: content-type, x-request-id'
```

### Contact Form Testing
Production API requires timing guard (≥3s):
```bash
TIMESTAMP=$(($(date +%s) - 5))000
curl -X POST https://vipspot-api-a7ce781e1397.herokuapp.com/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://vipspot.net" \
  -d '{"name":"Test","email":"test@example.com","message":"Hello","timestamp":'$TIMESTAMP'}'
```

## Git Workflow

Use conventional commits and feature branches:
- Branch pattern: `fix/feature-name-YYYY-MM-DD` or `docs/update-name-YYYY-MM-DD`
- Commit format: `type(scope): description (TICKET-ID)`
- Always PR to `main` branch, never direct pushes

Current production endpoints:
- Site: `https://vipspot.net`
- API: `https://vipspot-api-a7ce781e1397.herokuapp.com`

Last updated: 2025-01-15