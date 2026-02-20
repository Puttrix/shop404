# ADR-011: Editorial Workflow and Publish Controls

**Status**: Accepted  
**Date**: 2026-02-20  
**Deciders**: Project team  
**Tags**: governance, editorial, workflow, compliance

---

## Context

CMS-managed content introduces production publishing risk if role permissions and approval flow are undefined.

---

## Decision

Adopt a role-based editorial workflow with approval required for production publishing.

Roles:
- Editor: draft/edit content and submit for review.
- Publisher (Content Lead): approve and publish content.
- Admin: manages schema, settings, users, and operational controls.

Controls:
- Production publish requires reviewer approval.
- Legal/compliance-sensitive pages require two-person review.
- Publishing and rollback actions must be auditable.

---

## Alternatives Considered

1. Open publish rights for all editors.
2. Approval-gated publish with role separation.
3. Engineering-only publish model.

---

## Consequences

### Positive
- Reduces accidental or non-compliant production changes.
- Clarifies accountability for content changes.

### Negative
- Slower publish throughput versus unrestricted publishing.
- Requires onboarding and role administration.

### Neutral
- Non-production environments can remain less restrictive for iteration.

---

## Related

- `.assistant/canvas/questions.md` (Q-UM-06)
- `.assistant/backlog.md` (P-116)
