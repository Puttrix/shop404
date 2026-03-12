# Plan

Now / Next / Later plan for the Umbraco integration stream.

---

## Now

**Focus**: Final parity guardrail closeout

### M-UM-5: Quality and Parity
- [x] Confirm architectural boundaries (CMS-owned vs code-owned routes)
- [x] Scaffold Umbraco (.NET 10) project in repository -> P-101
- [x] Stand up local SQL Server connection and boot Umbraco
- [x] Define initial content model and aliases -> P-102
- [x] Accept API and routing integration ADRs (ADR-006, ADR-007)
- [x] Accept container/env separation decision (ADR-008)
- [x] Accept cache/fallback policy decision (ADR-010)
- [x] Accept migration scope + editorial + testing + analytics guardrail decisions (ADR-009, ADR-011, ADR-012, ADR-013)
- [x] Add `cmsService` with route/content/settings fetch APIs -> P-103
- [x] Implement adapter contract endpoints (`/api/content/*`) for React
- [x] Implement error/fallback model for unavailable CMS
- [x] Create initial mapping tests -> P-110
- [x] Validate analytics + consent parity across migrated pages -> P-111
- [x] Implement adapter caching and outage fallback behavior -> P-113
- [x] Implement combined contract + E2E pipeline -> P-117
- [ ] Implement analytics snapshot guardrails -> P-118

---

## Next

**Focus**: Release safety rehearsal and operational hardening

### M-UM-6: Release Readiness
- [x] Finalize go-live checklist and rollback plan -> P-112
- [ ] Run cutover rehearsal in staging
- [ ] Validate alerting/ownership paths for CMS/API degradation
- [ ] Close any new open questions or convert to ADRs

### Maintenance
- [ ] Keep adapter contract, editorial workflow docs, and env runbooks current with production learnings

---

## Later

**Focus**: Incremental CMS expansion and non-critical enhancements

- [ ] Expand CMS-owned page scope beyond phase-1 routes when parity and governance are stable
- [ ] Add optional block types and editorial UX improvements as needed

---

## Dependencies
- P-118 depends on parity baselines completed in P-111 and stable DTO contracts from P-110/P-117.
- Cutover rehearsal depends on stable multi-service deployment flow from P-107/P-108/P-114.
