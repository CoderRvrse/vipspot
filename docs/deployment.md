# Deployment Guide

This guide covers production deployment of the VIPSpot system to GitHub Pages (frontend) and Heroku (API).

## Overview

VIPSpot uses a dual-deployment architecture:

- **Frontend**: GitHub Pages (static site)
- **API**: Heroku (Node.js app)
- **DNS**: Cloudflare (routing + email)

## GitHub Pages Deployment

### Automatic Deployment

The frontend deploys automatically via GitHub Actions:

**Trigger**: Push to `main` branch  
**Workflow**: `.github/workflows/ci-pages.yml`  
**Target**: `https://coderrvrse.github.io/vipspot`  
**Custom Domain**: `vipspot.net`

### Manual Deployment

1. **Enable GitHub Pages:**
   ```
   Repository Settings → Pages → Source: Deploy from branch (main)
   ```

2. **Configure custom domain:**
   ```
   Repository Settings → Pages → Custom domain: vipspot.net
   ```

3. **Verify deployment:**
   ```bash
   curl -I https://vipspot.net
   # Should return 200 OK
   ```

## Heroku API Deployment

### Automatic Deployment

The API deploys automatically when `api/**` files change:

**Trigger**: Push to `main` with `api/` changes  
**Workflow**: `.github/workflows/deploy-api.yml`  
**Target**: `https://vipspot-api-a7ce781e1397.herokuapp.com`

### Manual Deployment

1. **Install Heroku CLI:**
   ```bash
   curl https://cli-assets.heroku.com/install.sh | sh
   ```

2. **Login and create app:**
   ```bash
   heroku login
   heroku create vipspot-api
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set RESEND_API_KEY=re_your_key_here
   heroku config:set CONTACT_TO=contact@vipspot.net
   heroku config:set CONTACT_FROM="VIPSpot <noreply@vipspot.net>"
   ```

4. **Deploy:**
   ```bash
   git subtree push --prefix api heroku main
   ```

5. **Verify deployment:**
   ```bash
   curl https://your-app.herokuapp.com/healthz
   # Should return {"ok": true}
   ```

## DNS Configuration

### Cloudflare Setup

1. **Add domain to Cloudflare**
2. **Configure A records:**
   ```
   vipspot.net → 185.199.108.153
   vipspot.net → 185.199.109.153  
   vipspot.net → 185.199.110.153
   vipspot.net → 185.199.111.153
   www.vipspot.net → CNAME to vipspot.net
   ```

3. **Configure email routing:**
   ```
   contact@vipspot.net → your@examplemail.invalid
   ```

4. **SSL/TLS settings:**
   ```
   SSL/TLS Mode: Full (strict)
   Always Use HTTPS: On
   ```

## CI/CD Configuration

### GitHub Actions Secrets

Required secrets in repository settings:

```
HEROKU_API_KEY=your_heroku_api_key
HEROKU_EMAIL=your_heroku_email@example.com
GITHUB_TOKEN=ghp_your_github_token
```

### Workflow Files

**Pages Deployment** (`.github/workflows/ci-pages.yml`):
```yaml
name: VIPSpot CI + Pages
on:
  push:
    branches: [ main ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to GitHub Pages
        uses: actions/deploy-pages@v2
```

**API Deployment** (`.github/workflows/deploy-api.yml`):
```yaml
name: Deploy API
on:
  push:
    branches: [ main ]
    paths: [ 'api/**' ]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
```

### Guards and Quality Gates

**Email String Guards** (`.github/workflows/guards.yml`):
```yaml
- name: No legacy emails; require new
  run: |
    ! grep -RInE '(vipspot\.us|gmail\.com|old@example\.com)' -- . || exit 1
    grep -RIn 'contact@vipspot.net' -- . >/dev/null || exit 1
```

**Featured Pens Guards**:
```yaml
- name: Featured Pens canonical links  
  run: |
    grep -q 'codepen.io/CoderRvrse/pen/VYvNzzN.*utm_source=vipspot' README.md
    grep -q 'codepen.io/CoderRvrse/pen/azvxEZG.*utm_source=vipspot' README.md
```

## Monitoring & Health Checks

### Application Health

**API Health Check:**
```bash
curl https://vipspot-api-a7ce781e1397.herokuapp.com/healthz
```

**Site Health Check:**
```bash
curl -I https://vipspot.net
```

### Monitoring Setup

**Recommended monitoring tools:**
- **Uptime**: UptimeRobot, Pingdom
- **Errors**: Sentry, Rollbar  
- **Performance**: New Relic, DataDog
- **Logs**: Heroku logs, Cloudflare analytics

### Alerting

**Critical alerts:**
- API health check failures
- High error rates (>5%)
- SSL certificate expiration
- DNS resolution issues

**Performance alerts:**
- Response time >2s
- High memory usage
- Rate limit threshold reached

## Rollback Procedures

### Frontend Rollback

```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback to specific commit
git reset --hard COMMIT_HASH
git push --force origin main
```

### API Rollback

```bash
# Heroku rollback
heroku rollback v123 --app vipspot-api

# Or redeploy previous version
git checkout PREVIOUS_TAG
git subtree push --prefix api heroku main --force
```

### DNS Rollback

1. Update Cloudflare A records to previous values
2. Clear DNS cache: `flush dns`
3. Verify resolution: `nslookup vipspot.net`

## Troubleshooting

### Common Issues

**CORS errors:**
- Verify `ALLOWED_ORIGINS` includes frontend domain
- Check preflight OPTIONS requests return 204

**Email delivery issues:**
- Verify Resend API key is valid
- Check Cloudflare email routing configuration
- Test with curl command

**Build failures:**
- Check GitHub Actions logs
- Verify all environment variables are set
- Ensure no merge conflicts

**SSL certificate issues:**
- Verify DNS points to GitHub Pages IPs
- Check Cloudflare SSL mode (Full strict)
- Allow 24-48 hours for propagation