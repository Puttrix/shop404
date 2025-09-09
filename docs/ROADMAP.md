# MockShop Roadmap

Purpose: A lightweight, living document to capture ideas, plans, and progress.

## How To Use
- Add ideas under Backlog with a short, action‑oriented title and a 1–2 line note.
- When you start something, move it to In Progress; when finished, move to Done with a date.
- Log noteworthy decisions with a date under Decisions.

## Themes
- Analytics & Tagging: GTM/GA4, Matomo, ODP integration and event quality.
- Experimentation & Personalization: Optimizely Web, consent-aware activation, variation hooks.
- UX & Flows: Ecommerce journey polish, donation wizard clarity and conversion.
- Infra & DevEx: Build, preview, Docker/Portainer deployment, configuration ergonomics.
 - Consent & Privacy: Google Consent Mode v2, category mapping, governance.

## Milestones
- M0 — Foundations: Project scaffolding, basic flows, consent, minimal analytics (DONE)
- M1 — Analytics Parity: Validate key events, docs, sample dashboards
- M2 — Donation Enhancements: A/B test hooks, step analytics, error states
- M3 — Catalog & Checkout Polish: Variants, coupons, empty states, accessibility

## In Progress
 
 
 

## Backlog (Ideas)
  
  
- [ ] Learn/Resources section (KB, FAQs, Reviews)
  - New top-level section next to Products/Donate: `/learn` landing with categories, `/learn/articles/:slug`, `/learn/faq`, `/learn/testimonials`.
  - Seed 2 KB articles (Sizing, Care), 1 FAQ set, and 4–6 testimonials.
  - Annotate cards/CTAs with Matomo Content Tracking (impressions/interactions) and trigger SPA scans.
  - GA4: `select_content`, `search`, `article_read` events (optional follow-up).
- [ ] Matomo Content Tracking — richer content blocks
  - Add 2–3 annotated content pieces on Home (e.g., PromoBanner, TeaserCards, USP/Trust bar) to demo content impressions/interactions.
  - Markup: use `matomoTrackContent` + `data-content-name`, `data-content-piece`, `data-content-target`.
  - SPA: trigger `_paq.push(['trackContentImpressionsWithinNode', document])` on route changes; add IntersectionObserver to track visible impressions only.
  - Interactions: `_paq.push(['trackContentInteraction', 'click', name, piece, target])` on CTA clicks.
  - Consent-aware: gate behind analytics consent; validate in MTM preview.
- [ ] Matomo ecommerce: product/category details alignment and totals
- [ ] Add simple experiment example with Optimizely (text/image swap)
 
- [ ] Add price filters/sort on product list; push `view_item_list` params
- [ ] Basic accessibility sweep (focus order, landmarks, color contrast)
- [ ] Add `config.json` schema validation and helpful 404 fallback
- [ ] CLI script to generate fake orders for analytics testing
// moved to In Progress → Portainer deploy docs
 
 - [ ] GA4 ecommerce — extensions (promotions, refunds, more steps)
   - Add `add_payment_info`, `add_shipping_info`, promotions impressions/clicks, and refunds examples.
 - [ ] Matomo ecommerce — extensions (cart updates, item/category enrichment)
   - Add `trackEcommerceCartUpdate`, category hierarchies, and product dimension enrichment.
 - [ ] Image pipeline polish
   - Add lazy-loading thresholds and skeletons; optional blur-up placeholders.
   - Optional CDN path config for photos.
  - [ ] Server‑side GTM (sGTM) option
     - Add optional first‑party endpoint config (e.g., `GTM_SERVER_CONTAINER_URL`) and route measurement via sGTM.
     - Forward consent to sGTM; document Consent Mode + sGTM interplay and client hints.
     - Provide setup notes: DNS (CNAME), custom domain, preview, and verification.
     - Add docs/examples for GA4 via Measurement Protocol with sGTM fallback when JS blocked.
       - Note: GDPR grey area — often not acceptable in the EU without strict safeguards and a valid legal basis.

## Done
- [x] Analytics parity: event mapping matrix and QA checklist — 2025‑09‑05
 - [x] GA4 ecommerce — basic measures — 2025‑09‑05
 - [x] Matomo Tag Manager container setup notes and trigger mapping examples — 2025‑09‑05
 - [x] Matomo ecommerce — basic measures — 2025‑09‑05
 - [x] Donation wizard polish: monthly vs one‑time UX, validation, error tracking — 2025‑09‑05
 - [x] Portainer deploy docs: env matrix, screenshots, common pitfalls — 2025‑09‑05
- [x] Create persistent memory file for assistant context — 2025‑09‑03
- [x] Roadmap adoption in repo and README link — 2025‑09‑03
- [x] GTM-first implementation (GA4 inside GTM; no direct GA4) — 2025‑09‑03
- [x] Google Consent Mode v2 integration with banner — 2025‑09‑03
 - [x] Matomo Tag Manager adoption (MTM-only) — 2025‑09‑03
 - [x] GA4 ecommerce item schema examples per event — 2025‑09‑05
 - [x] Sample GTM container mapping guide — 2025‑09‑05
- [x] Donation: support monthly vs one‑time UX nudge and defaulting — 2025‑09‑05
 - [x] Block indexing in prod (robots meta/header/robots.txt) — 2025‑09‑05
 - [x] Responsive header with mobile menu + animation — 2025‑09‑05
 - [x] Neo design shell (classic toggle hidden by default) — 2025‑09‑05
 - [x] Product photos + WebP script (`npm run images:webp`); hero light/dark switching — 2025‑09‑05

## Parking Lot
- [ ] ODP web SDK example usage (identify/track) contingent on account access
- [ ] Server‑side tagging examples (out of scope for static demo)

## Decisions
- 2025‑09‑03: Store assistant memory at `.codex/memory.json` for cross‑session context.
 - 2025‑09‑03: Adopt GTM-first strategy — GA4 implemented inside GTM; GTM always loads.
 - 2025‑09‑03: Use Matomo Tag Manager only (no direct tracker fallback).
 - 2025‑09‑03: Implement Google Consent Mode v2 and map banner categories to consent signals.
