# MVP Sprint Plan (3 Sprints, 3 Weeks Each = ~9 Weeks)

## Team Assumptions

- 2 FE engineers, 2 BE engineers, 1 Full-stack, 1 Designer, 1 PM, 1 QA
- DevOps shared support

---

## Sprint 1 (Weeks 1–3): Foundations, Builder, Links, Auth

Goals:

- Ship functional editor, core blocks, link management, auth
- Establish performance budgets and edge rendering

Scope:

- Epic B: Page Builder (hero, links list/grid/cards, FAQ, social icons), drag-and-drop, live preview (mobile toggle)
- Epic C: Link Management (CRUD, reorder, grouping, scheduling/expiration, deep links)
- Epic J: Accounts & Security (Email + Google OAuth; email verification; password reset; session mgmt)
- Epic I: Performance/SEO baseline (static/edge rendering, CDN, lazy-load, image optimization)
- Epic 9 Non-functional: Accessibility components baseline, Lighthouse CI

Deliverables:

- Editor SPA + public page rendering pipeline
- 10 templates with presets (visual polish can continue in Sprint 2)
- Link scheduling with status labels
- Basic SEO fields; OG/Twitter defaults
- CI with perf budgets

Exit Criteria:

- Create → Edit → Publish end-to-end works
- LCP ≤ 1.9s (temporary) with target 1.5s by Sprint 2
- No P0 defects in editor or publish flow

---

## Sprint 2 (Weeks 4–6): Analytics v1, Domains, Integrations, Safety

Goals:

- Enable measurement, custom domains with auto‑SSL, and core integrations

Scope:

- Epic E: Analytics v1 (views, uniques, clicks, CTR; device/geo; per-link; date filters; CSV export)
- Epic D: Domains & URLs (custom domain mapping, DNS checks, auto-SSL, status)
- Epic G: Integrations v1 (Mailchimp, ConvertKit, Calendly; pixels Meta/TikTok/Google)
- Epic H: Trust & Safety (Safe Browsing at link create/update; reCAPTCHA v3; rate limiting; abuse reporting)
- Epic I: Security hardening (HSTS, CSP/SRI, secrets mgmt), SEO sitemap/robots

Deliverables:

- Event pipeline (edge collection → queue → batch insert), real-time counters + aggregates
- Domains UI with verification and SSL automation
- Integrations UI with health status; pixel loaders respecting consent
- Abuse report flow and moderation queue

Exit Criteria:

- Analytics accuracy within ±5% (target ±3% by Sprint 3)
- Domain setup <5 minutes in happy path; automated SSL successful
- Pixels firing and verifiable in respective platforms
- Safe Browsing blocks malicious URLs at creation/update

---

## Sprint 3 (Weeks 7–9): Payments v1, Onboarding AI, Export/Versioning, Polish

Goals:

- Monetization live; “wow” onboarding; portability; performance polish

Scope:

- Epic F: Monetization v1 (Stripe Connect onboarding; SCA; receipts; payouts; tax basics)
- Epic A: Onboarding & Migration (wizard; AI import; Linktree import)
- Epic K: Export & Versioning (JSON export; basic version history/restore)
- Epic I: Performance finalization (hit LCP ≤ 1.5s; CLS < 0.1; JS ≤ 50KB), SEO enhancements
- QA hardening, docs, and release readiness

Deliverables:

- Tip/donation button/block and checkout flow
- Onboarding wizard with template picker and auto-suggested links
- Linktree import tool (public URL)
- Version timeline and one-click restore
- Release notes and help docs

Exit Criteria:

- Payments: <10s tip flow E2E; receipts sent; payouts schedulable; error handling complete
- Analytics accuracy ±3% vs sampled raw events
- Performance budgets met across all templates
- No P0/P1 defects in core funnels (onboard, edit, publish, pay, analytics)

---

## Post-MVP (Next 4–6 Weeks)

- Personalization rules and smart ordering
- A/B testing v1 with auto-winner
- Webhooks + Zapier (Pro) GA with retries and signing
- Multi-language pages groundwork
- Workspaces/roles (basic), client view-only analytics