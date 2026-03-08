# CMS Content Scope — Phase 1

This document defines the phase-1 page ownership boundary between the Umbraco
CMS and the React SPA, the seeding strategy for dev/staging environments, and
the manual content migration workflow for production.

---

## Ownership Boundary

### CMS-owned routes (phase 1)

The following routes are served by Umbraco content nodes via the `CmsPage`
React catch-all. Editors control all copy, SEO metadata, and block content
through the Umbraco backoffice.

| Route     | Umbraco content type | Notes                                         |
|-----------|----------------------|-----------------------------------------------|
| `/about`  | `standardPage`       | Company/project description                   |
| `/faq`    | `standardPage`       | Frequently asked questions                    |
| `/terms`  | `standardPage`       | Terms and conditions (legal; two-person review) |
| `/privacy`| `standardPage`       | Privacy policy (legal; two-person review)     |
| `/blog`   | `blogOverview`       | Blog index; child `blogPost` nodes per article |
| `/blog/*` | `blogPost`           | Individual articles                           |

The `homePage` content type (`/`) is seeded and holds global hero copy, but
the React `Home.jsx` component remains code-owned. CMS-driven hero content
integration is deferred to a later phase.

Global settings (navigation links, footer text, default SEO) are managed
through the `siteSettings` singleton content type.

The canonical phase-1 route list is exported from
[src/config/reservedRoutes.js](../src/config/reservedRoutes.js) as
`CMS_PHASE_1_ROUTES`.

### Code-owned routes (deferred — not in CMS)

The following routes are managed entirely in code and must **never** be created
as Umbraco content nodes. They are enforced by `RESERVED_ROUTES` and
`RESERVED_PREFIXES` in `reservedRoutes.js` and guarded by the collision tests
in `reservedRoutes.test.js`.

| Route / prefix     | Owner component               | Reason deferred               |
|--------------------|-------------------------------|-------------------------------|
| `/`                | `Home.jsx`                    | Product grid; code-driven     |
| `/products`        | `Products.jsx`                | Dynamic catalogue             |
| `/products/:id`    | `ProductDetails.jsx`          | Dynamic product detail        |
| `/cart`            | `Cart.jsx`                    | Transactional state           |
| `/checkout`        | `Checkout.jsx`                | Transactional state           |
| `/order-confirmation` | `OrderConfirmation.jsx`    | Transactional state           |
| `/donate/*`        | `Donate.jsx`                  | Transactional state           |
| `/learn/*`         | `LearnLayout` + sub-pages     | Content-in-code; deferred     |
| `/ab-test-lab`     | `ABTestLab.jsx`               | Experiment tooling            |

---

## Seeding Strategy (dev / staging)

Initial content is seeded automatically on first startup by
`umbraco-cms/Bootstrap/ContentSeeder.cs`. The seeder is fully idempotent:

- It checks for an existing `homePage` root node before doing any work.
- If a `homePage` root is found, the seeder logs a skip message and exits.
- If no root is found, it creates and publishes the full phase-1 content tree.

### Seeded content tree

```
/ (homePage "Home")
├── /about   (standardPage "About")
├── /faq     (standardPage "FAQ")
├── /terms   (standardPage "Terms and Conditions")
└── /privacy (standardPage "Privacy Policy")
└── /blog    (blogOverview "Blog")
/site-settings (siteSettings singleton)
```

Seed body content is intentionally minimal placeholder HTML. Editors should
replace it via the backoffice after first deploy.

### Running the seed manually

The seeder runs automatically when the CMS container starts and Umbraco reaches
`RuntimeLevel.Run`. No manual trigger is required. To force a re-seed:

1. Remove (or rename) the `homePage` root node in the backoffice, or:
2. Drop and recreate the `shop404_cms_data` volume (discards NuCache; SQL data
   is preserved).

---

## Production Content Migration (manual backoffice workflow)

Phase-1 production content is entered manually in the Umbraco backoffice after
the first production deploy. The seed content tree is already present — editors
only need to replace placeholder copy with final content.

### Steps

1. Deploy the stack using `docker-compose.full.yml` (see [PORTAINER.md](PORTAINER.md)).
2. Log in to the Umbraco backoffice at `http://YOUR-HOST:${CMS_PUBLISH_PORT}/umbraco`.
3. Navigate to **Content**. The seeded tree (Home, About, FAQ, Terms, Privacy,
   Blog, Site Settings) is visible.
4. For each `standardPage` node (`/about`, `/faq`, `/terms`, `/privacy`):
   - Open the node.
   - Replace `bodyContent` with the final editorial copy.
   - Update `seoTitle` and `seoDescription` if needed.
   - Click **Save and publish**.
5. For **legal pages** (`/terms`, `/privacy`) follow the two-person review rule
   (see [P-116 editorial workflow](../docs/DEVELOPERS.md)) before publishing.
6. Open **Site Settings**:
   - Set `headerNavigation` multi-node picker to the desired nav pages.
   - Set `footerLinks` and `footerText`.
   - Save and publish.
7. Verify live content:
   - `http://YOUR-HOST:${PUBLISH_PORT}/about` — renders updated copy.
   - `http://YOUR-HOST:${PUBLISH_PORT}/api/content/navigation` — returns nav items.

No code changes are required for content updates — all changes happen in the
backoffice.

---

## Collision Guard Tests

`src/config/reservedRoutes.test.js` contains automated tests that enforce the
ownership boundary:

| Test group | What it guards |
|------------|---------------|
| `RESERVED_ROUTES` | Each code-owned exact route is in the set |
| `RESERVED_PREFIXES` | Each code-owned prefix is in the list |
| `CMS_PHASE_1_ROUTES` | Module exports the canonical phase-1 route list |
| `collision guard` | No phase-1 CMS route appears in `RESERVED_ROUTES` or matches a reserved prefix |
| `set disjointness` | `RESERVED_ROUTES` ∩ `CMS_PHASE_1_ROUTES` = ∅ |

These tests run in CI on every PR and must pass before merge.

---

## Adding Routes in Future Phases

**To add a new CMS-owned route:**
1. Create the content type in Umbraco (or reuse `standardPage`).
2. Add it to `CMS_PHASE_1_ROUTES` in `reservedRoutes.js`.
3. Seed the content node in `ContentSeeder.cs` (or add manually in backoffice).
4. Verify the collision guard tests still pass.

**To add a new code-owned route:**
1. Add the route to `RESERVED_ROUTES` (exact) or `RESERVED_PREFIXES` (prefix)
   in `reservedRoutes.js`.
2. Add the `<Route>` to `App.jsx` **above** the `<Route path="*">` catch-all.
3. Verify the collision guard tests still pass.
