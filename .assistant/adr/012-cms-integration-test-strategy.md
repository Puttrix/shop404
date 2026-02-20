# ADR-012: CMS Integration Test Strategy

**Status**: Accepted  
**Date**: 2026-02-20  
**Deciders**: Project team  
**Tags**: testing, quality, e2e, contract

---

## Context

Existing checks focus on analytics payloads. CMS integration adds API mapping, route resolution, and fallback logic that require broader validation.

---

## Decision

Use a two-layer validation strategy:
- API contract tests for adapter and `cmsService` mapping/fallback behavior.
- Route-level E2E tests for CMS-rendered pages and routing edge cases.

Execution policy:
- PR: run contract tests + CMS route smoke suite.
- Nightly/release: run extended E2E suite including fallback, reserved-route collisions, and 404 behavior.

---

## Alternatives Considered

1. Contract tests only.
2. E2E tests only.
3. Combined contract + E2E strategy.

---

## Consequences

### Positive
- Catches mapping regressions early and route integration issues before release.
- Balances feedback speed and coverage.

### Negative
- Adds CI complexity and test maintenance cost.

### Neutral
- Initial E2E scope can start as smoke and expand incrementally.

---

## Related

- `.assistant/canvas/questions.md` (Q-UM-07)
- `.assistant/backlog.md` (P-117)
