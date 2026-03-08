# Notes / Scratchpad

Sketches, links, snippets. Purge or refactor regularly to docs/.

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
