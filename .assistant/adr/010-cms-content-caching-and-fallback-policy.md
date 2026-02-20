# ADR-010: CMS Content Caching and Fallback Policy

**Status**: Accepted  
**Date**: 2026-02-20  
**Deciders**: Project team  
**Tags**: caching, reliability, api, frontend

---

## Context

CMS-backed content introduces runtime dependency risk for page rendering and navigation metadata. We need predictable performance and graceful degradation during CMS outages.

---

## Decision

Adopt layered caching with adapter-owned fallback behavior.

Policy:
- Adapter endpoints (`/api/content/*`) are cache boundary.
- Use edge cache and browser cache together.
- Prefer short edge TTL + stale-while-revalidate behavior.
- Keep browser cache short to avoid long-lived stale content.
- On Umbraco failure:
  - return last-known-good cached payload when available,
  - otherwise return static fallback payload for critical marketing pages,
  - otherwise return graceful temporary-unavailable response.
- Code-owned transactional routes are not CMS-dependent.

---

## Alternatives Considered

1. Browser-only cache.
2. Edge-only cache with no client cache.
3. Layered edge + browser cache with fallback policy.

---

## Consequences

### Positive
- Better resilience to transient CMS downtime.
- Faster response times from cacheable content endpoints.
- Explicit failure behavior reduces ambiguous frontend handling.

### Negative
- Requires cache invalidation/purge strategy after publish.
- Adds operational complexity in adapter implementation.

### Neutral
- Initial implementation may rely on TTL-based staleness before publish-webhook purge is added.

---

## Related

- `.assistant/canvas/questions.md` (Q-UM-03)
- `.assistant/backlog.md` (P-113)
