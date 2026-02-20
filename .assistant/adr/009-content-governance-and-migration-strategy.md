# ADR-009: Content Governance and Migration Strategy

**Status**: Proposed  
**Date**: 2026-02-20  
**Deciders**: Project team  
**Tags**: content, migration, governance

---

## Context

Moving page content into Umbraco changes publishing ownership and introduces workflow/permissions requirements that do not exist with content-in-code.

---

## Decision

Adopt a phased migration strategy:
- Phase 1: marketing/informational pages to CMS.
- Keep ecommerce/donation transactional flows code-owned.
- Define editorial roles and publish approvals before production cutover.

---

## Alternatives Considered

1. Big-bang migration of all page content.
2. Phased migration by page category (chosen direction).
3. Keep hybrid long-term with no governance standard.

---

## Consequences

### Positive
- Lower rollout risk and easier rollback boundaries.
- Clear ownership model between editors and engineers.

### Negative
- Temporary dual-content ownership complexity.
- Requires explicit migration checklists and training.

### Neutral
- Existing code-based pages remain valid fallback during transition.

---

## Related

- `.assistant/backlog.md` (P-109, P-112)
- `.assistant/canvas/questions.md` (Q-UM-05, Q-UM-06)
