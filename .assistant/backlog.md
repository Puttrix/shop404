# Backlog

Product backlog for the Umbraco integration initiative.

---

## Active Items

## P-101: Bootstrap Umbraco Solution in Repo
- [x] Create Umbraco (.NET 10) project and wire local startup
      tags: cms, umbraco, backend, setup  priority: high  est: 1d
      deps: none
      accepts:
      - Umbraco project exists under a stable repo path
      - Local run succeeds against SQL Server connection string
      - README section documents local startup and prerequisites

## P-102: Define Content Model (BasePage + Page Types)
- [x] Implement TRD document types and compositions in Umbraco
      tags: cms, content-model, umbraco  priority: high  est: 1.5d
      deps: P-101
      accepts:
      - `BasePage` composition fields are created
      - `HomePage`, `StandardPage`, `BlogOverview`, `BlogPost` are created
      - Block types exist for hero/cta/product teaser
      - Site settings singleton type exists

## P-103: Frontend CMS Service Layer
- [x] Add `cmsService` abstraction and DTO mapping in React app
      tags: frontend, integration, api  priority: high  est: 1d
      deps: P-101
      accepts:
      - Service calls repo-owned adapter endpoints (`/api/content/*`)
      - Service encapsulates content/navigation/blog/settings fetches
      - Error + empty-content fallback behavior is implemented
      - Mapping from API payload to UI-friendly types is tested

## P-104: Route Integration for CMS Pages
- [x] Render CMS-driven marketing pages in SPA
      tags: frontend, routing, cms  priority: high  est: 1.5d
      deps: P-103, P-102
      accepts:
      - `/about`, `/faq`, `/terms`, `/privacy` load from CMS
      - Reserved app routes remain code-owned (`/products`, `/cart`, `/checkout`, `/donate`, `/ab-test-lab`, `/api`, `/config.json`)
      - Route order is explicit: reserved route match -> CMS slug match -> 404
      - Collision behavior is covered by tests/documentation

## P-105: Block Renderer Registry
- [x] Implement block alias -> React component registry
      tags: frontend, components, cms-blocks  priority: high  est: 1d
      deps: P-103, P-102
      accepts:
      - Hero, CTA, ProductTeaser blocks render from API payload
      - Unknown block aliases degrade gracefully with logging
      - Block rendering keeps existing design system styling

## P-106: Global Site Settings from CMS
- [x] Drive header/footer/default SEO from Umbraco Site Settings singleton
      tags: frontend, seo, cms  priority: medium  est: 1d
      deps: P-103, P-102
      accepts:
      - Header navigation comes from CMS config
      - Footer links/text come from CMS config
      - Default SEO title/description fallback is wired

## P-107: Docker Compose Topology (Frontend + Umbraco + SQL)
- [x] Add multi-service compose for integrated local/dev deployment
      tags: infra, docker, umbraco, sqlserver  priority: high  est: 1d
      deps: P-101
      accepts:
      - Compose starts three services and network connectivity works
      - Persistent volumes for Umbraco data/logs/media are mounted
      - Environment variables and secrets are documented

## P-108: CI/CD for Umbraco + Frontend Images
- [x] Extend GitHub Actions to build/push both images and redeploy
      tags: ci, cd, deployment, portainer  priority: medium  est: 1d
      deps: P-107
      accepts:
      - Workflow builds frontend and Umbraco images
      - Tags include `latest` and commit SHA
      - Portainer redeploy trigger path is documented or scripted

## P-109: Initial Content Seeding and Page Migration
- [ ] Migrate initial marketing/informational content into Umbraco
      tags: content, migration, editorial  priority: medium  est: 1.5d
      deps: P-102
      accepts:
      - Seed data exists for home/about/faq/terms/privacy
      - Editors can update content without code changes
      - Migration mapping is documented in `.assistant/canvas/notes.md`

## P-110: API Contract and Integration Tests
- [ ] Add contract-level checks for CMS payload mapping
      tags: testing, quality, api  priority: medium  est: 1d
      deps: P-103, P-104
      accepts:
      - Test coverage validates required fields and fallbacks
      - Failure cases (missing property/unknown block) are covered
      - Test commands are documented in README

## P-111: Analytics and Consent Parity After CMS Cutover
- [ ] Verify no regression in analytics + consent behavior on CMS pages
      tags: analytics, consent, regression  priority: medium  est: 0.5d
      deps: P-104, P-105
      accepts:
      - Existing core events fire on migrated pages where applicable
      - Consent gating behavior remains unchanged
      - Parity checks are recorded in status/history

## P-112: Production Readiness and Rollback
- [ ] Define readiness checklist and rollback strategy for CMS rollout
      tags: release, risk, operations  priority: medium  est: 0.5d
      deps: P-106, P-108, P-111
      accepts:
      - Go-live checklist includes monitoring and ownership
      - Rollback path is documented and testable
      - Critical risks and mitigations are tracked in status

## P-113: Adapter Caching and CMS-Outage Fallbacks
- [ ] Implement layered cache policy and fallback behavior for `/api/content/*`
      tags: api, caching, reliability, cms  priority: high  est: 1d
      deps: P-103
      accepts:
      - Adapter responses include agreed cache headers (edge + browser)
      - Stale cached response is served when Umbraco is temporarily unavailable
      - Critical pages have static fallback payload/path when no cache exists
      - Non-critical CMS pages return graceful temporary-unavailable response
      - Behavior is covered by tests and runbook notes

## P-114: Environment Separation and Secret Topology
- [ ] Implement and document secret/env management model for dev/staging/prod
      tags: infra, security, operations, ci  priority: high  est: 1d
      deps: P-107
      accepts:
      - Separate DB configuration per environment is enforced
      - Separate media/storage volumes per environment are configured
      - SQL/Umbraco credentials use secrets systems (GitHub/Portainer/local gitignored files)
      - Bootstrap/admin secret rotation procedure is documented
      - CI and deployment docs reflect secret boundaries

## P-115: Phase-1 Content Scope and Seeding Workflow
- [ ] Implement phase-1 page ownership boundaries and seeding strategy
      tags: content, migration, governance  priority: high  est: 1d
      deps: P-102, P-109
      accepts:
      - CMS-owned routes are limited to phase-1 scope (`/`, `/about`, `/faq`, `/terms`, `/privacy`, blog, global settings)
      - Deferred transactional routes remain code-owned and unaffected
      - Idempotent seed process exists for dev/staging baseline content
      - Production content migration process is documented as manual backoffice workflow

## P-116: Editorial Roles and Approval Workflow
- [ ] Configure and document role-based publishing controls
      tags: governance, editorial, compliance  priority: high  est: 1d
      deps: P-109
      accepts:
      - Editor/Publisher/Admin roles and permissions are defined
      - Production publishing requires approval workflow
      - Two-person review rule is documented for legal/compliance pages
      - Audit and rollback ownership is documented

## P-117: CMS Contract + E2E Validation Pipeline
- [ ] Implement combined contract and route-level E2E strategy
      tags: testing, ci, quality  priority: high  est: 1.5d
      deps: P-103, P-104, P-110
      accepts:
      - Contract tests validate DTO mapping and fallback behavior
      - PR pipeline runs contract tests + CMS smoke E2E
      - Nightly/release pipeline runs extended CMS E2E (fallback/collision/404)
      - Test runbook documents scope and gating behavior

## P-118: Analytics Parity Snapshot Guardrails
- [ ] Add pre/post snapshot and threshold checks for analytics parity
      tags: analytics, regression, consent, quality  priority: high  est: 1d
      deps: P-111
      accepts:
      - Baseline migrated-route events are defined (`page_view`, consent signals, content interactions where configured)
      - Snapshot comparison tooling or script exists for pre/post checks
      - CI fails on missing required fields, schema drift, or out-of-threshold event deltas
      - Intentional tracking changes require explicit baseline update process

---

## Deferred / Legacy

Analytics enhancement items from pre-Umbraco roadmap remain deferred until P-101..P-112 baseline is stable.
