# First Session Plan

Date: 2026-02-20

## Goal
Start Umbraco integration with minimum-risk scaffolding and clear ownership boundaries.

## 1) Confirm Boundaries
- Finalize which routes are CMS-owned in phase 1 (`/about`, `/faq`, `/terms`, `/privacy`) and which stay code-owned.
- Decide whether frontend talks directly to Delivery API or via local `/api/content/*` adapter.

## 2) Build Foundation
- Create Umbraco project skeleton in repo and verify local boot with SQL Server.
- Establish minimal content model (`BasePage`, `StandardPage`, `SiteSettings`) before full type set.

## 3) Frontend Spike
- Implement `cmsService` with one route fetch + fallback behavior.
- Render one migrated page end-to-end from CMS content.

## 4) Operational Baseline
- Add draft compose topology (frontend + umbraco + sqlserver).
- Document env vars/secrets and local runbook.

## 5) Session Exit Criteria
- P-101 in progress with runnable local setup evidence.
- P-103 started with one working CMS page fetch/render path.
- Open questions Q-UM-01/Q-UM-02 narrowed or converted to ADR updates.
