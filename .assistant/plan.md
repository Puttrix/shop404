# Plan

Now / Next / Later plan for the Umbraco integration stream.

---

## Now

**Focus**: Integration foundation and technical spike

### M-UM-1: Foundations
- [x] Confirm architectural boundaries (CMS-owned vs code-owned routes)
- [ ] Scaffold Umbraco (.NET 8) project in repository -> P-101
- [ ] Stand up local SQL Server connection and boot Umbraco
- [ ] Define initial content model and aliases -> P-102
- [x] Accept API and routing integration ADRs (ADR-006, ADR-007)
- [x] Accept container/env separation decision (ADR-008)
- [x] Accept cache/fallback policy decision (ADR-010)

### M-UM-2: Frontend Adapter Baseline
- [ ] Add `cmsService` with route/content/settings fetch APIs -> P-103
- [ ] Implement adapter contract endpoints (`/api/content/*`) for React
- [ ] Implement error/fallback model for unavailable CMS
- [ ] Create initial mapping tests -> P-110

---

## Next

**Focus**: End-to-end content delivery and editorial ownership

### M-UM-3: CMS-Rendered Pages
- [ ] Wire marketing/informational routes to CMS -> P-104
- [ ] Build block renderer registry for first block set -> P-105
- [ ] Drive nav/footer/SEO defaults from Site Settings -> P-106
- [ ] Seed and migrate initial content -> P-109

### M-UM-4: Deployment and Delivery Pipeline
- [ ] Add multi-service Docker compose -> P-107
- [ ] Extend CI/CD for dual image build/publish/deploy -> P-108
- [ ] Implement env separation and secret topology -> P-114
- [ ] Document environment variables, secrets, and runbooks

---

## Later

**Focus**: hardening, parity validation, and release safety

### M-UM-5: Quality and Parity
- [ ] Expand API contract tests and route-level checks -> P-110
- [ ] Validate analytics + consent parity across migrated pages -> P-111
- [ ] Implement adapter caching and outage fallback behavior -> P-113

### M-UM-6: Release Readiness
- [ ] Finalize go-live checklist and rollback plan -> P-112
- [ ] Run cutover rehearsal in staging
- [ ] Close open questions or convert to ADRs

---

## Dependencies
- P-101 precedes most integration work.
- P-102 and P-103 unblock page integration (P-104/P-105/P-106).
- P-107 unblocks CI/CD extension (P-108).
- P-104/P-105/P-106/P-108 feed release readiness and parity checks.
