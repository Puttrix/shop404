# Vision

## Mission
Evolve shop404 from static/content-in-code pages into a CMS-driven frontend where marketing and informational content is managed in Umbraco and delivered to the existing React SPA via API.

## Problem Statement
Content updates currently require code edits and deployment. That slows editorial changes, creates engineering bottlenecks, and limits reuse of global settings and block-based content.

## Target Users
- Content editors and marketing teams managing pages, navigation, footer, and SEO metadata.
- Frontend developers integrating API-delivered content into React routes and components.
- Platform engineers running containerized deployments and CI/CD for frontend + CMS.
- Analytics and experimentation teams who need existing instrumentation to continue working after content migration.

## Success Definition
shop404 succeeds when:
1. Marketing/informational pages are editable in Umbraco.
2. Global navigation, footer, and SEO defaults are managed centrally.
3. React routes consume Umbraco Delivery API content with stable fallbacks.
4. Docker and CI/CD cover frontend, Umbraco, and SQL Server services.
5. Existing analytics and consent behavior remain intact through the migration.

## Non-Goals
- Replacing the existing storefront/donation business logic with Umbraco rendering.
- Introducing payment processing, identity, or customer account backends.
- Building a multi-tenant CMS platform.
- Moving all product/catalog state to Umbraco in phase 1.
