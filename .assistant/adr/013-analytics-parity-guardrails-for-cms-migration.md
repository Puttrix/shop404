# ADR-013: Analytics Parity Guardrails for CMS Migration

**Status**: Accepted  
**Date**: 2026-02-20  
**Deciders**: Project team  
**Tags**: analytics, regression, quality, consent

---

## Context

Migrating page content source to CMS must not break existing analytics and consent behavior on affected routes.

---

## Decision

Define and enforce pre/post migration parity checks for migrated pages.

Baseline requirements:
- `page_view` remains present with required fields.
- Consent-state events/signals remain consistent with current policy.
- Content interaction events remain present where components are configured to emit them.
- Transactional route analytics remain unchanged by CMS rollout.

Guardrails:
- Capture pre/post payload snapshots for key routes.
- Fail checks on missing required fields, schema drift, or unacceptable event-count deltas.

---

## Alternatives Considered

1. Manual spot checks only.
2. Schema-only checks without payload snapshots.
3. Snapshot and threshold-based parity guardrails.

---

## Consequences

### Positive
- Detects subtle analytics regressions caused by content integration changes.
- Creates objective acceptance criteria for cutover.

### Negative
- Snapshot maintenance overhead as tracking evolves.
- Requires disciplined baseline updates when intentional changes occur.

### Neutral
- Tolerance thresholds can be tuned over time.

---

## Related

- `.assistant/canvas/questions.md` (Q-UM-08)
- `.assistant/backlog.md` (P-118)
