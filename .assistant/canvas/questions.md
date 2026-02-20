# Open Questions

## Umbraco Integration

**Q-UM-01: Delivery API Shape vs Adapter Layer**  
Status: Resolved (2026-02-20)  
Context: TRD shows both raw Umbraco Delivery API and app-friendly `/api/content/*` endpoints.  
Decision:
- React calls a repo-owned backend adapter contract (`/api/content/*`), not raw Umbraco endpoints.
- Alias-to-DTO mapping ownership is in the adapter layer.
Follow-up:
- Implement adapter contract in P-103 and contract tests in P-110.

**Q-UM-02: URL Routing Source of Truth**  
Status: Resolved (2026-02-20)  
Context: Existing SPA routes are code-defined; new marketing pages will come from CMS slugs.  
Decision:
- Keep reserved transactional/app routes code-owned.
- Add CMS catch-all routing only for non-reserved paths.
- Route order: reserved app routes first -> CMS slug lookup -> 404.
Follow-up:
- Define reserved-prefix list and collision tests in P-104/P-110.

**Q-UM-03: Content Caching Strategy**  
Status: Resolved (2026-02-20)  
Context: CMS calls are now runtime dependencies.  
Decision:
- Use both edge and browser caching, with adapter endpoints as the cache boundary.
- Prefer edge cache with short TTL and `stale-while-revalidate`; keep browser TTL short.
- Fallback order when Umbraco is unavailable:
  - serve last-known-good cached adapter response if present,
  - otherwise render static fallback content for critical marketing pages,
  - otherwise show graceful temporary-unavailable state.
- Code-owned transactional routes must not depend on CMS availability.
Follow-up:
- Implement cache headers and fallback behavior in adapter and route integration (P-113).

**Q-UM-04: Environment and Secret Management**  
Status: Resolved (2026-02-20)  
Context: We need frontend + Umbraco + SQL Server in Docker/CI/CD.  
Decision:
- Use strict environment separation (dev/staging/prod) with separate databases and media volumes.
- Store credentials in secret stores (local `.env.local` only for dev, GitHub/Portainer secrets for CI/runtime).
- Keep non-sensitive configuration in env vars; keep connection strings/bootstrap credentials in secrets.
- Rotate bootstrap/admin secrets after provisioning.
Follow-up:
- Document secret and environment topology in compose/runbooks/CI config (P-114).

## Content and Governance

**Q-UM-05: Initial Content Migration Scope**  
Status: Resolved (2026-02-20)  
Context: TRD targets marketing/informational pages first.  
Decision:
- Phase-1 CMS-owned: `/`, `/about`, `/faq`, `/terms`, `/privacy`, blog index/detail, and global nav/footer/default SEO settings.
- Deferred and code-owned: `/products`, `/product/:id`, `/cart`, `/checkout`, `/donate/*`, `/ab-test-lab`, and transactional state flows.
- Migration method is hybrid: idempotent seed content for dev/staging baseline, manual editorial migration/approval in production backoffice.
Follow-up:
- Implement scoped migration + seeding workflow in P-115.

**Q-UM-06: Editorial Workflow**  
Status: Resolved (2026-02-20)  
Context: CMS introduces draft/publish and role permissions.  
Decision:
- Roles:
  - Editor: create/edit and submit for review.
  - Publisher (Content Lead): approve and publish to production.
  - Admin: schema/settings/users/infrastructure only.
- Approval workflow is required before production publish.
- Legal/compliance-sensitive pages require two-person review before publish.
Follow-up:
- Implement role/approval/runbook controls in P-116.

## Testing and Quality

**Q-UM-07: E2E Validation Strategy**  
Status: Resolved (2026-02-20)  
Context: Existing tests are analytics payload-focused.  
Decision:
- Add both API contract tests and route-level E2E checks.
- PR gate: fast contract tests + CMS route smoke checks.
- Scheduled/release gate: expanded E2E matrix including fallback/collision/404 cases.
Follow-up:
- Implement validation pipeline in P-117.

**Q-UM-08: Analytics Regression Guardrails**  
Status: Resolved (2026-02-20)  
Context: Content source is changing but event behavior must remain stable.  
Decision:
- Define a parity baseline on migrated pages for `page_view`, consent-state events/signals, and tracked content interaction events where implemented.
- Require pre/post payload snapshots for key routes and fail checks on schema drift, missing required fields, or unacceptable event-count deltas.
- Keep transactional route analytics unaffected by CMS migration.
Follow-up:
- Implement snapshot/threshold guardrails in P-118.
