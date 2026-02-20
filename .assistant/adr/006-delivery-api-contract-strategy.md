# ADR-006: Delivery API Contract Strategy

**Status**: Proposed  
**Date**: 2026-02-20  
**Deciders**: Project team  
**Tags**: api, integration, contract

---

## Context

TRD references Umbraco Delivery API endpoints and app-facing `/api/content/*` examples. The integration needs a stable contract for frontend consumption and change management.

---

## Decision

Define a versioned application contract for page/navigation/blog/settings reads, with ownership and mapping rules documented before broad frontend migration.

---

## Alternatives Considered

1. Frontend consumes raw Umbraco Delivery API directly.
2. Frontend consumes a repo-owned adapter/facade API.
3. Hybrid approach with direct + adapted endpoints.

---

## Consequences

### Positive
- Clear contract ownership and lower frontend coupling risk.
- Easier compatibility handling during CMS schema evolution.

### Negative
- Additional mapping layer to maintain if adapter is chosen.

### Neutral
- Can start with direct API spike before finalizing adapter.

---

## Related

- `.assistant/canvas/questions.md` (Q-UM-01)
- `.assistant/trd/shop404_Umbraco_Integration_TRD.md`
