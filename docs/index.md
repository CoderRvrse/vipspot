# VIPSpot Documentation

Welcome to the VIPSpot documentation hub! This is your comprehensive guide to understanding, deploying, and extending the VIPSpot portfolio + contact pipeline system.

## Quick Start

VIPSpot is a production-grade portfolio website with automated contact pipeline, featuring:

- **🚀 GitHub Pages Frontend** - Fast, secure static site with strict CSP
- **⚡ Heroku API Backend** - Node.js/Express with dual email delivery
- **🛡️ Hardened Security** - Rate limiting, timing guards, CORS whitelisting
- **🔄 CI/CD Automation** - Automated releases, guards, and deployments

## Architecture Overview

```mermaid
graph TB
    A[Visitor] --> B[GitHub Pages<br/>vipspot.net]
    B --> C[Contact Form<br/>Timing Guard ≥3s]
    C --> D[Heroku API<br/>Rate Limit: 1/30s]
    D --> E[Resend Email<br/>Dual Delivery]
    E --> F[Owner + Visitor<br/>Auto-reply]
    
    G[Cloudflare DNS] --> B
    H[Gmail] --> I[contact@vipspot.net]
    G --> H
```

## Features

### 🎨 Frontend Features
- **PWA-style UX** with neon UI and matrix visuals
- **Featured Pens** showcase with CodePen integration
- **Responsive Design** optimized for all devices
- **Accessibility** compliant with ARIA standards

### 🔧 Backend Features  
- **Express.js API** with comprehensive middleware
- **Rate Limiting** (1 request per 30 seconds per IP)
- **Timing Guard** (≥3s submission delay)
- **Request Correlation** via X-Request-ID headers
- **Observability** with Server-Timing metrics

### 🚀 DevOps Features
- **Automated Releases** with semantic versioning
- **CI/CD Guards** for email strings and canonical links
- **Branch Protection** with required status checks
- **Zero-Downtime Deploys** via GitHub Actions

## Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/CoderRvrse/vipspot.git
   cd vipspot
   ```

2. **Install dependencies**
   ```bash
   npm ci
   cd api && npm ci
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your settings
   ```

4. **Run locally**
   ```bash
   # Frontend (from root)
   python -m http.server 8000
   
   # API (from api/)
   npm run dev
   ```

## Configuration

See the [Configuration Guide](configuration.md) for detailed environment variable setup and security configuration.

## Deployment

See the [Deployment Guide](deployment.md) for production deployment instructions and CI/CD setup.

## API Reference

See the [API Documentation](api.md) for complete endpoint documentation and examples.

## Contributing

See the [Contributing Guide](contributing.md) for development workflow and coding standards.

---

**Live Site**: [vipspot.net](https://vipspot.net)  
**API Health**: [health check](https://vipspot-api-a7ce781e1397.herokuapp.com/healthz)  
**Repository**: [GitHub](https://github.com/CoderRvrse/vipspot)