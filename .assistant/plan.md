# Plan

Current development plan organized by timeframe.

---

## Now (Current Sprint)

**Focus**: Foundation solidification and documentation completeness

### M1 — Analytics Parity Validation
- [x] Create event mapping matrix (docs/ANALYTICS_PARITY.md)
- [x] Document GA4 ecommerce examples
- [x] Document Matomo MTM setup and triggers
- [x] Create payload validation scripts (test:analytics, test:matomo)
- [ ] Validate end-to-end in Preview environments (GTM + MTM)
- [ ] Document troubleshooting steps for common issues

---

## Next (Upcoming)

**Focus**: Content enrichment and enhanced tracking demonstrations

### M2 — Learn/Resources Section & Content Tracking
- [ ] Complete Learn section content (KB, FAQ, testimonials) → P-001
- [ ] Add annotated content blocks to Home page → P-002
- [ ] Implement content impression/interaction tracking
- [ ] Document content tracking patterns
- [ ] Validate in MTM Preview

### M3 — Donation Flow Polish
- [x] Monthly vs one-time UX nudge
- [x] Persistent monthly default (localStorage)
- [x] Client-side validation
- [x] Error tracking via donation_step events
- [ ] Add step progress indicator
- [ ] Enhanced error messaging
- [ ] Track abandonment by step

---

## Later (Backlog)

**Focus**: Advanced features and optimization

### M4 — Experimentation & Personalization
- [ ] Simple Optimizely Web experiment example → P-004
- [ ] ODP SDK usage examples → P-013
- [ ] Experiment tracking event examples
- [ ] Consent-aware activation patterns

### M5 — Product Catalog Enhancements
- [ ] Price filters and sorting → P-005
- [ ] Product variants (size, color)
- [ ] Coupon code support
- [ ] Empty states and error handling

### M6 — Performance & Accessibility
- [ ] Accessibility audit and fixes → P-006
- [ ] Image pipeline optimization → P-011
- [ ] Lazy loading implementation
- [ ] Lighthouse score optimization

### M7 — Extended Analytics
- [ ] GA4 ecommerce extensions → P-009
- [ ] Matomo ecommerce extensions → P-010
- [ ] sGTM comprehensive documentation → P-012
- [ ] Custom dimension examples

### M8 — Developer Experience
- [ ] Config schema validation → P-007
- [ ] Fake order generation script → P-008
- [ ] Enhanced debugging tools
- [ ] Automated E2E tests (optional)

---

## Dependencies
- M2 depends on M1 (analytics foundation)
- M4 depends on M1 (experiment tracking needs analytics)
- M7 depends on M1 (extensions build on core)
- P-012 (sGTM) depends on ADR-002 (GDPR compliance) 
