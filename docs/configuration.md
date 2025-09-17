# Configuration

This guide covers environment configuration for both development and production deployments.

## Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `RESEND_API_KEY` | Resend API key for email sending | `re_AbCdEfGh_123456789` |

### Optional Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `CONTACT_TO` | `contact@vipspot.net` | Owner email address |
| `CONTACT_FROM` | `VIPSpot <noreply@vipspot.net>` | Sender identity |
| `CONTACT_REPLY_TO` | `contact@vipspot.net` | Reply-To header |
| `COMPANY_NAME` | `VIPSpot` | Branding name |
| `BOOKING_URL` | `mailto:contact@vipspot.net` | Contact/booking URL |
| `PORT` | `8080` | API port (local development) |
| `ALLOWED_ORIGINS` | `https://vipspot.net,https://www.vipspot.net,http://localhost:8000` | CORS whitelist |

### CI/CD Variables (Secrets)

| Variable | Description | Where Used |
|----------|-------------|------------|
| `HEROKU_API_KEY` | Heroku deployment auth | GitHub Actions |
| `HEROKU_EMAIL` | Heroku account email | GitHub Actions |
| `GITHUB_TOKEN` | GitHub API access | Release automation |

## Local Development Setup

1. **Copy environment template:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env` with your values:**
   ```env
   CONTACT_TO=contact@vipspot.net
   CONTACT_FROM="VIPSpot <noreply@vipspot.net>"
   CONTACT_REPLY_TO=contact@vipspot.net
   RESEND_API_KEY=re_your_key_here
   ALLOWED_ORIGINS=https://vipspot.net,https://www.vipspot.net,http://localhost:8000
   COMPANY_NAME=VIPSpot
   BOOKING_URL=mailto:contact@vipspot.net
   ```

3. **Install dependencies:**
   ```bash
   npm ci
   cd api && npm ci
   ```

4. **Run development servers:**
   ```bash
   # Frontend (port 8000)
   python -m http.server 8000
   
   # API (port 8080)
   cd api && npm run dev
   ```

## Production Configuration

### Heroku Setup

The API is deployed to Heroku with the following configuration:

**Config Vars:**
```bash
heroku config:set RESEND_API_KEY=re_your_key_here
heroku config:set CONTACT_TO=contact@vipspot.net
heroku config:set CONTACT_FROM="VIPSpot <noreply@vipspot.net>"
heroku config:set ALLOWED_ORIGINS=https://vipspot.net,https://www.vipspot.net
```

**Buildpack:**
```bash
heroku buildpacks:set heroku/nodejs
```

### GitHub Pages Setup

The frontend is deployed to GitHub Pages with:

- **Source**: Deploy from `main` branch
- **Custom Domain**: `vipspot.net`
- **HTTPS**: Enforced
- **Build**: Static files served directly

### DNS Configuration (Cloudflare)

**A Records:**
```
vipspot.net → GitHub Pages IPs
www.vipspot.net → GitHub Pages IPs
```

**Email Routing:**
```
contact@vipspot.net → Gmail forwarding
```

## Security Configuration

### CORS Policy

```javascript
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [
    'https://vipspot.net',
    'https://www.vipspot.net',
    'http://localhost:8000'
  ],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'X-Request-ID', 'Origin']
};
```

### Rate Limiting

```javascript
const rateLimiter = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 1, // 1 request per windowMs
  message: 'Too many requests, please try again later'
});
```

### Content Security Policy

The frontend implements strict CSP:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
    default-src 'self';
    base-uri 'self';
    object-src 'none';
    script-src 'self' https://plausible.io;
    connect-src 'self' https://vipspot-api-a7ce781e1397.herokuapp.com https://plausible.io;
    img-src 'self' data:;
    style-src 'self' 'unsafe-inline';
    font-src 'self' data:;
    manifest-src 'self';
    form-action 'self' https://vipspot-api-a7ce781e1397.herokuapp.com
  "
>
```

## Monitoring & Observability

### Request Correlation

Every request includes correlation headers:

```javascript
// Auto-generated request ID
X-Request-ID: req_1694736000123

// Performance timing
Server-Timing: total;dur=45.2
```

### Health Checks

**API Health:**
- Endpoint: `/healthz`
- Heroku Health Checks: Enabled
- Uptime Monitoring: External service recommended

**Site Health:**
- GitHub Pages Status: Automatic
- DNS Health: Cloudflare monitoring
- SSL Certificate: Auto-renewed via GitHub