# ADR-003: Matomo Tag Manager Only (No Direct Tracker)

**Status**: Accepted  
**Date**: 2025-09-03  
**Deciders**: Project team  
**Tags**: analytics, matomo, mtm, architecture

---

## Context

The project needs Matomo analytics integration to demonstrate multi-platform tracking. Two implementation approaches exist:
1. Direct Matomo tracker (JavaScript snippet)
2. Matomo Tag Manager (MTM) container

Parallel to ADR-001 (GTM-First), we need to decide on Matomo implementation strategy.

### Options Considered

1. **Direct Tracker Only**: Traditional Matomo JS snippet in HTML
2. **MTM Only**: All Matomo tracking via tag container
3. **Hybrid**: Direct tracker with supplemental MTM tags
4. **Dual Implementation**: Both direct + MTM for comparison

---

## Decision

We will implement **Matomo Tag Manager (MTM) only** where:
- MTM container loads early when `MATOMO_TAG_MANAGER_CONTAINER_URL` configured
- No direct Matomo tracker snippet included
- Events pushed to `window._mtm` array (mirroring `dataLayer` pattern)
- Consent enforced via `_paq.requireConsent()` + consent events
- MTM consumes same event data as GTM (where applicable)

---

## Rationale

### Advantages
- **Parity with GTM**: Demonstrates consistent tag manager patterns
- **Centralized Management**: All tags configured in MTM interface
- **Consent Orchestration**: Clean consent gating through container
- **Cleaner Client Code**: No hardcoded tracker configuration
- **Educational Value**: Shows proper MTM implementation
- **Reduced Script Bloat**: One container vs multiple snippets

### Trade-offs
- **MTM Requirement**: Users must set up MTM container (not just Matomo)
- **Setup Complexity**: More initial configuration than direct tracker
- **Documentation Load**: Need comprehensive MTM guide

---

## Consequences

### Positive
- Users learn MTM patterns (valuable for enterprise Matomo)
- Tag configuration changes don't require code deploys
- Easier to demonstrate consent-aware tracking
- Simpler comparison with GTM implementation

### Negative
- Additional setup step (create MTM container)
- Users familiar with direct tracker must learn MTM
- Requires MTM-specific documentation

### Neutral
- MTM container adds ~5KB overhead (similar to GTM)
- Early consent requirement (`_paq.requireConsent`) gates all tracking

---

## Implementation Notes

- MTM URL configured via `MATOMO_TAG_MANAGER_CONTAINER_URL`
- App pushes events to `window._mtm` with Matomo-compatible schemas
- Special handling for `update_cart` (full cart state, not incremental)
- Consent events: `cookies_necessary`, `cookies_statistical`, `cookies_marketing`
- Content tracking enabled globally via `_paq.trackAllContentImpressions()`
- Matomo Configuration tag in MTM handles `requireConsent` and site ID

---

## Alternatives Considered

### Direct Tracker
- **Pro**: Simpler initial setup, familiar to Matomo users
- **Con**: Mixes hardcoded config with tag-managed events
- **Con**: Less flexible for configuration changes
- **Rejected**: Doesn't align with tag manager demonstration goals

### Hybrid Approach
- **Pro**: Fallback for users without MTM
- **Con**: Maintenance of two implementations
- **Con**: Confusing for educational purposes
- **Rejected**: Adds complexity without clear benefit

---

## Related

- ADR-001: GTM-First Analytics Architecture (parallel decision)
- ADR-004: Google Consent Mode v2 Integration
- `docs/MATOMO_ECOMMERCE_MAPPING.md`: MTM setup guide
- `docs/ANALYTICS.md`: Matomo integration overview
- `scripts/test-matomo.mjs`: MTM event validation
