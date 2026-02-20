# ADR-007: React CMS Service and Block Registry Pattern

**Status**: Accepted  
**Date**: 2026-02-20  
**Deciders**: Project team  
**Tags**: frontend, architecture, blocks, react

---

## Context

CMS content must be rendered by existing React routes/components while handling unknown block types and partial data safely.

---

## Decision

Introduce:
- `cmsService` for API access and DTO mapping.
- A block registry mapping Umbraco block aliases to React components.
- Explicit fallback behavior for unknown blocks and missing fields.
- Routing model: reserved application routes are matched first; non-reserved paths use CMS lookup; unresolved slugs return 404.

---

## Alternatives Considered

1. Inline API fetches and block rendering per page.
2. Centralized service + block registry (chosen direction).
3. Generic renderer with no alias-specific components.

---

## Consequences

### Positive
- Reusable integration pattern across multiple page types.
- Easier testability for mapping and rendering fallbacks.

### Negative
- Requires upfront structure and mapping conventions.

### Neutral
- Initial migration may include dual rendering paths during cutover.

---

## Related

- `.assistant/backlog.md` (P-103, P-104, P-105)
- `.assistant/canvas/design.md`
