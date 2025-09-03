# VIPSpot API (monorepo subdir)

Secure Node/Express backend for VIPSpot contact form handling.

## Endpoints

- **GET /healthz** → `{ ok: true }`
- **POST /contact** → validates input → sends email via Resend

## Environment Variables (Heroku Config Vars)

- `RESEND_API_KEY` - Resend service API key
- `CONTACT_TO` - Email address to receive contact form submissions
- `CONTACT_FROM` - From address for emails (e.g., `VIPSpot <noreply@vipspot.net>`)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed origins (e.g., `https://vipspot.net,http://localhost:8000`)
- `APP_BASE=api` - Set on Heroku app for monorepo buildpack

## Security Features

- **CORS**: Strict allow-list of origins
- **Rate Limiting**: 5 requests per minute per IP for /contact
- **Helmet**: Security headers
- **Body Size Limit**: 20KB max
- **Honeypot**: Hidden company field for spam detection
- **Timing Guard**: Minimum 3-second submission delay
- **Input Validation**: Email format, length limits, required fields
- **HTML Escaping**: XSS protection in email templates

## Local Development

```bash
cd api
npm install
RESEND_API_KEY=xxx CONTACT_TO=you@example.com npm run dev
```

## Heroku Deployment

Uses `heroku-buildpack-monorepo` + `heroku/nodejs` buildpacks with `APP_BASE=api` config.