# Status

**Last Updated**: 2026-02-20

---

## Focus

Primary focus is the Umbraco integration stream: stand up CMS foundations, define content model, and prepare React adapter integration without breaking existing storefront, donation, analytics, and consent behavior.

---

## Now / Next / Later

See `.assistant/plan.md`.

- Now: M-UM-1 Foundations + M-UM-2 Frontend Adapter Baseline
- Next: M-UM-3 CMS-Rendered Pages + M-UM-4 Deployment Pipeline
- Later: M-UM-5 Quality/Parity + M-UM-6 Release Readiness

---

## Risks

- R-UM-1: API contract ambiguity between raw Delivery API and `/api/content/*` facade may cause rework. (High)
- R-UM-2: Route ownership boundary (CMS vs code-owned routes) is not finalized. (High)
- R-UM-3: Multi-service local/dev setup (frontend + Umbraco + SQL Server) may slow onboarding if not scripted well. (Medium)
- R-UM-4: Analytics/consent regressions can be introduced during page migration if rendering contracts diverge. (Medium)
- R-UM-5: Editorial governance (roles/workflow) is undefined and may block production publishing. (Medium)

---

## Artifacts

- TRD: `.assistant/trd/shop404_Umbraco_Integration_TRD.md`
- Planning: `.assistant/backlog.md`, `.assistant/plan.md`, `.assistant/history.md`, `.assistant/status.md`
- Canvas: `.assistant/canvas/vision.md`, `.assistant/canvas/design.md`, `.assistant/canvas/questions.md`
- ADRs: `.assistant/adr/001-gtm-first-architecture.md` .. `.assistant/adr/009-content-governance-and-migration-strategy.md`
- Product docs and repo context: `README.md`, `docs/ROADMAP.md`, `docs/DESIGN_NOTES.md`

---

## Changelog

- 2026-02-20: Normalized `.assistant` artifacts for Umbraco integration track.
- 2026-02-20: Refreshed canvas vision/design/questions around headless CMS architecture.
- 2026-02-20: Replaced backlog with P-101..P-112 integration items and acceptance criteria.
- 2026-02-20: Replaced plan with Umbraco-specific Now/Next/Later milestones.
- 2026-02-20: Added ADR stubs 005..009 for integration decisions.

---

## Open Questions (Synced from `canvas/questions.md`)

- Q-UM-01: Delivery API shape vs adapter layer ownership.
- Q-UM-02: URL routing source of truth and catch-all strategy.
- Q-UM-03: Content caching and fallback behavior.
- Q-UM-04: Environment/secret management for Umbraco + SQL.
- Q-UM-05: Phase-1 content migration scope.
- Q-UM-06: Editorial roles and publish workflow.
- Q-UM-07: E2E validation strategy for CMS rendering.
- Q-UM-08: Analytics regression guardrails post-cutover.
