# VIPSpot 2025 - Futuristic Developer Portfolio

[![VIPSpot CI + Pages](https://github.com/CoderRvrse/vipspot/actions/workflows/ci-pages.yml/badge.svg?branch=main)](https://github.com/CoderRvrse/vipspot/actions/workflows/ci-pages.yml)

A premium developer portfolio featuring a high-performance Matrix background engine, premium contact system with professional email integration, and enterprise-grade security. Built with vanilla HTML/CSS/JS and a Node.js API backend.

## 🚀 Features

### Interactive Background
- **High-Performance Matrix Engine** - 60-90% CPU/RAM reduction with glyph atlas optimization
- **Time-of-Day Themes** - Automatic color cycling (dawn, morning, afternoon, evening, night)
- **Four Glyph Sets** - Rotating Japanese, Cyrillic, Latin, and numeric characters
- **Performance Controls** - FPS capping, density adaptation, visibility/idle sleep
- **Runtime API** - Complete programmatic control via `window.VIPSpot`

### Premium Contact System
- **Floating Label Form** - Modern animated labels with neon styling
- **Professional Email Integration** - Dual emails (owner notification + visitor auto-reply)
- **Loading States** - Button spinner and disabled states during submission
- **Character Counter** - Real-time counter with warning/error states
- **Accessibility Complete** - ARIA live regions, keyboard navigation, screen reader support

### 3D Visual Effects
- **Premium Tilt Cards** - GPU-accelerated 3D transforms on tech stack and Featured Pens
- **Dynamic Lighting** - Glow and reflection effects on hover
- **Touch Optimized** - Automatically disabled on mobile devices
- **Motion Respectful** - Honors `prefers-reduced-motion` settings

### Security & Performance
- **Strict CSP** - Zero external dependencies, all assets self-hosted
- **Self-Hosted Fonts** - WOFF2 files (44.6KB total) for maximum control
- **Rate Limited API** - 5 req/min contact form protection
- **Honeypot Protection** - Hidden spam prevention with timing guards

## 🏗️ Project Architecture

### Static Site (Root)
- **Production**: https://vipspot.net (GitHub Pages)
- **Local**: http://localhost:8000 (Python HTTP server)
- **Tech Stack**: Vanilla HTML/CSS/JS with strict CSP

### API Backend (/api)
- **Production**: https://vipspot-api-*.herokuapp.com
- **Local**: http://localhost:8080 (Node.js Express)
- **Tech Stack**: Express, Helmet, CORS, Resend email service
- **Deploy**: Heroku with monorepo buildpack

```
vipspot/
├── index.html              # Main site
├── js/
│   ├── main.js            # App logic + premium contact form
│   └── matrix-bg.js       # Matrix background engine
├── css/
│   ├── styles.css         # Main styles + contact form CSS
│   └── fonts.css          # Self-hosted font declarations
├── assets/
│   ├── fonts/             # WOFF2 fonts (Orbitron, Roboto Mono)
│   ├── pens/              # Featured Pens thumbnails (16:9 SVG)
│   └── me-*.png          # Profile images (512, 768, 1024px)
├── api/                   # Node.js Express backend
│   ├── package.json       # API dependencies
│   └── index.js           # Contact API + email system
└── scripts/
    └── prove-local.mjs    # CI validation (60+ checks)
```

## 🛠️ Quick Start

### Prerequisites
- Modern web browser
- Python 3.x (for local development)
- Node.js 20+ (for API development)

### Development Setup

1. **Clone and start local server**
   ```bash
   git clone https://github.com/CoderRvrse/vipspot.git
   cd vipspot
   python -m http.server 8000
   ```
   Open: http://localhost:8000

2. **API development (optional)**
   ```bash
   cd api
   npm install
   # Set environment variables (see Backend section)
   node index.js
   ```
   API runs on: http://localhost:8080

3. **Run tests**
   ```bash
   npm run prove  # Validates DOM + security + accessibility
   ```

## 🔒 Content Security Policy

Strict CSP with zero external dependencies:

```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self'; 
  base-uri 'self'; 
  form-action 'self' https://vipspot-api-*.herokuapp.com https://api.vipspot.net;
  object-src 'none'; 
  connect-src 'self' https://vipspot-api-*.herokuapp.com https://api.vipspot.net;
  img-src 'self' data:; 
  font-src 'self' data:; 
  style-src 'self'; 
  style-src-elem 'self'; 
  style-src-attr 'none'; 
  script-src 'self';
">
```

**Key Points**:
- **No external CDNs** - All fonts, icons, scripts self-hosted
- **WOFF2 fonts** - Orbitron (700, 900) + Roboto Mono (400, 500) = 44.6KB
- **API connectivity** - `connect-src` allows contact form submissions
- **Zero inline code** - No `style=` attributes or `<script>` blocks

## ⚡ Matrix Background API

Complete runtime control over the background animation:

### Quick Examples
```javascript
// Performance tuning
VIPSpot.setMatrix({ fps: 24, density: 0.7, rotateSeconds: 15 });

// Theme control
VIPSpot.setTheme('night');          // Force dark purple theme
VIPSpot.setThemeAuto(true);         // Return to time-based auto themes

// Interactive features
VIPSpot.triggerBurst('HELLO');      // Flash custom text
VIPSpot.toggleDebug();              // Show performance HUD

// System control
VIPSpot.pauseMatrix();              // Pause animation
VIPSpot.resumeMatrix();             // Resume animation
```

### URL Controls (No Redeploy)
```
?theme=night&fps=24&density=0.7     # Custom performance settings
?debug=1                            # Enable performance monitoring
?matrix=off                         # Disable background completely
```

### HTML Configuration
```html
<canvas id="matrix-canvas"
        data-fps="26"
        data-density="0.8" 
        data-rotate-seconds="18"
        data-burst="on"
        aria-hidden="true"></canvas>
```

## 🔗 Backend API

### Endpoints
- **GET /healthz** - Health check returning `{ ok: true }`
- **POST /contact** - Contact form submission with dual email system

### Heroku Deployment
**Buildpacks** (in order):
1. `heroku-buildpack-monorepo`
2. `heroku/nodejs`

**Required Environment Variables**:
```bash
APP_BASE=api
RESEND_API_KEY=re_your_api_key_here
CONTACT_FROM="VIPSpot <noreply@vipspot.net>"
CONTACT_TO=your-email@domain.com
ALLOWED_ORIGINS=https://vipspot.net,http://localhost:8000
```

**Optional Variables**:
```bash
COMPANY_NAME=VIPSpot
CONTACT_REPLY_TO=your-reply@domain.com
BOOKING_URL=mailto:booking@domain.com
```

### API Testing
```bash
# Health check
curl -fsS https://vipspot-api-*.herokuapp.com/healthz

# Contact form test
curl -X POST https://vipspot-api-*.herokuapp.com/contact \
  -H "Content-Type: application/json" \
  -H "Origin: https://vipspot.net" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "message": "Test message",
    "timestamp": '$(date +%s000)'
  }'
```

## 🛡️ CI Guardrails

Our automated testing validates 60+ critical aspects:

### Security & CSP
- Single CSP meta tag before all stylesheets
- No external dependencies (googleapis.com, cdnjs.com blocked)
- No inline styles or JavaScript
- Self-hosted fonts with proper CORS

### Matrix Engine
- Canvas element present with correct ID
- RAF safety (`rafId` not `animationId`)
- API completeness (setMatrix, triggerBurst, setTheme)
- Performance markers exist

### Contact Form
- Form has `novalidate` attribute
- Submit button correct ID (`contact-submit`)
- Honeypot field properly hidden
- Character counter element exists
- Message field maxlength ≥1200 (we use 4000)
- ARIA live regions for status updates

### Accessibility
- Proper ARIA attributes on interactive elements
- Modal with `role="dialog"` and `aria-modal="true"`
- Screen reader compatible navigation
- Keyboard accessibility verified

### Featured Pens
- Minimum 3 pen cards required
- CodePen links include UTM tracking
- Images optimized with lazy loading
- Proper width/height attributes

*See [CLAUDE.md](CLAUDE.md) for complete CI checklist*

## ♿ Accessibility Features

### Premium Contact Form
- **Floating Labels** - Smooth animations on focus/input
- **Screen Reader Support** - ARIA live status announcements
- **Keyboard Navigation** - Full tab order, Enter key submission
- **Visual Validation** - Green/red borders for field states
- **Error Messaging** - Individual field error states
- **Mobile Optimized** - Touch targets ≥48px, no layout shift

### Matrix Background
- **Motion Respectful** - Honors `prefers-reduced-motion: reduce`
- **Screen Reader Hidden** - `aria-hidden="true"` on canvas
- **Performance Adaptive** - Auto-reduces load on slower devices
- **Battery Conscious** - Idle timeout and visibility detection

## 📧 Email System

Professional dual-email system powered by Resend:

### Owner Notification
- Plain text format with ticket ID and timestamp
- Includes visitor IP and user agent
- `Reply-To` set to visitor's email
- Subject: `{COMPANY} contact — {visitor name}`

### Visitor Auto-Reply  
- Professional HTML template with dark theme
- Ticket reference for tracking
- Next steps and response timeline
- Optional booking link for urgent requests
- Text fallback for all email clients

## 🎨 Tech Stack

### Frontend
- **HTML5** - Semantic markup with Schema.org JSON-LD
- **CSS3** - Modern features (custom properties, transforms, grid)
- **JavaScript (ES6+)** - Vanilla JS with modern browser APIs
- **Self-Hosted Assets** - Complete control over dependencies

### Backend
- **Node.js** - Express server with security middleware
- **Helmet** - Security headers and CSP
- **CORS** - Strict origin allow-list
- **Resend** - Professional email delivery service
- **Heroku** - Cloud platform with monorepo support

### Development
- **GitHub Actions** - CI/CD with automated testing
- **Python HTTP Server** - Local development server
- **Custom Validators** - 60+ automated checks in CI

## 🔬 Performance Optimizations

### Matrix Background
- **60-90% Resource Reduction** from baseline implementation
- **Glyph Atlas System** - Pre-rendered character textures
- **FPS Capping** - Configurable 20-30 FPS (default 26)
- **Adaptive Density** - Auto-reduces complexity on slower devices
- **Idle Detection** - Pauses after 30s user inactivity
- **Visibility Pausing** - Stops when tab is hidden

### Contact Form
- **Lightweight Dependencies** - No external form libraries
- **Efficient Validation** - Client-side with server-side backup
- **Progressive Enhancement** - Works with JavaScript disabled
- **Optimal Loading** - Critical styles inlined, scripts deferred

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Review [CLAUDE.md](CLAUDE.md) for technical guidelines
2. Ensure CSP compliance (no inline code)
3. Test accessibility with screen readers
4. Run `npm run prove` before submitting
5. Maintain performance standards

## 🔮 Future Roadmap

### Planned Features
- **Blog Integration** - Developer articles and tutorials
- **Portfolio Filtering** - Category-based project filtering  
- **Testimonials Section** - Client feedback and reviews
- **Skills Timeline** - Interactive experience timeline

### Technical Improvements
- **PWA Support** - Offline functionality and app install
- **Advanced Analytics** - Performance monitoring and user insights
- **CDN Integration** - Global asset distribution
- **Database Integration** - Dynamic content management

---

**Built with ❤️ for the future of web development**

*VIPSpot 2025 - Where premium code meets exceptional design*