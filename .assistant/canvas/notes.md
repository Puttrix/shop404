# Notes / Scratchpad

Sketches, links, snippets. Purge or refactor regularly to docs/.

---

## P-113 CMS Caching & Outage Runbook

### Cache layers

| Layer | Where | Mechanism | Serves stale when |
|---|---|---|---|
| HTTP cache | Browser / CDN | `Cache-Control` headers on `/api/content/*` responses | Normal staleness (`stale-while-revalidate`) |
| In-process cache | `cmsService.js` `_cache` Map | Updated on every successful fetch; never expires | CMS is unreachable (network error, timeout, 5xx) |
| Static fallback | `cmsFallbacks.js` `PAGE_FALLBACKS` | Hard-coded minimal payload | In-process cache is cold **and** CMS is down |

### Cache-Control headers (set by ContentApiController.cs)

| Endpoint | Headers |
|---|---|
| `/api/content/page` | `public, max-age=60, stale-while-revalidate=30` |
| `/api/content/navigation` | `public, max-age=120, stale-while-revalidate=60` |
| `/api/content/blog` | `public, max-age=60, stale-while-revalidate=30` |
| `/api/content/blog/{slug}` | `public, max-age=60, stale-while-revalidate=30` |
| `/api/content/settings` | `public, max-age=300, stale-while-revalidate=60` |

### Outage behaviour matrix

| Scenario | Navigation/Settings | Critical pages (`/about` `/faq` `/terms` `/privacy`) | Non-critical (blog posts, unknown routes) |
|---|---|---|---|
| CMS up, response fresh | Live data | Live data | Live data |
| CMS up, response stale | HTTP `stale-while-revalidate` serves cached | Same | Same |
| CMS down, in-process cache warm | Stale cache | Stale cache | Stale cache |
| CMS down, in-process cache cold | `[]` / `null` (graceful empty state) | Static fallback (temporarily unavailable message) | `null` → CmsPage shows "page not found" |

### Incident runbook

**CMS is down (e.g. container crashed, SQL Server unreachable):**
1. The frontend continues to serve from the in-process cache until the next page reload.
2. On first cold load (no cache), critical pages show a "temporarily unavailable" message from `PAGE_FALLBACKS`. Non-critical pages (blog) show the standard "page not found" state.
3. Navigation and settings fall back to empty (`[]` / `null`); the Header shows no nav items and the Footer shows the static fallback links.
4. **Remediation**: restart the `shop404-cms` container (`docker compose restart shop404-cms`). The in-process cache auto-repopulates on the next successful fetch.

**CMS returns 5xx (partial outage):**
- Same behaviour as "CMS down, in-process cache warm" if any previous successful fetch has run in the current session.

**Updating static fallback content:**
- Edit `src/services/cmsFallbacks.js`. These payloads are intentionally minimal (temporary-unavailable messages) and should NOT contain real editorial content.

---

## P-109 Content Migration Mapping

Documents how existing hardcoded React pages map to Umbraco content nodes and properties.
Seed data is created automatically on first run by `ContentSeeder.cs`.
Production migration is a manual backoffice workflow.

### Content Tree (seeded)

```
/ (homePage "Home")
├── /about   (standardPage "About")
├── /faq     (standardPage "FAQ")
├── /terms   (standardPage "Terms and Conditions")
├── /privacy (standardPage "Privacy Policy")
└── /blog    (blogOverview "Blog")
/site-settings (siteSettings singleton)
```

### Page → Content Type Mapping

| Route      | React component (current)        | Umbraco content type | Notes                                     |
|------------|----------------------------------|----------------------|-------------------------------------------|
| `/`        | `src/pages/Home.jsx` (code-owned)| `homePage`           | Home remains code-owned (product grid); CMS drives heroHeading/heroText via future integration |
| `/about`   | `CmsPage` → `/api/content/page`  | `standardPage`       | bodyContent replaces all in-page copy     |
| `/faq`     | `CmsPage` → `/api/content/page`  | `standardPage`       | bodyContent replaces static Q&A           |
| `/terms`   | `CmsPage` → `/api/content/page`  | `standardPage`       | bodyContent replaces hardcoded legal text |
| `/privacy` | `CmsPage` → `/api/content/page`  | `standardPage`       | bodyContent replaces hardcoded copy       |
| `/blog`    | `CmsPage` → `/api/content/page`  | `blogOverview`       | introText + children (blogPost)           |
| `/blog/*`  | `CmsPage` → blog slug endpoint   | `blogPost`           | Full article: body, author, publishDate   |

### Property Mapping per Content Type

#### homePage
| Umbraco property   | Source                       | Notes                        |
|--------------------|------------------------------|------------------------------|
| `pageTitle`        | Seed: "Home"                 | Used as `<title>` fallback   |
| `heroHeading`      | "Modern mock ecommerce…"     | Matches hardcoded h1 in Home.jsx |
| `heroText`         | "Built for testing…"         | Matches hardcoded paragraph  |
| `seoTitle`         | "Shop404 — Demo Ecommerce"   |                              |
| `seoDescription`   | Seed text                    |                              |
| `featuredProductsSection` | Empty (BlockList)     | Future: drive featured products from CMS |

#### standardPage (about / faq / terms / privacy)
| Umbraco property | Source                    | Notes                                     |
|------------------|---------------------------|-------------------------------------------|
| `pageTitle`      | Page name                 | Rendered as `<title>` by `CmsPage.jsx`    |
| `slug`           | URL segment               | Matches React route                       |
| `bodyContent`    | Seed HTML (see `ContentSeeder.cs`) | Editors replace via backoffice  |
| `seoTitle`       | Empty (inherits default)  | Override per-page in backoffice           |
| `seoDescription` | Empty                     | Override per-page in backoffice           |
| `contentBlocks`  | Empty (BlockList)         | Optional: add hero/CTA blocks per page    |

#### siteSettings
| Umbraco property       | Seed value                        | Frontend consumer            |
|------------------------|-----------------------------------|------------------------------|
| `footerText`           | "© YYYY Shop404. For testing…"    | `Footer.jsx`                 |
| `footerLinks`          | Empty (multi-node picker)         | `Footer.jsx` (static fallback if empty) |
| `headerNavigation`     | Empty (multi-node picker)         | `Header.jsx` (empty nav if unset) |
| `defaultSeoTitle`      | "Shop404 — Demo Ecommerce…"       | `CmsPage.jsx` → `setTitle()` |
| `defaultSeoDescription`| Seed text                         | Future meta tag integration  |

### Production Migration Workflow (manual)

Phase-1 production content is entered directly in the Umbraco backoffice after first deploy:

1. Log in to the Umbraco backoffice (`/umbraco`).
2. Navigate to **Content** — the seed tree (Home, About, FAQ, Terms, Privacy, Blog) is already present.
3. Open each standard page and replace `bodyContent` with the final copy.
4. Open **Site Settings** and configure `headerNavigation` and `footerLinks` multi-node pickers.
5. Save and publish each node.

No code changes are required for content updates — only backoffice actions.

### Reserved Routes (not seeded — remain code-owned)

The following routes must **never** be created as Umbraco content nodes
(enforced by `reservedRoutes.js` in the React SPA):

`/products`, `/cart`, `/checkout`, `/donate`, `/ab-test-lab`, `/api`, `/config.json`
