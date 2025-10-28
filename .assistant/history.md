# History

Condensed timeline of major milestones and decisions.

---

## 2025-09-05: Analytics Parity & Documentation Push

**Achievements**:
- Completed analytics parity documentation (ANALYTICS_PARITY.md)
- Added GA4 ecommerce examples (GA4_ECOMMERCE_EXAMPLES.md)
- Documented Matomo Tag Manager setup (MATOMO_ECOMMERCE_MAPPING.md)
- Created sample GTM container guide (GTM_CONTAINER.md)
- Implemented donation wizard enhancements (monthly/one-time UX, validation, error tracking)
- Added Portainer deployment documentation
- Completed Neo design shell
- Implemented responsive header with mobile menu
- Added product photo pipeline with WebP generation
- Implemented hero image theme switching
- Blocked indexing in production

**Decisions**:
- ADR-001: GTM-first strategy (GA4 configured inside GTM)
- ADR-003: Matomo Tag Manager only (no direct tracker)
- ADR-004: Google Consent Mode v2 integration

---

## 2025-09-03: Project Foundation & Memory System

**Achievements**:
- Created .codex/memory.json for persistent context
- Adopted ROADMAP.md as living planning document
- Established GTM-first implementation
- Integrated Google Consent Mode v2
- Migrated to Matomo Tag Manager (MTM-only)

**Decisions**:
- Store assistant memory in .codex/
- GTM always-loads pattern with consent gating
- MTM exclusively for Matomo tracking
- Map consent categories to Consent Mode signals

---

## Pre-September 2025: Initial Development

**Achievements**:
- Project scaffolding: Vite + React + Tailwind
- Core ecommerce flow: listings, detail, cart, checkout, confirmation
- Multi-step donation wizard (SPA)
- Consent banner with category controls
- Analytics helpers (src/utils/analytics.js)
- Learn/Resources section (articles, FAQ, testimonials)
- Matomo Content Tracking integration
- Docker deployment support
- Express server for static + runtime config

**Technical Decisions**:
- React Router for SPA navigation
- Tailwind utility-first CSS
- Context-based cart state with localStorage
- Runtime config via /config.json
- Early tag loading in index.html

---

## Key Technical Milestones

### Analytics
- GTM/GA4 via dataLayer; Matomo via _mtm
- Events: page_view, view_item_list, view_item, add_to_cart, begin_checkout, purchase, donation_step
- Matomo cart parity with update_cart (full cart state)
- Content impression/interaction tracking

### Consent
- Google Consent Mode v2 defaults (denied)
- Banner updates via gtag('consent', 'update')
- Matomo consent via _paq.requireConsent + rememberConsentGiven
- Category mapping: analytics_storage ↔ analytics; ad_* ↔ marketing

### UI/UX
- Dark mode with system/manual toggle
- Neo style shell (glass/gradient)
- Responsive header with mobile menu
- Product image pipeline (WebP fallbacks)
- Cart button pulse notification

### Deployment
- Docker containerization
- Docker Compose configurations
- Portainer support
- Runtime environment configuration
- GHCR publishing workflow
