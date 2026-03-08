# Status

**Last Updated**: 2026-03-07

---

## Focus

Primary focus is the Umbraco integration stream: stand up CMS foundations, define content model, and prepare React adapter integration without breaking existing storefront, donation, analytics, and consent behavior.

---

## Now / Next / Later

See `.assistant/plan.md`.

- Now: M-UM-3 CMS-Rendered Pages (P-101/102/103 closed, next: P-104 route integration)
- Next: M-UM-3 CMS-Rendered Pages + M-UM-4 Deployment Pipeline
- Later: M-UM-5 Quality/Parity + M-UM-6 Release Readiness

---

## Risks

- R-UM-1: Adapter contract versioning and DTO drift can cause frontend/backend mismatch if unmanaged. (Medium)
- R-UM-2: Reserved-route collision handling must be implemented and tested during CMS catch-all rollout. (Medium)
- R-UM-3: Secret wiring mistakes across environments can cause deployment failures or exposure risk. (Medium)
- R-UM-4: CMS outage behavior may degrade UX if cache/fallback policy is only partially implemented. (Medium)
- R-UM-5: Analytics/consent regressions can be introduced during page migration if rendering contracts diverge. (Medium)
- R-UM-6: Workflow friction may delay publish cadence if editorial roles/process are not implemented early. (Medium)

---

## Artifacts

- TRD: `.assistant/trd/shop404_Umbraco_Integration_TRD.md`
- Planning: `.assistant/backlog.md`, `.assistant/plan.md`, `.assistant/history.md`, `.assistant/status.md`
- Canvas: `.assistant/canvas/vision.md`, `.assistant/canvas/design.md`, `.assistant/canvas/questions.md`
- ADRs: `.assistant/adr/001-gtm-first-architecture.md` .. `.assistant/adr/013-analytics-parity-guardrails-for-cms-migration.md`
- CMS code: `umbraco-cms/` (`Shop404.Cms.csproj`, Program/appsettings, Umbraco template scaffold, `Controllers/ContentApiController.cs`)
- Frontend CMS service: `src/services/cmsService.js`, `src/services/cmsService.test.js`
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
- 2026-02-20: Resolved Q-UM-05..Q-UM-08 and accepted migration scope, editorial workflow, test strategy, and analytics parity guardrails (ADR-009/011/012/013).
- 2026-02-20: Started P-101 by scaffolding `umbraco-cms/` (`.NET 10` Umbraco project), validating build, and adding SQL-based local startup instructions to README.
- 2026-02-20: Added `docker-compose.cms.yml` for local SQL Server and updated Umbraco quick-start commands in README.
- 2026-02-20: Completed P-101 (Umbraco scaffold + local SQL container workflow verified).
- 2026-02-20: Started P-102 by adding an idempotent Umbraco startup bootstrapper for BasePage/page types/site settings/block types (`umbraco-cms/Bootstrap/ContentTypeBootstrapper.cs`).
- 2026-03-07: Closed P-102 (bootstrapper satisfies all acceptance criteria). Started P-103: added `src/services/cmsService.js` (React adapter service for /api/content/* endpoints) and `umbraco-cms/Controllers/ContentApiController.cs` (Umbraco adapter controller mapping published content to stable DTOs).
- 2026-03-08: Completed P-103: added Vite dev proxy for `/api/content/*` → Umbraco (port 13802), added Vitest + `npm test` script, wrote 20 passing tests covering DTO mapping and all fallback/error cases (`src/services/cmsService.test.js`).

---

## Open Questions (Synced from `canvas/questions.md`)

- None currently. Add new open items in `.assistant/canvas/questions.md` as they arise.
