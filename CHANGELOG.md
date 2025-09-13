# Changelog

All notable changes to VIPSpot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Professional release management system
- Automated changelog generation

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

[Unreleased]: https://github.com/CoderRvrse/vipspot/compare/v2025.09.13-patch...HEAD
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
