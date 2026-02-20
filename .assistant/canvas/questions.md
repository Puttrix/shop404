# Open Questions

## Umbraco Integration

**Q-UM-01: Delivery API Shape vs Adapter Layer**  
Status: Open  
Context: TRD shows both raw Umbraco Delivery API and app-friendly `/api/content/*` endpoints.  
- Should React call Umbraco Delivery API directly, or a backend adapter owned by this repo?
- Who owns mapping from Umbraco property aliases to frontend DTOs?

**Q-UM-02: URL Routing Source of Truth**  
Status: Open  
Context: Existing SPA routes are code-defined; new marketing pages will come from CMS slugs.  
- Do we implement a catch-all CMS route for unknown slugs?
- Which routes remain code-owned (ecommerce, donation, checkout)?

**Q-UM-03: Content Caching Strategy**  
Status: Open  
Context: CMS calls are now runtime dependencies.  
- Should we cache in-browser only, edge cache, or both?
- What is the fallback behavior when Umbraco is unavailable?

**Q-UM-04: Environment and Secret Management**  
Status: Open  
Context: We need frontend + Umbraco + SQL Server in Docker/CI/CD.  
- Where are Umbraco connection strings and admin bootstrap secrets stored?
- Do local/dev/staging/prod use separate databases and media volumes?

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
