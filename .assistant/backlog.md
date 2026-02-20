# Backlog

Product backlog for the Umbraco integration initiative.

---

## Active Items

## P-101: Bootstrap Umbraco Solution in Repo
- [ ] Create Umbraco (.NET 8 LTS) project and wire local startup
      tags: cms, umbraco, backend, setup  priority: high  est: 1d
      deps: none
      accepts:
      - Umbraco project exists under a stable repo path
      - Local run succeeds against SQL Server connection string
      - README section documents local startup and prerequisites

## P-102: Define Content Model (BasePage + Page Types)
- [ ] Implement TRD document types and compositions in Umbraco
      tags: cms, content-model, umbraco  priority: high  est: 1.5d
      deps: P-101
      accepts:
      - `BasePage` composition fields are created
      - `HomePage`, `StandardPage`, `BlogOverview`, `BlogPost` are created
      - Block types exist for hero/cta/product teaser
      - Site settings singleton type exists

## P-103: Frontend CMS Service Layer
- [ ] Add `cmsService` abstraction and DTO mapping in React app
      tags: frontend, integration, api  priority: high  est: 1d
      deps: P-101
      accepts:
      - Service encapsulates content/navigation/blog/settings fetches
      - Error + empty-content fallback behavior is implemented
      - Mapping from API payload to UI-friendly types is tested

## P-104: Route Integration for CMS Pages
- [ ] Render CMS-driven marketing pages in SPA
      tags: frontend, routing, cms  priority: high  est: 1.5d
      deps: P-103, P-102
      accepts:
      - `/about`, `/faq`, `/terms`, `/privacy` load from CMS
      - Existing ecommerce/donation routes remain code-owned
      - Missing route behavior is explicit (404 or fallback page)

## P-105: Block Renderer Registry
- [ ] Implement block alias -> React component registry
      tags: frontend, components, cms-blocks  priority: high  est: 1d
      deps: P-103, P-102
      accepts:
      - Hero, CTA, ProductTeaser blocks render from API payload
      - Unknown block aliases degrade gracefully with logging
      - Block rendering keeps existing design system styling

## P-106: Global Site Settings from CMS
- [ ] Drive header/footer/default SEO from Umbraco Site Settings singleton
      tags: frontend, seo, cms  priority: medium  est: 1d
      deps: P-103, P-102
      accepts:
      - Header navigation comes from CMS config
      - Footer links/text come from CMS config
      - Default SEO title/description fallback is wired

## P-107: Docker Compose Topology (Frontend + Umbraco + SQL)
- [ ] Add multi-service compose for integrated local/dev deployment
      tags: infra, docker, umbraco, sqlserver  priority: high  est: 1d
      deps: P-101
      accepts:
      - Compose starts three services and network connectivity works
      - Persistent volumes for Umbraco data/logs/media are mounted
      - Environment variables and secrets are documented

## P-108: CI/CD for Umbraco + Frontend Images
- [ ] Extend GitHub Actions to build/push both images and redeploy
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

---

## Deferred / Legacy

Analytics enhancement items from pre-Umbraco roadmap remain deferred until P-101..P-112 baseline is stable.
