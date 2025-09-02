# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Primary Development
- `npm run dev` - Start Python HTTP server on port 8000 for development
- `npm run serve` / `npm start` - Start Node.js Express server with compression
- `npm run start:watch` - Start Node.js server with auto-restart on file changes

### Build & Production
- `npm run build:css` - Build minified Tailwind CSS from input.css to tailwind.css
- `npm run prod` - Build CSS and start Python server for production preview

### Testing & Verification
- `npm run test` - Run full test suite (generates DOM markers and verifies locally)
- `npm run ok` - Generate DOM validation markers for testing
- `npm run prove` - Verify critical DOM elements exist on localhost:8000
- Custom environment: `VIP_ORIGIN=http://localhost:8080 npm run prove` - Test against different origin

### Utility Commands
- `npm run open` - Open browser to localhost:8000
- `npm run kill-sw` - Clear service worker and caches for development
- `npm run fresh` - Start server and clear service workers

## Project Architecture

### Core Structure
This is a modern single-page portfolio website using vanilla JavaScript with Tailwind CSS:

```
vipspot/
├── index.html           # Main HTML file with complete structure
├── js/main.js          # All JavaScript functionality (matrix animation, forms, modals)
├── css/
│   ├── input.css       # Tailwind CSS source file
│   ├── styles.css      # Custom CSS styles and animations
│   └── tailwind.css    # Generated Tailwind build output
├── server.js           # Express server with compression for production
└── scripts/            # Development utilities
```

### Key Components

**Main JavaScript (js/main.js)**:
- Service worker management with localhost detection
- Matrix background animation system
- Project modal system with flip cards
- Contact form with client-side validation
- Typewriter text effects
- Smooth scrolling navigation

**Styling Architecture**:
- Tailwind CSS for utility classes (configured in tailwind.config.js)
- Custom CSS properties for neon color scheme in styles.css
- Responsive design with mobile-first approach
- Dark theme with neon accents (#00f3ff, #39ff14, #b967ff)

### Content Management

**Project Data**: Modify the `PROJECTS_DATA` object in js/main.js:712 to add/update portfolio projects. Each project requires:
- title, color (neon-blue/green/purple), description
- features array, technologies array  
- links object with demo/github URLs

**Personal Information**: Update directly in index.html including:
- Meta tags and Schema.org JSON-LD
- Hero section content
- Skills/technologies section
- Social media links in footer

### Testing System

The project uses custom DOM validation:
- `scripts/prove-local.mjs` checks for critical page elements
- Validates title, CSS/JS linking, and core functionality
- CI/CD runs these checks on every PR via GitHub Actions

### Security Features

- Content Security Policy configured in HTML meta tags
- Service worker only registers in production (not localhost)
- Form validation and XSS prevention ready
- HTTPS-ready with proper headers

### Development Notes

- Python HTTP server recommended for development due to CORS considerations
- Express server provides compression and is production-ready
- Tailwind CSS must be rebuilt after modifying input.css or config
- Service workers are automatically disabled/cleared in localhost environment
- GitHub Actions deploy to GitHub Pages with custom domain (vipspot.net)