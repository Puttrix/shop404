# Status

**Last Updated**: 2026-03-11

---

## Focus

Primary focus is closing P-118 analytics parity snapshot guardrails while keeping the Umbraco adapter/release track stable.

---

## Now / Next / Later

See `.assistant/plan.md`.

- Now: M-UM-5 Quality/Parity final closeout (P-118 open)
- Next: M-UM-6 release safety rehearsal (staging cutover drill + operational validation)
- Later: Incremental CMS scope expansion and non-critical enhancements

---

## Risks

- R-UM-1: Adapter contract versioning and DTO drift can cause frontend/backend mismatch if unmanaged. (Medium)
- R-UM-2: Secret wiring mistakes across environments can cause deployment failures or exposure risk. (Medium)
- R-UM-3: CMS outage behavior may degrade UX if cache/fallback policy is only partially implemented or stale cache expires. (Medium)
- R-UM-4: Analytics/consent regressions may reappear if snapshot baselines for P-118 are incomplete or stale. (Medium)

---

## Artifacts

- TRD: `.assistant/trd/shop404_Umbraco_Integration_TRD.md`
- Planning: `.assistant/backlog.md`, `.assistant/plan.md`, `.assistant/history.md`, `.assistant/status.md`
- Canvas: `.assistant/canvas/vision.md`, `.assistant/canvas/design.md`, `.assistant/canvas/questions.md`
- ADRs: `.assistant/adr/001-gtm-first-architecture.md` .. `.assistant/adr/013-analytics-parity-guardrails-for-cms-migration.md`
- CMS code: `umbraco-cms/` (`Shop404.Cms.csproj`, Program/appsettings, Umbraco template scaffold, `Controllers/ContentApiController.cs`)
- Frontend CMS service: `src/services/cmsService.js`, `src/services/cmsService.test.js`
- CMS routing: `src/pages/CmsPage.jsx`, `src/config/reservedRoutes.js`, `src/config/reservedRoutes.test.js`
- CMS blocks: `src/components/cms/blocks/` (HeroBlock, CtaBlock, ProductTeaserBlock), `src/components/cms/BlockRegistry.js`, `src/components/cms/BlockRenderer.jsx`, `src/components/cms/BlockRegistry.test.js`
- CMS site settings: `src/state/cmsSettingsContext.jsx` (CmsSettingsProvider + useCmsSettings hook)
- Docker topology: `umbraco-cms/Dockerfile`, `docker-compose.full.yml`, `.env.example`
- Product docs and repo context: `README.md`, `docs/ROADMAP.md`, `docs/DESIGN_NOTES.md`
- MCP capability check (session): `context7` and `playwright` available via direct tools; `github` MCP unavailable in this session

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
- 2026-03-08: Completed P-104: added `CmsPage` catch-all component (fetch → render → 404), `reservedRoutes.js` collision boundary, 22 collision guard tests. 42 tests passing, build clean.
- 2026-03-08: Completed P-105: block registry (alias → component map), BlockRenderer (unknown alias degrades with console.warn), HeroBlock/CtaBlock/ProductTeaserBlock using existing design system. Controller updated to map BlockListModel → structured JSON. 51 tests passing, build clean.
- 2026-03-08: Completed P-106: CmsSettingsProvider fetches nav + settings once at boot. Header nav driven by CMS headerNavigation. Footer text/links driven by CMS footerText/footerLinks (static fallback when unconfigured). Controller GetSettings surfaces footerLinks. CmsPage passes defaultSeoTitle fallback to setTitle. Build clean.
- 2026-03-08: Completed P-107: added `umbraco-cms/Dockerfile` (.NET 10 multi-stage), `docker-compose.full.yml` (three-service topology: SQL + CMS + frontend, shared network, 4 named volumes), `.env.example` (all secrets/env vars documented). Added `CMS_API_URL` to `server.js` runtimeConfig so browser receives it from `/config.json`.
- 2026-03-08: Completed P-114: created `docs/SECRETS.md` (full secret inventory, per-env isolation model, volume namespacing via COMPOSE_PROJECT_NAME, DB naming via MSSQL_DATABASE, Portainer/GitHub/local .env secret boundaries, SA password + Umbraco admin rotation procedures, new-env checklist). Updated `docker-compose.full.yml` with `${MSSQL_DATABASE:-Shop404Cms}`. Updated `.env.example` with COMPOSE_PROJECT_NAME and MSSQL_DATABASE. Added full-stack Portainer section to `docs/PORTAINER.md`. 170 tests still passing.
- 2026-03-08: Completed P-113: three-layer cache strategy in `cmsService.js` (HTTP cache headers already on controller → in-process stale-on-error Map → static PAGE_FALLBACKS). Created `cmsFallbacks.js` with static payloads for /about /faq /terms /privacy. Non-critical routes return null → CmsPage shows graceful unavailable state. 15 new cache/fallback tests (170 total passing). Runbook documented in `.assistant/canvas/notes.md`.
- 2026-03-08: Completed P-111: added `src/utils/analytics.test.js` — 27 analytics parity tests. Parity baseline: page_view fires on all CMS content types (standardPage, blogOverview, blogPost) with cms_content_type field; gated by analytics consent (denied → no dataLayer or _mtm push); _mtm receives page_view when window._mtm present; no ecommerce events on CMS pages; trackContentScan/trackContentClick consent-gated. 155 tests total, all passing.
- 2026-03-08: Completed P-110: added `src/services/cmsContract.test.js` — 77 contract tests covering all DTO shapes (page, blog summary, blog detail, settings, navigation, block data for all 3 block types), sparse payload fallbacks, title resolution logic, settings consumer logic, and cross-check that controller block aliases match BlockRegistry. README Testing section updated with `npm test` command and test file table. 128 tests total, all passing.
- 2026-03-08: Completed P-109: added `umbraco-cms/Bootstrap/ContentSeeder.cs` — idempotent seeder that creates the full content tree (homePage, 4× standardPage for about/faq/terms/privacy, blogOverview, siteSettings) on first run. Uses `IContentService.Save` + `Publish` (Umbraco 17: `SaveAndPublish` removed). Documented migration mapping in `.assistant/canvas/notes.md`. Build clean (0 errors).
- 2026-03-08: Completed P-108: extended `.github/workflows/publish.yml` with two parallel build jobs (`build-frontend` → `ghcr.io/puttrix/shop404`, `build-cms` → `ghcr.io/puttrix/shop404-cms`) plus a `deploy` job that POSTs to `PORTAINER_WEBHOOK_URL` secret after both images are pushed (skipped gracefully if secret absent). Both images tagged `latest` + commit SHA + semver tag.
- 2026-03-11: Refreshed assistant state kickoff: reconciled stale plan/status alignment against backlog, confirmed P-101..P-117 complete and P-118 open, and revalidated MCP availability (`context7`, `playwright` callable; `github` unavailable).

---

## Open Questions (Synced from `canvas/questions.md`)

- None currently. Add new open items in `.assistant/canvas/questions.md` as they arise.
