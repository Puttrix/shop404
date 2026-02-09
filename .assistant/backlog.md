# Backlog

Product backlog with P-IDs, tags, and acceptance criteria.

---

## P-001: Learn/Resources Section Content
- [ ] Complete Learn/Resources section content
      tags: content, analytics, matomo  priority: high  est: 4h
      deps: none
      accepts:
      - Seed 2 KB articles (Sizing, Care) in src/data/kb.js
      - Add 1 FAQ set to src/data/faqs.js
      - Add 4-6 testimonials to src/data/testimonials.js
      - Annotate cards/CTAs with Matomo Content Tracking (matomoTrackContent, data-content-*)
      - Trigger SPA scans on route changes via trackContentScan(document)
      - Verify content impressions/interactions in MTM Preview

## P-002: Matomo Content Tracking - Rich Content Blocks
- [ ] Add annotated content blocks to Home page
      tags: analytics, matomo, ui  priority: high  est: 3h
      deps: none
      accepts:
      - Add PromoBanner, TeaserCards, or USP/Trust bar to Home
      - Markup with matomoTrackContent class + data-content-name|piece|target
      - Implement IntersectionObserver for visible-only tracking
      - Add trackContentClick on CTA clicks
      - Gate behind analytics consent
      - Validate in MTM Preview

## P-003: Matomo Ecommerce - Product/Category Details
- [ ] Enhance Matomo ecommerce tracking details
      tags: analytics, matomo, enhancement  priority: medium  est: 2h
      deps: none
      accepts:
      - Verify category hierarchy mapping (item_category_path)
      - Ensure cart totals match sum(price*qty) in update_cart
      - Add product dimension enrichment
      - Document mapping in docs/MATOMO_ECOMMERCE_MAPPING.md

## P-004: Simple Experiment Example with Optimizely
- [ ] Add basic A/B test example
      tags: experimentation, optimizely, example  priority: medium  est: 3h
      deps: none
      accepts:
      - Add variation code examples in comments/docs
      - Show experiment tracking via custom events
      - Document setup steps for Optimizely users
      - Ensure consent-aware activation
      - Validate experiment activation in console

## P-005: Price Filters & Sort on Product List
- [ ] Add filtering and sorting to products page
      tags: feature, ux, analytics  priority: low  est: 4h
      deps: none
      accepts:
      - Add filter UI (price range)
      - Add sort dropdown (price, name)
      - Push view_item_list params with filters/sort
      - Persist filter state in URL query params
      - Maintain list context in analytics

## P-006: Accessibility Sweep
- [ ] Conduct accessibility audit and improvements
      tags: a11y, ux, compliance  priority: medium  est: 4h
      deps: none
      accepts:
      - Verify focus order on all pages
      - Add proper ARIA landmarks (main, nav, aside)
      - Check color contrast ratios (WCAG AA)
      - Test keyboard navigation (Tab, Enter, Escape)
      - Add skip-to-main-content link
      - Document accessibility features in README

## P-007: Config Schema Validation
- [ ] Add validation for /config.json
      tags: devex, reliability, config  priority: low  est: 2h
      deps: none
      accepts:
      - Define JSON schema for config
      - Add validation on server startup
      - Provide clear error messages
      - Add helpful 404 fallback
      - Document schema in README

## P-008: CLI Script for Fake Orders
- [ ] Generate fake orders for analytics testing
      tags: testing, analytics, devex  priority: low  est: 2h
      deps: none
      accepts:
      - Generate realistic transaction IDs, items, values
      - Push to dataLayer and _mtm in sequence
      - Support configurable count and delay
      - Output summary of generated orders
      - Document usage in README

## P-009: GA4 Ecommerce Extensions
- [ ] Add extended GA4 ecommerce events
      tags: analytics, ga4, enhancement  priority: low  est: 3h
      deps: none
      accepts:
      - Implement add_payment_info event
      - Implement add_shipping_info event
      - Add promotion impressions/clicks examples
      - Add refund event examples
      - Document in docs/GA4_ECOMMERCE_EXAMPLES.md

## P-010: Matomo Ecommerce Extensions
- [ ] Extend Matomo ecommerce tracking
      tags: analytics, matomo, enhancement  priority: low  est: 3h
      deps: none
      accepts:
      - Add trackEcommerceCartUpdate examples
      - Implement category hierarchy enrichment
      - Add product custom dimensions
      - Update docs/MATOMO_ECOMMERCE_MAPPING.md

## P-011: Image Pipeline Polish
- [ ] Enhance image loading performance
      tags: performance, ux, images  priority: low  est: 3h
      deps: none
      accepts:
      - Add lazy-loading with IntersectionObserver
      - Implement blur-up placeholders (optional)
      - Add loading skeletons
      - Document CDN path config option
      - Measure Lighthouse score improvement

## P-012: Server-Side GTM (sGTM) Enhancement
- [ ] Comprehensive sGTM documentation
      tags: analytics, gtm, advanced  priority: low  est: 4h
      deps: ADR-002
      accepts:
      - Document DNS setup (CNAME)
      - Add consent forwarding examples
      - Show client hints configuration
      - Document preview and verification
      - Add GDPR compliance warnings
      - Provide Measurement Protocol fallback
      - Update docs/ANALYTICS.md

## P-013: ODP Web SDK Example Usage
- [ ] Add ODP SDK usage examples
      tags: experimentation, odp, example  priority: low  est: 2h
      deps: account-access
      accepts:
      - Show window.zaius.identify() usage
      - Show window.zaius.track() custom event
      - Document consent requirements
      - Add setup instructions
      - Ensure graceful handling when not configured

## P-014: Assistant Session Kickoff Hygiene
- [x] Refresh assistant status and verify MCP availability
      tags: process, docs, assistant  priority: low  est: 0.5h
      deps: none
      accepts:
      - Validate status staleness against plan/backlog/task_log
      - Refresh .assistant/status.md metadata/artifacts as needed
      - Probe MCP availability for context7, playwright, github
      - Record results in .assistant/task_log.md

## P-015: A/B Test Pre-Testing Page
- [x] Add a dedicated page to pre-test A/B experiments
      tags: experimentation, ux, testing  priority: medium  est: 3h
      deps: none
      accepts:
      - Add route and page scaffold for A/B test pre-validation
      - Include experiment-ready placeholder sections/components
      - Keep UI baseline-only; variants are controlled in Optimizely (no local toggle UI)
      - Make page safe for iterative content changes (content TBD)
      - Add brief usage notes in docs or README section
      - Verify page is reachable and renders in local dev

---

## Parking Lot

Items deferred or out of scope:
- Server-side tagging examples (requires backend infrastructure)
- Multi-container deployment (single container sufficient)
- Additional platforms (Adobe Analytics, Mixpanel, Segment)
