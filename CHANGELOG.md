# Changelog

All notable changes to VIPSpot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Professional release management system
- Automated changelog generation

## [2025.09.17-fix.4] - 2025-09-17

### Changed
- fix(csp): resolve Plausible script loading by removing redundant script-src

- Remove duplicate script-src directive that was conflicting
- Keep script-src-elem 'self' https://plausible.io for external scripts
- Resolves CSP violation: "script-src-elem was not explicitly set"
- All guards pass (API, Plausible alignment)

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-authored-by: Claude <noreply@anthropic.com>

## [2025.09.17-fix.3] - 2025-09-17

### Changed
- fix(csp): restore working baseline with style/img/manifest + keep API & Plausible

- Add default-src 'self' for baseline resource loading
- Add style-src 'self' 'unsafe-inline' for CSS and inline styles
- Add img-src 'self' data: for images and data URIs
- Add manifest-src 'self' for web app manifest
- Keep existing API host and Plausible analytics allowances
- All guards pass (API, Plausible, Discord CTA, analytics)

Fixes deployment issue where overly strict CSP blocked essential resources.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-authored-by: Claude <noreply@anthropic.com>

## [2025.09.17-fix.2] - 2025-09-17

### Changed
- fix(csp): include API host in connect-src and form-action

- Add https://vipspot-api-a7ce781e1397.herokuapp.com to CSP connect-src for API calls
- Add API host to form-action for contact form submissions
- Create guard script to ensure API origin remains in CSP
- All existing guards pass (Plausible, Discord CTA, analytics)

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-authored-by: Claude <noreply@anthropic.com>

## [2025.09.17-chore.2] - 2025-09-17

### Changed
- chore(ci): nudge Pages build for analytics

## [2025.09.17-feat] - 2025-09-17

### Changed
- feat(analytics): featured_pen_click + engagement heartbeat; universal analytics guard (#29)

* feat(analytics): runtime Plausible ping + discord_cta_click; add multi-page CSP/Plausible guard

- Add js/analytics-hooks.js for runtime Plausible events without inline handlers
- Log "Plausible ready for vipspot.net" once loaded
- Send discord_cta_click event with placement:footer props on CTA click
- Add scripts/guard-csp-plausible-all.sh to enforce CSP/Plausible alignment across all HTML pages
- Add tests/check-analytics-hooks.sh to verify analytics script references
- Maintain CSP cleanliness with no inline JavaScript
- All existing guards retained and passing

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>

* feat(analytics): featured_pen_click + engagement heartbeat; universal analytics guard

- Extend js/analytics-hooks.js with enhanced event tracking:
  • featured_pen_click on CodePen cards/links with pen_id and placement props
  • reading_time heartbeat every 30s with duration_seconds and page props
  • page_focus/page_blur on visibility change for engagement quality
- Add scripts/guard-analytics-universal.sh to ensure all site pages have analytics
- Maintain CSP compliance with no inline JavaScript
- All existing guards pass and analytics coverage is universal

Events added:
- discord_cta_click: { placement: 'footer' }
- featured_pen_click: { pen_id: 'abc123', placement: 'portfolio' }
- reading_time: { duration_seconds: 30, page: '/path' }
- page_focus/page_blur: engagement quality tracking

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>

---------

Co-authored-by: Claude <noreply@anthropic.com>

### 🎨 CodePen Showcase
This release includes CodePen-related enhancements:
- **Rocket Back-to-Top** → [Demo](https://codepen.io/CoderRvrse/pen/QwjXGom)
- **3D Card Hover Effect** → [Demo](https://codepen.io/CoderRvrse/pen/VYvNzzN)
- **Matrix Rain Effect** → [Demo](https://codepen.io/CoderRvrse/pen/azvxEZG)
- **Browse All Demos** → [CodePen Profile](https://codepen.io/CoderRvrse)

## [2025.09.17-chore.1] - 2025-09-17

### Changed
- chore(ci): nudge Pages build

## [2025.09.17-fix.1] - 2025-09-17

### Changed
- fix(csp): allow Plausible script + event connect; normalize tag (defer, data-domain) (#27)

- Add Content-Security-Policy meta with script-src and connect-src allowances for plausible.io
- Normalize Plausible tag with defer attribute and correct data-domain="vipspot.net"
- Add guard script to ensure CSP allows Plausible when tag is present
- Maintain tight security policy - only add minimum required origins
- Fixes console CSP violation errors for Plausible analytics

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-authored-by: Claude <noreply@anthropic.com>

## [2025.09.17-fix] - 2025-09-17

### Changed
- fix(footer): compact Discord CTA; remove LinkedIn icon; keep UTM canonical (#26)

- Replace LinkedIn icon in footer social row with compact Discord CTA (pill-only)
- Remove all remaining LinkedIn markup from footer
- Add discord-cta-inline component with proper sizing for icon row
- Ensure no big-orb CTA accidentally placed in footer
- Maintain canonical Discord URL with UTM parameters
- All guards pass (no LinkedIn, CTA present, UTM exact)

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-authored-by: Claude <noreply@anthropic.com>

## [2025.09.17-chore] - 2025-09-17

### Changed
- chore(site): add UTM drift guard for Discord CTA (#25)

* feat(site): add neon Discord CTA, remove LinkedIn references

- Add Discord CTA component with orbital animations and magnetic hover
- Remove all LinkedIn references from site footer
- Create guard scripts to prevent LinkedIn regression
- Add tests to verify Discord CTA implementation
- Maintain CSP safety with inline styles and scripts

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>

* chore(site): add strict UTM drift guard for Discord CTA

- Add assert-discord-url-exact.sh test to prevent UTM parameter drift
- Ensures all Discord CTAs maintain exact canonical URL format
- Integrates with existing LinkedIn and presence guards
- Prevents regression of carefully crafted UTM tracking parameters

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>

---------

Co-authored-by: Claude <noreply@anthropic.com>

## [2025.09.16-fix] - 2025-09-16

### Changed
- fix(ci): improve release workflow with self-test validation (#23)

- Fix quote torture test to avoid unbound variable error
- Add release-patterns.mjs --self-test step for early validation
- Ensure pattern logic is validated before each release attempt

This prevents future drift between commit parsing and release logic.

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-authored-by: Claude <noreply@anthropic.com>

## [2025.09.13-feat.4] - 2025-09-13

### Changed
- feat(footer): replace Twitter with Facebook link (inline SVG, UTM, a11y)

## [2025.09.13-fix.1] - 2025-09-13

### Changed
- fix(ci): refresh package-lock.json for new dev deps + harden guards install

## [2025.09.13-feat.3] - 2025-09-13

### Changed
- feat(ci): add futuristic PR comment bot with intelligent release analysis

## [2025.09.13-feat.2] - 2025-09-13

### Changed
- feat(ci): add production-grade CI/CD polish enhancements

## [2025.09.13-chore] - 2025-09-13

### Changed
- chore(release): update CHANGELOG for v2025.09.13-feat.1

## [2025.09.13-feat.1] - 2025-09-13

### Changed
- feat(ci): implement shared release patterns with lockstep synchronization

## [2025.09.13-feat] - 2025-09-13

### Changed
- feat(ci): add commit type matcher guard for release workflow

## [2025.09.13-patch.1] - 2025-09-13

### Changed
- chore(release): update CHANGELOG for v2025.09.13-patch

## [2025.09.13-patch] - 2025-09-13

### Changed
- chore(release): update CHANGELOG for v2025.09.13-fix

## [2025.09.13-fix] - 2025-09-13

### Changed
- fix(ci): use heredoc for commit message in release workflow

## [2025.09.12-fix.1] - 2025-09-12

### Changed
- fix(ci): simplify UI tests workflow - focus on DOM markers over Jest coverage

## [2025.09.12-feat.2] - 2025-09-12

### Changed
- feat(ui): VIPSpot back-to-top + CI network fixes (#17)

## [2025.09.12-fix] - 2025-09-12

### Changed
- fix(git): ignore Jest coverage files

## [2025.09.12-feat.1] - 2025-09-12

### Changed
- feat: complete next-level portfolio enhancements - analytics, testing, demos

## [2025.09.12-feat] - 2025-09-12

### Changed
- feat: add comprehensive MkDocs documentation system + embedded demos

## [2025.09.12-docs] - 2025-09-12

### Changed
- docs(readme): add comprehensive badge suite with future-ready analytics

## [2025.09.11-feat] - 2025-09-11

### Changed
- feat(release): add automated release management with CHANGELOG and tagging

## [2025.09.11] - 2025-09-11

### Added
- Comprehensive documentation refresh
- README.md with architecture diagram and full API documentation
- CLAUDE.md operator playbook for AI assistance
- Professional environment variables documentation with examples
- Ready-to-run curl examples for API testing
- Security posture and troubleshooting guides

### Changed
- Complete rewrite of README.md from basic API documentation to comprehensive portfolio guide
- Enhanced CLAUDE.md with detailed operational procedures and guard failure playbooks
- Improved branch protection with proper status check requirements

### Fixed
- Email-strings guard compliance by redacting legacy domain references
- Featured Pens canonical links with proper UTM parameters
- All CI/CD guard checks now passing

## [2025.09.10] - 2025-09-10

### Fixed
- Matrix Rain Effect anchors canonicalized to CodePen everywhere
- Consistent Featured Pens linking across all components

## [2025.09.09] - 2025-09-09

### Added
- Production-grade Featured Pens guards with branding consistency tests
- UTM parameter enforcement for CodePen links
- Comprehensive link verification system

### Changed
- CI/CD pipeline enhanced with Pages deployment on main branch
- Featured Pens links updated to canonical CodePen URLs

### Fixed
- 3D Card Hover Featured Pen link updated to proper CodePen canonical format
- Matrix Rain Effect Featured Pen link canonicalized with UTM tracking

## [2025.09.08] - 2025-09-08

### Added
- Email migration to contact@vipspot.net
- Cloudflare email routing configuration
- Guards workflow for email domain validation

### Changed
- All contact references updated to contact@vipspot.net
- Email routing moved from legacy domains to professional Cloudflare setup

### Fixed
- CORS configuration updated for new contact pipeline
- API endpoint security headers enhanced

### Security
- Legacy email domain blocking enforced via CI guards
- Contact pipeline hardened with proof ticket VIP-8472KR4J

## [2025.09.04] - 2025-09-04

### Added
- Auto-deploy workflow for API changes
- Smoke tests for health and CORS endpoints
- Heroku deployment automation

### Changed
- API deployment process fully automated on api/** changes

## [2025.09.02] - 2025-09-02

### Added
- Content Security Policy (CSP) implementation
- Production-grade security headers

### Fixed
- CSP policy refined to eliminate 'unsafe-inline'
- External stylesheets properly whitelisted
- Console warnings cleaned up in production

### Security
- Strict CSP preventing XSS attacks
- Google Fonts and CDN styles properly configured

## [2025.09.01] - 2025-09-01

### Added
- Initial VIPSpot 2025 release
- Express.js API with contact form functionality
- Node.js backend with Resend email integration
- GitHub Pages frontend deployment
- Matrix background effects and neon UI components
- 3D tilt effects for tech stack showcase
- Comprehensive accessibility features (ARIA compliance)
- PWA-style user experience

### Security
- Rate limiting (1 request per 30 seconds per IP)
- Timing guard (≥3s) to prevent bot submissions
- CORS whitelisting for allowed origins
- Helmet security middleware
- Request correlation via X-Request-ID headers

---

## Release Types

- **Major** (vYYYY.MM.DD): Significant feature additions or breaking changes
- **Feature** (vYYYY.MM.DD-feat): New features or enhancements
- **Fix** (vYYYY.MM.DD-fix): Bug fixes and security patches
- **Docs** (vYYYY.MM.DD-docs): Documentation updates and improvements

[Unreleased]: https://github.com/CoderRvrse/vipspot/compare/v2025.09.17-fix.4...HEAD
[2025.09.11]: https://github.com/CoderRvrse/vipspot/compare/v2025.09.10...v2025.09.11
[2025.09.10]: https://github.com/CoderRvrse/vipspot/compare/v2025.09.09...v2025.09.10
[2025.09.09]: https://github.com/CoderRvrse/vipspot/compare/v2025.09.08...v2025.09.09
[2025.09.08]: https://github.com/CoderRvrse/vipspot/compare/v2025.09.04...v2025.09.08
[2025.09.04]: https://github.com/CoderRvrse/vipspot/compare/v2025.09.02...v2025.09.04
[2025.09.02]: https://github.com/CoderRvrse/vipspot/compare/v2025.09.01...v2025.09.02
[2025.09.01]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.01
[2025.09.11-feat]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.11-feat
[2025.09.12-docs]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.12-docs
[2025.09.12-feat]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.12-feat
[2025.09.12-feat.1]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.12-feat.1
[2025.09.12-fix]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.12-fix
[2025.09.12-feat.2]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.12-feat.2
[2025.09.12-fix.1]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.12-fix.1
[2025.09.13-fix]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.13-fix
[2025.09.13-patch]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.13-patch
[2025.09.13-patch.1]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.13-patch.1
[2025.09.13-feat]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.13-feat
[2025.09.13-feat.1]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.13-feat.1
[2025.09.13-chore]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.13-chore
[2025.09.13-feat.2]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.13-feat.2
[2025.09.13-feat.3]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.13-feat.3
[2025.09.13-fix.1]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.13-fix.1
[2025.09.13-feat.4]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.13-feat.4
[2025.09.16-fix]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.16-fix
[2025.09.17-chore]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.17-chore
[2025.09.17-fix]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.17-fix
[2025.09.17-fix.1]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.17-fix.1
[2025.09.17-chore.1]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.17-chore.1
[2025.09.17-feat]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.17-feat
[2025.09.17-chore.2]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.17-chore.2
[2025.09.17-fix.2]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.17-fix.2
[2025.09.17-fix.3]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.17-fix.3
[2025.09.17-fix.4]: https://github.com/CoderRvrse/vipspot/releases/tag/v2025.09.17-fix.4
