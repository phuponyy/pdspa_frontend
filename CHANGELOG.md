# Changelog

All notable changes to the frontend will be documented in this file.

## 2026-01-28
### Added
- SEO tools (score, keyword density, SERP preview, schema templates) for posts/pages and home meta editor.
- Redirect manager UI and admin routes/constants wiring.
- CSP nonce support on public pages (middleware + RootLayout meta).
- HTML sanitization helper (sanitize-html) on client side.
- Textarea UI component.

### Changed
- Admin API client now sends X-CSRF-Token on refresh.
- Middleware resolves redirects with short TTL cache and safe target validation.
- RootLayout reads nonce from request headers for CSP.

### Fixed
- Various admin UI permissions to include manage_redirects.
