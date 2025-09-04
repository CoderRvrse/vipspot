# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Development
- `npm run dev` - Start Python HTTP server on port 8000 for development
- `npm run serve` / `npm start` - Start Node.js Express server with compression
- `npm run build:css` - Build Tailwind CSS (if using Tailwind build process)

### Build & Production
- `npm run build` - Build production assets and prepare deployment
- `npm run prod` - Start production preview server

### Testing & Verification
- `npm run test` - Run full test suite with DOM validation
- `npm run ok` - Generate DOM validation markers
- `npm run prove` - Verify critical elements exist on localhost:8000
- `npm run fresh` - Fresh server start with cache clearing
- `npm run kill-sw` - Clear service workers and caches for development
- Custom environment: `VIP_ORIGIN=http://localhost:8080 npm run prove`

## Project Architecture

### Dual-Environment Structure
VIPSpot 2025 consists of two main components:

```
vipspot/
├── index.html              # Static site root
├── js/
│   ├── main.js            # Main application logic
│   └── matrix-bg.js       # Matrix background engine
├── css/
│   ├── styles.css         # Main stylesheet with premium contact form
│   └── fonts.css          # Self-hosted font declarations
├── assets/
│   ├── fonts/             # WOFF2 self-hosted fonts (Orbitron, Roboto Mono)
│   ├── pens/              # Featured Pens thumbnails (SVG, 16:9)
│   └── me-*.png          # Profile images (512, 768, 1024px)
├── api/                   # Node.js Express backend
│   ├── package.json       # API dependencies (express, cors, helmet, resend)
│   └── index.js           # API server with /healthz and /contact
├── scripts/
│   └── prove-local.mjs    # CI validation script
└── .github/workflows/     # CI/CD with GitHub Actions
```

### Static Site (Root)
- **Production**: https://vipspot.net (GitHub Pages)
- **Local**: http://localhost:8000 (Python HTTP server)
- **Stack**: Vanilla HTML/CSS/JS with strict CSP

### API Backend (/api)
- **Production**: https://vipspot-api-*.herokuapp.com (may become api.vipspot.net)
- **Local**: http://localhost:8080 (Node.js Express)
- **Stack**: Node.js, Express, Helmet, CORS, Resend
- **Deploy**: Heroku with monorepo buildpack

## Content Security Policy (CSP)

### Strict CSP Implementation
Single CSP meta tag that **must precede all stylesheets**:

```html
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; base-uri 'self'; form-action 'self' https://vipspot-api-a7ce781e1397.herokuapp.com https://api.vipspot.net; object-src 'none'; connect-src 'self' https://vipspot-api-a7ce781e1397.herokuapp.com https://api.vipspot.net; img-src 'self' data:; font-src 'self' data:; style-src 'self'; style-src-elem 'self'; style-src-attr 'none'; script-src 'self';">
```

### CSP Compliance Rules
- ❌ **No inline JavaScript**: No `onclick`, `onload`, or `<script>` blocks
- ❌ **No inline CSS**: No `style` attributes or `<style>` tags
- ❌ **No external CDNs**: All fonts, icons, libraries self-hosted
- ✅ **Self-hosted fonts**: WOFF2 files served from `assets/fonts/`
- ✅ **API connectivity**: `connect-src` allows our Heroku backend
- ✅ **Form submissions**: `form-action` allows contact form POST

### Self-Hosted Assets
- **Fonts**: Orbitron (700, 900) + Roboto Mono (400, 500) = 44.6KB total
- **Icons**: Font Awesome CSS + webfont files in assets/
- **Images**: Profile pics (me-512.png, me-768.png, me-1024.png)

## Matrix Background Engine

### Performance Architecture
The Matrix engine achieves **60-90% CPU/RAM reduction** through:

- **FPS Capping**: Configurable 20-30 FPS (default 26)
- **Glyph Atlas**: Pre-rendered ImageBitmap textures (25-40% additional savings)
- **Adaptive Density**: Auto-reduces complexity on slower devices
- **Visibility Sleep**: Pauses when tab invisible using IntersectionObserver
- **Idle Timeout**: Auto-pauses after 30s user inactivity
- **Battery Saver**: Detects low-end devices and auto-tunes

### Glyph Rotation System
Four rotating character sets with transitions every 8-20 seconds:
- **JP**: Japanese hiragana/katakana (ひらがな・カタカナ)
- **RU**: Cyrillic (АБВГДЕЁЖЗИЙ)
- **LAT**: Latin extended (ÀÁÂÃÄÅÆÇ)
- **NUM**: Numbers and symbols (0123456789!@#)

### Time-of-Day Themes
Automatic theme cycling based on local time:
- **Dawn** (5-8 AM): Soft pink glow
- **Morning** (8-12 PM): Classic cyan matrix
- **Afternoon** (12-5 PM): Sky blue
- **Evening** (5-9 PM): Warm gold
- **Night** (9-5 AM): Deep purple

### Runtime API
Complete control interface accessible via `window.VIPSpot`:

```javascript
// Performance tuning
VIPSpot.setMatrix({ fps: 24, density: 0.7, rotateSeconds: 15 });

// Theme control
VIPSpot.setTheme('night');          // Force specific theme
VIPSpot.setThemeAuto(true);         // Return to time-based auto

// Interactive features  
VIPSpot.triggerBurst('DEMO');       // Flash custom text
VIPSpot.toggleDebug();              // Performance HUD

// System control
VIPSpot.pauseMatrix();              // Safe pause
VIPSpot.resumeMatrix();             // Safe resume
VIPSpot.destroyMatrix();            // Complete cleanup
```

### RAF Safety System
Critical animation frame safety to prevent memory leaks:
- **Single RAF ID**: `let rafId = null;` (never `animationId`)
- **Clean Shutdown**: Always `cancelAnimationFrame(rafId)` before new `requestAnimationFrame`
- **CI Protection**: Build fails if legacy `animationId` usage returns
- **API Access**: `VIPSpot._raf()` exposes current frame ID for debugging

### HTML Configuration
```html
<canvas id="matrix-canvas"
        data-fps="26"
        data-density="0.8"
        data-rotate-seconds="18"
        data-burst="on"
        aria-hidden="true"></canvas>
```

### URL Parameter Overrides (No Redeploy)
```
?theme=night&fps=24&density=0.7     # Performance tuning
?debug=1                            # Show performance HUD
?matrix=off                         # Disable completely
```

## 3D Tilt Effects & Featured Pens

### Premium 3D Tilt
Applied to tech stack cards and Featured Pens with:
- **GPU Transforms**: Hardware-accelerated `transform3d()`
- **Glow + Reflection**: Dynamic lighting effects on hover
- **Opt-in**: `data-tilt` attribute required on elements
- **Touch Disabled**: Automatically disabled on touch devices
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce`

### Featured Pens Section
Showcase of CodePen projects with:
- **Minimum 3 cards** required (CI-enforced)
- **16:9 SVG thumbnails** with proper dimensions
- **Lazy loading**: `loading="lazy"` and `decoding="async"`
- **UTM tracking**: All CodePen links include campaign parameters
- **Self-hosted images**: Stored in `assets/pens/` directory

## Premium Contact Form

### UX Features
- **Floating Labels**: Animate on focus/input with CSS transitions
- **Neon CTA Button**: Gradient background with glow effects
- **Loading Spinner**: Button shows `<i class="fas fa-spinner fa-spin"></i>` during submit
- **Character Counter**: Real-time display for message field (4000 char limit)
- **Visual Validation**: Green/red borders for valid/invalid fields
- **Status Messages**: Color-coded success/error/info with ARIA live regions

### Accessibility Implementation
- **Keyboard Navigation**: Full tab order, Enter key submits
- **Screen Reader Support**: `aria-live="polite"` status announcements
- **Label Association**: Proper `for`/`id` relationships
- **Error Messaging**: Individual field error states
- **Mobile Optimized**: Tap targets ≥48px, no layout shift

### Security Features
- **Honeypot Field**: Hidden `company` input with `aria-hidden="true"`
- **Timing Guard**: Minimum 3-second delay before submission allowed
- **Field Length Limits**: Name 120 chars, message 4000 chars
- **Input Sanitization**: Client-side validation before API submission

### CSS Implementation
```css
.hp-field {
  position: absolute !important;
  width: 1px; height: 1px;
  overflow: hidden; opacity: 0;
  pointer-events: none;
  clip-path: inset(50%);
}
```

## Backend API (/api)

### Endpoints
- **GET /healthz**: Simple health check returning `{ ok: true }`
- **POST /contact**: Contact form submission with email notifications

### Security Stack
- **Helmet**: Security headers (CSP disabled for API-only service)
- **CORS**: Strict origin allow-list from `ALLOWED_ORIGINS` env var
- **Rate Limiting**: 5 requests per minute per IP on `/contact` endpoint
- **Body Size Limit**: 20KB JSON payload maximum
- **IP Capture**: Logs `x-forwarded-for` header for submissions

### Email System (Resend)
Dual-email system with professional templates:

**Owner Notification**:
- Plain text format with ticket ID, timestamp, IP address
- `Reply-To` set to visitor's email for direct responses
- Subject: `{COMPANY} contact — {visitor name}`

**Visitor Auto-Reply**:
- HTML + text versions with dark theme styling
- Ticket reference and next steps information
- Link to booking URL for urgent inquiries

### Heroku Deployment
**Buildpacks** (in order):
1. `heroku-buildpack-monorepo` (APP_BASE=api)
2. `heroku/nodejs`

**Required Environment Variables**:
```bash
APP_BASE=api
RESEND_API_KEY=re_xxxxxxxxx
CONTACT_FROM="VIPSpot <noreply@vipspot.net>"
CONTACT_TO=your-email@domain.com
ALLOWED_ORIGINS=https://vipspot.net,http://localhost:8000
```

**Optional Variables**:
```bash
COMPANY_NAME=VIPSpot
CONTACT_REPLY_TO=your-reply@domain.com
BOOKING_URL=mailto:your-booking@domain.com
```

### API Testing
```bash
# Health check
curl -fsS https://vipspot-api-*.herokuapp.com/healthz

# Contact form submission
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

## CI Guardrails

Our `scripts/prove-local.mjs` validates:

### CSP & Security
- Single CSP meta tag before all stylesheets
- No external stylesheet/script sources (`googleapis.com`, `cdnjs.com`)
- No inline styles (`style=`) or script blocks (`<style>`, `<script>`)
- Self-hosted fonts with `font-src 'self' data:`

### Matrix Engine
- Canvas element with ID `matrix-canvas` or `matrix-bg` (exactly one)
- RAF safety: `let rafId` and `VIPSpot._raf` markers exist
- No legacy `animationId` usage (build fails if found)
- API completeness: `setMatrix`, `triggerBurst`, `setTheme` methods

### Mobile CTA Safety
- CTA anchor links to `#contact` (no inline `onclick`)
- Matrix canvas has `pointer-events: none` (doesn't block taps)
- Hero content wrapper has `isolation: isolate` (stacking context shield)
- Native smooth scrolling enabled with reduced-motion fallback

### Contact Form
- Form has ID `contact-form` with `novalidate` attribute
- Submit button has ID `contact-submit` (not `contact-send`)
- Honeypot field with `.hp-field` class and `aria-hidden="true"`
- Message field `maxlength` ≥1200 (we use 4000)
- Character counter element `#msg-count` exists
- Status div with `aria-live="polite"` for screen readers
- Honeypot truly hidden: `position: absolute !important` and `opacity: 0`

### Featured Pens
- Section with ID `pens` exists
- Minimum 3 pen cards (`.pen-card` class)
- CodePen links (`/pen/` URLs) include UTM parameters
- Pen images have `loading="lazy"`, `decoding="async"`, width/height attributes

### ARIA & Accessibility  
- Main content wrapper with ID `main-content`
- Project cards have real controls (`<button>` or `<a>` with `data-project`)
- Modal with `role="dialog"` and `aria-modal="true"`
- Project buttons have `aria-haspopup="dialog"` and `aria-controls`
- All `aria-labelledby`/`aria-describedby` targets exist
- No empty buttons (must have discernible text)

### API Health
- Production API health check must pass: `GET /healthz` returns 200

## Contribution Guidelines

### Code Style Rules
1. **No Inline Violations**: Never add `style=`, `onclick=`, or `<script>` blocks
2. **RAF Safety**: Use `rafId` variable name, never `animationId`
3. **Accessibility First**: Include ARIA attributes, keyboard navigation
4. **Reduced Motion**: Respect `prefers-reduced-motion: reduce`
5. **Transform Efficiency**: Use `transform` and `opacity` for animations
6. **CSP Compliance**: All resources must be self-hosted or from allowed origins

### Animation Guidelines
- Use CSS transforms (`translateX`, `scale`) over position changes
- Leverage `opacity` for fade effects (GPU-accelerated)
- Add `will-change` sparingly and remove after animation
- Provide fallbacks for `prefers-reduced-motion`
- Cap animations to 60fps or lower for battery efficiency

### Form Development
- Always validate client-side AND server-side
- Use semantic HTML (`<button type="submit">`, proper labels)
- Include loading/disabled states for async operations
- Provide clear error messages with ARIA live regions
- Test keyboard navigation and screen reader compatibility

### Matrix Engine Development
- Use the `VIPSpot.*` API for all Matrix interactions
- Test performance impact with `?debug=1` HUD
- Maintain compatibility with all five time-of-day themes
- Respect visibility state and idle timeout behavior
- Always clean up animation frames on component destruction

### Security Practices
- Never commit API keys, tokens, or credentials
- Test all changes against CSP policy (no console errors)
- Validate that honeypot fields remain hidden
- Use parameterized queries for any database operations
- Sanitize all user inputs before processing or storage