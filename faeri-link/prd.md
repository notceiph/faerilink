# PRD: Faeri Link MVP (V1)

## Document Control

- Owner: Product Management
- Version: 1.0
- Date: Aug 23, 2025
- Status: Draft for team review

---

## 1) Summary

Faeri Link is a high‑performance link‑in‑bio platform optimized for speed, personalization, analytics, and monetization. This PRD defines the MVP scope to launch a competitive product in ~9 weeks (3 sprints), focused on instant onboarding, a flexible page builder, reliable analytics v1, custom domains + SSL, Stripe tips, and core integrations.

---

## 2) Problem Statement

Creators, professionals, and small teams need a single destination link that:

- Publishes in minutes (low setup friction)
- Converts better (smart layouts, deep links, fast load)
- Measures impact (clear analytics, attribution)
- Monetizes (tips/payments) without heavy overhead or compliance stress

Current tools either add bloat (slow pages), lack actionable analytics, or require multiple third‑party services to get paid, which increases complexity and reduces conversion.

---

## 3) Goals (MVP)

- Time-to-first-publish: <10 minutes from sign-up to live page
- Performance: LCP ≤ 1.5s on mid‑range mobile over 4G; public JS ≤ 50KB; CLS < 0.1
- Analytics v1: Accurate (±3% of sampled raw events), useful (views, uniques, clicks, CTR; device, geo; per-link)
- Monetization v1: Stripe tips live (payouts, receipts) for supported regions
- Domains: Custom domain setup with auto‑SSL in <5 minutes
- Reliability: 99.9% uptime target for public pages (GA readiness)
- Security: SSL, CSP/SRI, 2FA available at launch

---

## 4) Non‑Goals (MVP)

- Full live social feed embeds (heavy APIs and rate limits)
- Multivariate testing beyond simple A/B
- Digital product sales (files, license keys, refunds, discounts)
- Personalization rules and smart ordering (ship V2)
- White‑label and advanced agency features (V2)
- Marketplace/app store and plugin/block SDK

---

## 5) Personas & Primary JTBD

- Creators/Influencers: Drive traffic to content, collect tips, track performance by link
- Solo Professionals/SMBs: Route to services/booking, capture leads, measure conversions
- Teams/Agencies (early adopters): Stand up pages for clients, share analytics, manage multiple brands (basic support in MVP via multiple pages per account; advanced roles V2)

---

## 6) Assumptions

- Stripe Connect available for core launch regions (US/EU focus)
- Users will connect pixels (Meta/TikTok/Google) for attribution
- Static/edge-rendered public pages enable best-in-class speed
- Minimal JS on public pages; embeds are lazy-loaded or replaced with static previews

---

## 7) Functional Requirements (MVP)

### 7.1 Onboarding & Migration

- Template picker and guided wizard
- AI import (Instagram/TikTok/YouTube) to suggest bio, avatar, and initial links
- Migration by importing links from public Linktree URL

### 7.2 Page Builder & Customization

- Blocks: Hero, links (list/grid/cards), FAQ, social icons, video/music embeds
- Drag-and-drop editing; mobile-first preview
- 10 templates; color and font presets; background (solid/gradient/image)
- Limited custom CSS (Pro) with sandbox/CSP warning

### 7.3 Link Management

- Add/edit/delete links; custom titles/descriptions
- Drag-and-drop reorder
- Grouping/categorization
- Scheduling (start/end) and expiration
- Deep links/universal links where applicable
- QR code generation (PNG/SVG) per page

### 7.4 Domains & URLs

- Default: [faerilink.com/username](http://flink.com/username)
- Custom domains with automated SSL (Let’s Encrypt)
- DNS guidance with validation and status checks

### 7.5 Analytics v1

- Metrics: page views, unique visitors, clicks, CTR, top links
- Breakdowns: device, geo; per-link metrics
- Date filters; CSV export
- Accuracy within ±3% of sampled raw events

### 7.6 Monetization v1 (Tips/Donations)

- Stripe Connect onboarding
- One-time payments; receipts; payouts; SCA
- Basic regional tax/VAT handling (Stripe Tax where available)

### 7.7 Integrations v1

- Email/newsletter: Mailchimp, ConvertKit
- Scheduling: Calendly
- Pixels: Meta, TikTok, Google
- Automation: Zapier via webhooks (Pro)

### 7.8 Trust, Safety & Compliance

- Safe Browsing link scanning (creation and updates)
- reCAPTCHA v3 on forms; rate limiting; abuse reporting
- Basic moderation queue
- GDPR/CCPA basics: consent banner, data export/delete, DPA

### 7.9 Performance, SEO & Security

- Static/edge rendering of public pages; CDN/edge caching
- Lazy-load embeds; image optimization
- SEO controls: title/meta, OG/Twitter cards, sitemap, robots
- Security: SSL everywhere, HSTS, CSP/SRI, encrypted secrets
- Observability: RUM, logs/traces/metrics

### 7.10 Accounts & Security

- Auth: Email + OAuth (Google/Apple)
- 2FA/TOTP; session/device management
- Profile: avatar, bio, display name
- Multiple pages per account (tiered by plan)

### 7.11 Export & Versioning

- JSON export of page configuration
- Simple version history with one-click restore

---

## 8) Non‑Functional Requirements

- Performance: LCP ≤ 1.5s (4G mobile), CLS < 0.1, public JS ≤ 50KB
- Accessibility: WCAG 2.1 AA components and color contrast enforcement
- Availability: 99.9% uptime target for public pages; graceful degradation
- Security: OWASP Top 10 mitigations; periodic pen tests; audit logs
- Privacy: Consent banner; data retention policy; user rights portal
- Scalability: Edge caching; event pipeline for bursts; rate limits
- Localization: English MVP; i18n architecture ready (V2 feature)

---

## 9) Metrics & Success Criteria

- Activation: % of new users who publish within 24h; median time-to-first-publish; link count at publish
- Adoption: % enabling custom domain; % enabling pixels; % enabling email capture; % enabling tips
- Performance: LCP/CLS; JS payload; error rates; uptime
- Analytics: Coverage vs sampled raw events within ±3%
- Monetization: Free→Paid conversion; GMV; payout success rate
- Engagement: Median page CTR; per-link CTR; WAU/MAU; updates per month
- Safety: Spam rate; blocked links; false positives

---

## 10) Epics, User Stories, Acceptance Criteria

### Epic A: Onboarding & Migration

- Goal: Get users to a live, usable page in minutes.

User Stories:

1. As a new user, I can choose a template and see a guided wizard to set up my page.
2. As a creator, I can import my avatar, bio, and initial links from Instagram/TikTok/YouTube.
3. As a switcher, I can paste a Linktree public URL and import links.

Acceptance Criteria:

- Wizard covers template select, profile details, initial links, publish, share
- AI import suggests at least 5 relevant links when available
- Migration preserves link titles, URLs, and order where possible

### Epic B: Page Builder & Customization

- Goal: Flexible, fast editor with mobile-first output.

User Stories:

1. As a user, I can add, reorder, and configure blocks (hero, links, FAQ, social icons, embeds).
2. As a user, I can switch templates and color/font presets and see instant preview.
3. As a Pro user, I can add limited custom CSS.

Acceptance Criteria:

- Drag-and-drop within and across sections
- Live preview with mobile toggle
- Custom CSS gated by plan with CSP warning modal

### Epic C: Link Management

- Goal: Create, organize, schedule, and deep-link.

User Stories:

1. As a user, I can add/edit/delete links with titles and descriptions.
2. As a user, I can group/categorize links and reorder them.
3. As a user, I can schedule when links go live or expire.
4. As a user, outbound links open native apps when supported (deep links).

Acceptance Criteria:

- Scheduling in local time with clear status (scheduled/active/expired)
- Drag-and-drop reorder persists and reflects on public page
- Deep links work for standard apps (e.g., Spotify, YouTube, WhatsApp)

### Epic D: Domains & URLs

- Goal: Simple, reliable custom domains with SSL.

User Stories:

1. As a user, I get a [faerilink.com/username](http://flink.com/username) by default.
2. As a paying user, I can map a custom domain with auto SSL.

Acceptance Criteria:

- DNS instructions with provider examples
- Automated SSL issuance and renewal; status checks; retry on failure
- Domain setup guided experience completes in <5 minutes under normal DNS propagation

### Epic E: Analytics v1

- Goal: Clear, accurate, actionable basics.

User Stories:

1. As a user, I can see page views, uniques, clicks, CTR for a date range.
2. As a user, I can view top links and per-link metrics.
3. As a user, I can see device and geo breakdowns.
4. As a user, I can export analytics to CSV.

Acceptance Criteria:

- Metrics accuracy within ±3% of sampled raw events
- Date filters: Today, 7/30/90 days, custom range
- Per-link dashboard includes views, clicks, CTR
- CSV export mirrors on-screen filters

### Epic F: Monetization v1 (Tips)

- Goal: Turn attention into revenue quickly.

User Stories:

1. As a creator, I can connect Stripe to accept tips/donations.
2. As a visitor, I can tip in <10 seconds with a simple flow.
3. As a creator, I receive receipts and can see payout status.

Acceptance Criteria:

- Stripe Connect onboarding handled in-product
- SCA-compliant checkout; receipt emailed to payer and confirmation to creator
- Payout status visible; failed payments handled gracefully with error messaging

### Epic G: Integrations v1

- Goal: Plug in common tools easily.

User Stories:

1. As a creator, I can connect Mailchimp/ConvertKit and capture emails.
2. As a professional, I can embed Calendly for booking.
3. As a marketer, I can add Meta/TikTok/Google pixels.
4. As a Pro user, I can trigger Zapier via webhooks on events (form submit, payment, publish).

Acceptance Criteria:

- OAuth or API key setup where applicable; connection health status
- Pixels load conditionally, respecting consent
- Webhooks: reliable delivery with retries and signing

### Epic H: Trust, Safety & Compliance

- Goal: Keep pages safe and compliant.

User Stories:

1. As an admin, I want unsafe links auto-flagged/blocked using Safe Browsing.
2. As an owner, I want forms protected from spam with reCAPTCHA and rate limits.
3. As a user, I can report abuse.

Acceptance Criteria:

- Safe Browsing at link creation/update; clear error messaging
- reCAPTCHA v3 on forms; rate limit thresholds; admin queue for flags
- Abuse report form routes to moderation with tracking ID

### Epic I: Performance, SEO & Security

- Goal: Best-in-class speed and discoverability.

User Stories:

1. As a visitor, pages load fast on mobile networks.
2. As a creator, I can set SEO title/description and OG/Twitter images.
3. As engineering, we ship with SSL, HSTS, CSP/SRI, and encrypted secrets.

Acceptance Criteria:

- LCP ≤ 1.5s on mid-range mobile over 4G; CLS < 0.1; public JS ≤ 50KB
- SEO fields per page; auto sitemap; robots control
- Security headers verified in production; secrets management in place

### Epic J: Accounts & Security

- Goal: Simple sign-in with strong protection.

User Stories:

1. As a user, I can sign up with email or Google/Apple.
2. As a user, I can enable 2FA and manage active sessions/devices.
3. As a user, I can manage profile details and multiple pages (plan-limited).

Acceptance Criteria:

- Email verification; OAuth flows; password resets
- TOTP setup with recovery codes
- Session/device list with revoke capability

### Epic K: Export & Versioning

- Goal: Portability and safety net.

User Stories:

1. As a user, I can export my page configuration to JSON.
2. As a user, I can restore a previous version of my page.

Acceptance Criteria:

- Export includes layout, links, styles, integrations metadata (no secrets)
- Version timeline with timestamp and author; restore with confirmation

---

## 11) Data Model (MVP, High-Level)

- User: id, auth, profile, plan, 2FA settings
- Page: id, user_id, slug, domain, theme, styles, status, versions
- Block: id, page_id, type, position, config (hero, links, faq, embeds)
- Link: id, page_id, title, url, group, position, schedule (start/end), status
- AnalyticsEvent: id, page_id, link_id?, timestamp, device, geo, ref, type (view/click)
- Integration: id, page_id, type, creds (encrypted), status
- Payment: id, page_id, stripe_ids, amount, currency, status, receipt_email
- Report/Flag: id, page_id, reason, status

---

## 12) Dependencies & Risks

- Stripe availability and account verification (mitigate with region gating)
- DNS propagation variability (mitigate with clear status and checks)
- Social API changes affecting AI import (mitigate with scraping fallbacks and static previews)
- Analytics privacy/consent (mitigate with consent banner and cookieless mode toggle for V2)

---

## 13) QA Strategy

- Cross-device/mobile testing matrix (iOS/Android mid-range devices)
- Synthetic performance tests (Lighthouse CI) with budgets enforced in CI
- Security scanning (SAST/DAST), dependency audits
- Payment sandbox flows (Stripe test keys) including error scenarios
- Analytics validation against sampled raw events (±3%)

---

## 14) Release Criteria (MVP)

- Performance budgets met across all templates
- Domain mapping with auto-SSL verified across at least 3 major DNS providers
- Stripe tips live in at least 2 regions; receipts/payouts verified
- Analytics dashboards match sampled raw events within ±3%
- Trust & Safety scanning and abuse reporting functioning
- No P0/P1 defects in core flows (onboarding, edit, publish, pay, analytics)

---

## 15) Open Questions

- Do we gate CSV export behind Starter or include in Free during launch window?
- Which countries to include in initial Stripe rollout?
- Do we include Substack integration in MVP or defer to V2?
- Should we include an “unlisted” page privacy mode in MVP?