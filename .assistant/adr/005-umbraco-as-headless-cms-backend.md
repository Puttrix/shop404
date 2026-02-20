# ADR-005: Umbraco as Headless CMS Backend

**Status**: Proposed  
**Date**: 2026-02-20  
**Deciders**: Project team  
**Tags**: cms, architecture, umbraco, headless

---

## Context

The project needs non-developer content editing for marketing/informational pages while preserving the current React SPA and instrumentation setup.

---

## Decision

Use Umbraco (latest LTS on .NET 8) as a headless CMS backend, with React consuming content through APIs rather than server-rendered Umbraco templates.

---

## Alternatives Considered

1. Keep content in code/static files.
2. Use Umbraco with server-rendered templates.
3. Use an alternative headless CMS provider.

---

## Consequences

### Positive
- Editorial updates without frontend redeploys.
- Structured content model and reusable blocks.
- Clear separation of content management and frontend rendering.

### Negative
- Added operational complexity (CMS + DB + deployment).
- API contract and mapping maintenance required.

### Neutral
- Existing SPA architecture remains primary runtime surface.

---

## Related

- `.assistant/trd/shop404_Umbraco_Integration_TRD.md`
- `.assistant/plan.md`
