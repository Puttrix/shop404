# Design & Architecture Notes

## Integration Target
The feature introduces Umbraco as a headless CMS backend for marketing and informational content while preserving the existing React SPA shell and analytics instrumentation.

## High-Level Topology
```
React SPA (shop404)
  -> CMS service layer
  -> Umbraco Delivery API
  -> Umbraco CMS (.NET 8 LTS)
  -> SQL Server
```

## Content Model Direction (From TRD)
- `BasePage` composition shared by page types.
- Page types: `HomePage`, `StandardPage`, `BlogOverview`, `BlogPost`.
- Singleton: `SiteSettings` for nav/footer/default SEO.
- Reusable blocks: `HeroBlock`, `CTABlock`, `ProductTeaserBlock`.

## Frontend Integration Pattern
- Add `cmsService` abstraction for delivery API calls.
- Resolve route content by slug/path before route render.
- Map Umbraco block aliases to React components via a block registry.
- Keep local static fallback for critical pages until migration cutover is complete.
- Continue pushing existing analytics events from rendered interactions.

## API Contract Notes
- Canonical delivery root in TRD: `/umbraco/delivery/api/v2/content`.
- App-facing facade endpoints in TRD examples:
  - `/api/content/page?route=/about`
  - `/api/content/navigation`
  - `/api/content/blog?limit=10`
  - `/api/content/blog/{slug}`
  - `/api/content/settings`
- Exact contract and adapter ownership are open until implementation spike.

## Deployment Direction
- Services planned:
  - `shop404-frontend`
  - `umbraco-cms`
  - `sql-server`
- Persistent volumes required for Umbraco data/logs/media.
- CI/CD target: build frontend + Umbraco images, push registry tags, trigger Portainer redeploy.

## Existing Design Notes Preserved
- Neo visual style, responsive header/menu behavior, and theme persistence.
- Existing product image pipeline and WebP handling.
- Existing consent + analytics architecture (GTM-first, MTM support).

## Migration Constraints
- Avoid regressions in ecommerce and donation flows during CMS rollout.
- Keep route URLs stable to avoid breaking deep links and tag logic.
- Keep consent-driven tracking behavior unchanged as content source moves to CMS.
