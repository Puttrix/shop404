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

- R-UM-1: Adapter contract versioning and DTO drift can cause frontend/backend mismatch if unmanaged. (Medium)
- R-UM-2: Reserved-route collision handling must be implemented and tested during CMS catch-all rollout. (Medium)
- R-UM-3: Secret wiring mistakes across environments can cause deployment failures or exposure risk. (Medium)
- R-UM-4: CMS outage behavior may degrade UX if cache/fallback policy is only partially implemented. (Medium)
- R-UM-5: Analytics/consent regressions can be introduced during page migration if rendering contracts diverge. (Medium)
- R-UM-6: Editorial governance (roles/workflow) is undefined and may block production publishing. (Medium)

---

## Artifacts

- TRD: `.assistant/trd/shop404_Umbraco_Integration_TRD.md`
- Planning: `.assistant/backlog.md`, `.assistant/plan.md`, `.assistant/history.md`, `.assistant/status.md`
- Canvas: `.assistant/canvas/vision.md`, `.assistant/canvas/design.md`, `.assistant/canvas/questions.md`
- ADRs: `.assistant/adr/001-gtm-first-architecture.md` .. `.assistant/adr/010-cms-content-caching-and-fallback-policy.md`
- Product docs and repo context: `README.md`, `docs/ROADMAP.md`, `docs/DESIGN_NOTES.md`

---

## Changelog

- 2026-02-20: Normalized `.assistant` artifacts for Umbraco integration track.
- 2026-02-20: Refreshed canvas vision/design/questions around headless CMS architecture.
- 2026-02-20: Replaced backlog with P-101..P-112 integration items and acceptance criteria.
- 2026-02-20: Replaced plan with Umbraco-specific Now/Next/Later milestones.
- 2026-02-20: Added ADR stubs 005..009 for integration decisions.
- 2026-02-20: Resolved Q-UM-01/Q-UM-02 and accepted adapter-first + reserved-route catch-all strategy (ADR-006/ADR-007).
- 2026-02-20: Resolved Q-UM-03/Q-UM-04 and accepted caching/fallback + env/secret separation strategy (ADR-010/ADR-008).

---

## Open Questions (Synced from `canvas/questions.md`)

- Q-UM-05: Phase-1 content migration scope.
- Q-UM-06: Editorial roles and publish workflow.
- Q-UM-07: E2E validation strategy for CMS rendering.
- Q-UM-08: Analytics regression guardrails post-cutover.
