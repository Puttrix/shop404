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
Status: Open  
Context: TRD targets marketing/informational pages first.  
- Which existing pages are phase-1 CMS-owned vs deferred?
- Do we seed content automatically or migrate manually in backoffice?

**Q-UM-06: Editorial Workflow**  
Status: Open  
Context: CMS introduces draft/publish and role permissions.  
- Which roles can publish to production?
- Is approval workflow required before publish?

## Testing and Quality

**Q-UM-07: E2E Validation Strategy**  
Status: Open  
Context: Existing tests are analytics payload-focused.  
- Do we add API contract tests for `cmsService` mappings?
- Do we add route-level E2E checks for CMS-rendered pages?

**Q-UM-08: Analytics Regression Guardrails**  
Status: Open  
Context: Content source is changing but event behavior must remain stable.  
- Which baseline events must be identical before/after CMS migration?
- Do we need pre/post payload snapshots for parity checks?
