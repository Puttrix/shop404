# First Session Plan

**Date**: 2025-10-28  
**Context**: Post-migration to .assistant/ workflow

---

## Migration Summary

Successfully migrated from `.codex/` workflow to `.assistant/` structure:

✅ **Completed**:
- Created `.assistant/` directory with `canvas/` and `adr/` subdirectories
- Migrated vision/mission to `canvas/vision.md`
- Consolidated design notes in `canvas/design.md`
- Documented open questions in `canvas/questions.md`
- Extracted backlog from ROADMAP → `backlog.md` (13 P-IDs with acceptance criteria)
- Transformed roadmap into structured `plan.md` (8 milestones, Now/Next/Later)
- Generated condensed `history.md` from git commits and ROADMAP
- Created comprehensive `status.md` with focus, risks, artifacts, changelog
- Generated 4 ADR documents:
  - ADR-001: GTM-First Architecture
  - ADR-002: Server-Side GTM as Optional Feature (Proposed)
  - ADR-003: Matomo Tag Manager Only
  - ADR-004: Google Consent Mode v2 Integration

---

## Current State

**Focus**: Milestone M1 — Analytics Parity Validation

**Progress**:
- Event mapping documentation ✅
- GA4 payload examples ✅
- Matomo MTM setup guide ✅
- GTM container guide ✅
- Payload validation scripts ✅
- End-to-end preview validation 🚧 (in progress)

**Health**: Overall Green ✓ with Yellow ⚠ on E2E validation and Learn content

---

## Immediate Next Steps (This Session)

### 1. Complete M1 Analytics Parity Validation
**Priority**: High  
**Estimated Time**: 2-3 hours

**Tasks**:
- [ ] Run `npm run test:analytics` to verify GA4 payload structure
- [ ] Run `npm run test:matomo` to verify Matomo cart sync
- [ ] Manual validation in GTM Preview:
  - Load site with analytics consent denied
  - Accept analytics consent
  - Verify events fire: `page_view`, `view_item_list`, `view_item`, `add_to_cart`, `begin_checkout`, `purchase`
  - Check Consent Overview shows proper gating
- [ ] Manual validation in MTM Preview:
  - Verify `_mtm` events arrive
  - Check `update_cart` fires with full cart state
  - Validate consent events: `cookies_statistical`, etc.
- [ ] Document troubleshooting steps in `docs/ANALYTICS_PARITY.md`:
  - Common GTM misconfigurations
  - MTM tag firing issues
  - Consent state problems
  - Transaction ID uniqueness

**Acceptance**: M1 complete when all events validated in both GTM and MTM Preview.

---

### 2. Begin M2 Learn Section Content Creation
**Priority**: High  
**Estimated Time**: 3-4 hours

**Tasks** (P-001):
- [ ] Create 2 KB articles in `src/data/kb.js`:
  - "Hoodie Sizing & Fit Guide" (existing placeholder + expansion)
  - "Care Instructions for Shop404 Apparel"
- [ ] Add FAQ content to `src/data/faqs.js`:
  - Shipping & returns section
  - Product care section
  - Size & fit section
- [ ] Add 4-6 testimonials to `src/data/testimonials.js`:
  - Mix of product-specific and general
  - Include author, role, rating, quote
- [ ] Annotate Learn components with Matomo Content Tracking:
  - Add `matomoTrackContent` class
  - Add `data-content-name`, `data-content-piece`, `data-content-target`
- [ ] Verify `trackContentScan(document)` called on route changes
- [ ] Test content impressions/interactions in MTM Preview

**Acceptance**: Learn section has real, useful content with working content tracking.

---

### 3. Add Annotated Content Blocks to Home
**Priority**: High  
**Estimated Time**: 2-3 hours

**Tasks** (P-002):
- [ ] Design and implement PromoBanner component:
  - Hero CTA or seasonal promotion
  - Annotated with content tracking
- [ ] Add TeaserCards to Home:
  - "New Arrivals", "Learn More", "Support"
  - Link to products, learn section, etc.
- [ ] Implement IntersectionObserver for visible-only impressions:
  - Track when content enters viewport
  - Avoid counting off-screen impressions
- [ ] Add `trackContentClick` calls on CTA clicks
- [ ] Gate behind analytics consent
- [ ] Validate in MTM Preview:
  - Check content impressions on page load
  - Check content interactions on clicks

**Acceptance**: Home page has 2-3 tracked content blocks visible in Matomo reports.

---

## Secondary Priorities (If Time Permits)

### 4. Finalize ADR-002 Decision
**Priority**: Medium  
**Estimated Time**: 1 hour

**Tasks**:
- [ ] Review sGTM GDPR implications
- [ ] Decide: Accept with warnings, or Remove feature
- [ ] Update ADR-002 status from "Proposed" to "Accepted" or "Rejected"
- [ ] If accepted: add P-012 to current sprint
- [ ] If rejected: remove sGTM references from codebase

---

### 5. Accessibility Quick Audit
**Priority**: Low  
**Estimated Time**: 1-2 hours

**Tasks** (P-006 partial):
- [ ] Tab through all major pages, verify focus order
- [ ] Check basic ARIA landmarks (`main`, `nav`)
- [ ] Run axe DevTools on key pages
- [ ] Document findings in backlog for full P-006 implementation

---

## Success Criteria for This Session

**Must Have**:
- ✅ M1 validation complete (GTM + MTM Preview tested)
- ✅ Troubleshooting steps added to `docs/ANALYTICS_PARITY.md`
- ✅ M2 started: KB articles, FAQ, testimonials content created
- ✅ M2 started: Content tracking annotations added

**Nice to Have**:
- ✅ P-002 complete (Home page content blocks)
- ✅ ADR-002 decision finalized
- ✅ Accessibility quick audit completed

---

## Session Wrap-Up Checklist

Before ending session:
- [ ] Update `status.md` with progress
- [ ] Update `plan.md` milestone completion
- [ ] Mark completed backlog items in `backlog.md`
- [ ] Update `history.md` if major milestones reached
- [ ] Create git commit(s) for migration and new content
- [ ] Push to repository

---

## Future Session Hints

**Next Session Focus** (if M1 + M2 complete):
- M3: Donation flow polish (step progress indicator, enhanced errors)
- P-003: Matomo ecommerce product/category details alignment
- P-004: Simple Optimizely experiment example

**Parking Lot Items**:
- Review and potentially close out old `.codex/` directory
- Update main `README.md` to reference `.assistant/` workflow
- Consider adding `.assistant/README.md` for workflow documentation

---

## Resources

**Documentation**:
- `.assistant/status.md` — Current state
- `.assistant/plan.md` — Milestone roadmap
- `.assistant/backlog.md` — P-ID items
- `.assistant/canvas/questions.md` — Open questions
- `docs/ANALYTICS_PARITY.md` — Event mapping and QA

**Scripts**:
- `npm run test:analytics` — GA4 payload validation
- `npm run test:matomo` — Matomo cart sync validation
- `npm run dev` — Local development server

**External Tools**:
- GTM Preview Mode — Tag firing validation
- MTM Preview Mode — Matomo tag validation
- Browser DevTools — Console and Network inspection
