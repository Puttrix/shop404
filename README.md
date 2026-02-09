# Shop404 — Mock Ecommerce + Donation Site

![Shop404 preview](assets/image.png)

A modern, "pretty" demo site for testing analytics and experimentation implementations:
- Matomo / Matomo Tag Manager
- Google Tag Manager (GTM) / GA4
- Optimizely Web Experimentation
- Optimizely Data Platform (ODP)

Built with Vite + React + Tailwind. Includes a full ecommerce flow (listings, product detail, cart, checkout, confirmation) and a multi-step SPA donation wizard.

## Features
- Products grid, product details, cart, checkout, and order confirmation
- Donation flow with steps: amount → details → payment → review → success
  - Monthly vs one‑time UX nudge; optional persistent monthly default (per device)
  - Client-side validation and `donation_step` error tracking
- Analytics helpers push to `dataLayer` (GTM/GA4) and Matomo `_mtm`
  - GA4 ecommerce basics with category hierarchy (`item_category...item_category5`)
  - List context on impressions (`item_list_name`, `item_list_id`, `index`)
  - Currency on cart/checkout; purchase includes optional tax/shipping
- Learn/Resources section for content (KB, FAQ, Testimonials)
  - Annotated with Matomo Content Tracking (impressions + interactions)
- A/B Test Lab page (`/ab-test-lab`) as a baseline surface for Optimizely Web experiments
- Consent banner with categories (analytics, marketing, experimentation) controlling tag behavior via Consent Mode (GTM always loads)
- Runtime config via `/config.json` generated from container env vars
- UX nicety: cart button shows a brief notification pulse when items are added


## Local Development

Prereqs: Node 18+.

- Install: `npm install`
- Dev: `npm run dev` → http://localhost:5173
- Build: `npm run build`
- Preview: `npm run preview`

Notes for dev:
- In dev, `/config.json` is served from `public/config.json`. Edit that file to set `GTM_ID`, `MATOMO_TAG_MANAGER_CONTAINER_URL`, etc. Do not commit secrets.
- In production (`npm start` or Docker), `/config.json` is generated from environment variables.
- For experiment dry-runs, open `http://localhost:5173/ab-test-lab` and use Optimizely preview to apply variants.

Environment variables for runtime config are read by the server only when running the Docker image or `npm start` with built assets. For local dev, tags won’t load unless your tools are inserted manually.

## Events & Data Layer
Key events emitted:
- `page_view`: on route changes/pages
- `view_item_list`: product list impressions, includes `item_list_name`, `item_list_id`, `items[].index`
- `view_item`: product detail
- `add_to_cart`: add to cart (with `ecommerce.currency`)
- `begin_checkout`: checkout start (with `ecommerce.currency`)
- `purchase`: order confirmation (includes `transaction_id`, `value`, `currency`, optional `tax`/`shipping`)
- `donation_step`: donation wizard step with metadata

Matomo Content Tracking (new):
- Impressions: automatic via `_paq.push(['trackAllContentImpressions']);` and `['trackVisibleContentImpressions']` in `index.html`
- Interactions: `_paq.push(['trackContentInteraction','click', name, piece, target])` on teaser/CTA clicks
- Markup: blocks have `class="matomoTrackContent"` and `data-content-name|piece|target` (we also add `data-track-content="true"` for clarity)
- SPA scans: pages also call `trackContentImpressionsWithinNode(document)` for SPA safety

Matomo via Tag Manager can consume the same ecommerce events from `_mtm`/`dataLayer`.

## Docker

Prebuilt image (GHCR)

Pull the prebuilt image:

```bash
docker pull ghcr.io/puttrix/shop404:latest
```

You can also use it in Compose with `image: ghcr.io/puttrix/shop404:latest`.

Compose (build locally)

```bash
# In the repo root, create a .env with your settings (example):
cat > .env << 'EOF'
PORT=3000
PUBLISH_PORT=8080
GTM_ID=GTM-XXXXXXX
GTM_SERVER_CONTAINER_URL=https://gtm.example.com
MATOMO_TAG_MANAGER_CONTAINER_URL=https://matomo.example.com/js/container_ABC123.js
OPTIMIZELY_WEB_SNIPPET_URL=
ODP_SDK_URL=
EOF

# Bring up the app (builds the image locally)
docker compose up -d

# App is at http://localhost:${PUBLISH_PORT:-8080}
```

Compose (pull from GHCR)

```bash
# Same .env as above (PORT, PUBLISH_PORT, GTM_ID, etc.)
docker compose -f docker-compose.registry.yml up -d

# App is at http://localhost:${PUBLISH_PORT:-8080}
```

docker run (build locally)

```bash
docker build -t shop404 .
docker run -p 8080:3000 \
  -e GTM_ID=GTM-XXXXXXX \
  -e GTM_SERVER_CONTAINER_URL=https://gtm.example.com \
  -e MATOMO_TAG_MANAGER_CONTAINER_URL=https://matomo.example.com/js/container_ABC123.js \
  -e OPTIMIZELY_WEB_SNIPPET_URL=https://cdn.optimizely.com/js/PROJECT_ID.js \
  -e ODP_SDK_URL=https://cdn.foqt.com/v1/odp.js \
  shop404
```

App serves at http://localhost:8080. `/config.json` reflects env settings.

Publish image to GHCR (CI)
- This repo includes a GitHub Actions workflow (`.github/workflows/publish.yml`) that builds and pushes `ghcr.io/OWNER/REPO` on pushes to `main` and tags.
- Run via Actions or manually with `workflow_dispatch`.

docker run (from GHCR image)
```bash
docker run -p 8080:3000 \
  -e GTM_ID=GTM-XXXXXXX \
  -e GTM_SERVER_CONTAINER_URL=https://gtm.example.com \
  -e MATOMO_TAG_MANAGER_CONTAINER_URL=https://matomo.example.com/js/container_ABC123.js \
  ghcr.io/puttrix/shop404:latest
```

## Portainer (Deploy from Git)
See `docs/PORTAINER.md` for full steps, env matrix, and troubleshooting.
Quick outline:
1. Push this repo (or your fork) to Git.
2. Portainer → Stacks → Add stack → Repository:
   - Repository URL: your Git URL
   - Compose path: `docker-compose.yml`
   - Auto-update: optional
3. Set env vars in the stack: `GTM_ID`, `MATOMO_TAG_MANAGER_CONTAINER_URL`, `OPTIMIZELY_WEB_SNIPPET_URL`, `ODP_SDK_URL`.
4. Deploy. Access at `http://YOUR-HOST:8080`. Check `/config.json` for your settings.

## Configuration Notes
- Consent Mode: The banner sets Google Consent Mode v2. Defaults are denied; updates occur on user choice. GTM always loads but respects consent.
- GTM-first: Configure GA4 (and other tags) inside GTM. No direct GA4 snippet is used in the app.
- sGTM (optional): If you have a GTM Server container, set `GTM_SERVER_CONTAINER_URL` to your custom domain. The app pushes it as `transport_url` into `dataLayer` before GTM loads; bind GA4 Configuration → Transport URL to `{{DLV - transport_url}}` in GTM to route GA4 hits via sGTM.
- Matomo: Use Matomo Tag Manager (MTM). Set `MATOMO_TAG_MANAGER_CONTAINER_URL` to your container script URL, e.g. `https://matomo.example.com/js/container_ABC123.js`.
- Optimizely Web: provide the snippet URL to test activation and variations.
- ODP: if you have a web SDK snippet, set `ODP_SDK_URL` and configure inside your tag manager.
 - Donation defaults: if the user opts in, the app stores `donation_default_interval=monthly` in `localStorage` to preselect monthly in future sessions.
 - Crawling/Indexing: This demo ships with robots blocking enabled:
   - `public/robots.txt` disallows all (`Disallow: /`).
   - `index.html` sets `<meta name="robots" content="noindex, nofollow">`.
   - `server.js` sets the `X-Robots-Tag: noindex, nofollow` header.
   Remove or adjust these if you want the site indexed.
 - Design shell: The Neo style is enabled by default (`style-neo` on `<html>`). The Classic toggle is hidden; re-enable by adding `StyleToggle` back into `Header.jsx` and adjusting the loader in `index.html`.

## Google Tag Manager / GA4 (Quick Setup)
- Import variables + triggers (optional): `docs/gtm/container_shop404.json` (Workspace import)
- GA4 Configuration tag:
  - Measurement ID: your GA4 property ID
  - Send a page view event: disabled (app pushes `page_view`)
  - Trigger: All Pages (consent-aware by default)
- GA4 Event tags (one per event):
  - `page_view`: params → `page_name`
  - `view_item_list`: params → `item_list_name`, `item_list_id`, `items`
  - `view_item`: params → `items`
  - `add_to_cart`: params → `currency`, `items`
  - `begin_checkout`: params → `currency`, `items`
  - `purchase`: params → `transaction_id`, `value`, `currency`, `tax`, `shipping`, `items`
  - `donation_step`: params → `step` (+ optional `amount`, `interval`, `error`)
- Triggers: Custom Event equals the app event (`evt.*` if you imported, or create custom event per name)
- Validate: GTM Preview (Consent Overview), GA4 DebugView (events, items, currency)
- Guide: `docs/GTM_CONTAINER.md`

## Matomo Tag Manager (Quick Setup)
- Prereq: Create an MTM container for your Matomo site and add a “Matomo Configuration” tag (Site ID + Tracker URL). The app loads MTM early; consent is enforced via `_paq.requireConsent` + consent events.
- Variables (DLV): `ecommerce`, `ecommerce.items`, `ecommerce.transaction_id`, `ecommerce.value`, `ecommerce.currency`, `ecommerce.tax`, `ecommerce.shipping`, plus `consent.*` from `cookies_update`.
- Triggers: `evt.update_cart`, `evt.begin_checkout`, `evt.purchase`, `evt.donation_step`, and consent events `cookies_*` as needed.
- Tag (Ecommerce Order):
  - Order ID → `{{ecommerce.transaction_id}}`
  - Grand Total → `{{ecommerce.value}}`
  - Currency → `{{ecommerce.currency}}` (if supported)
  - Items → `{{ecommerce.items}}` (if template supports array); otherwise use Custom HTML with `_paq`:
    ```html
    <script>
      var e={{ecommerce}}||{}, items=e.items||[];
      items.forEach(function(i){ _paq.push(['addEcommerceItem', i.item_id, i.item_name, i.item_category, i.price, i.quantity||1]); });
      _paq.push(['trackEcommerceOrder', e.transaction_id, e.value, e.subtotal||e.value, e.tax||0, e.shipping||0]);
    </script>
    ```
- Notes: The app includes `currency` (USD); purchases include `tax`/`shipping` when available. Full guide: `docs/MATOMO_ECOMMERCE_MAPPING.md`.

Cart updates (`update_cart`):
- Matomo uses `update_cart` and expects FULL CART state, not just the added item.
- The app emits `_mtm` `update_cart` on add/remove/quantity changes and at `begin_checkout` for parity.
- See “Cart Update with FULL CART” snippet and `syncMatomoCart` helper in `docs/MATOMO_ECOMMERCE_MAPPING.md`.

## Structure
- `src/pages`: pages and donation wizard steps
- `src/pages/learn`: Learn landing, articles, FAQ, testimonials
- `src/components`: shared UI and consent banner
- `src/state`: simple cart state with localStorage persistence
- `src/utils/analytics.js`: unified event helpers and tag loader
- `server.js`: static file server and runtime config endpoint

## Roadmap & Ideas
- See `docs/ROADMAP.md` for themes, milestones, backlog, and decisions. Add ideas there as short bullets; move items across sections as work progresses.
  - For analytics specifics, see `docs/ANALYTICS.md` (Consent Mode, GTM-first, MTM-only, events).
  - For event mappings and QA steps, see `docs/ANALYTICS_PARITY.md`.
  - For GA4 ecommerce item payload examples per event, see `docs/GA4_ECOMMERCE_EXAMPLES.md`.
  - For Matomo Tag Manager ecommerce mapping (variables, triggers, tags), see `docs/MATOMO_ECOMMERCE_MAPPING.md`.
  - For Google Tag Manager setup (GA4 config, DLVs, triggers, tags), see `docs/GTM_CONTAINER.md`.
  - Importable GTM container (variables + triggers): `docs/gtm/container_shop404.json`.
  - UI/Theme notes (dark mode, mobile header) are kept in `docs/DESIGN_NOTES.md`.

## Testing
- Run analytics payload checks: `npm run test:analytics`
  - Verifies GA4 payload structure (list context, category hierarchy, currency on cart/checkout, purchase tax/shipping) and donation error tracking.
- Run Matomo cart sync checks: `npm run test:matomo`
  - Verifies `_mtm` `update_cart` emits FULL CART on add/remove/quantity change and at `begin_checkout`, plus mapping of item quantities.
 - Manual: verify Matomo content impressions/interactions in MTM Preview on `/learn` and `/learn/articles`

## For Developers: dataLayer and _mtm pushes
See also: `docs/DEVELOPERS.md` for setup, helper API, data models, and debugging tips.

## Contributing
See `CONTRIBUTING.md` for branches, PR guidelines, testing, style, and docs expectations.
You can emit analytics events either via the helper functions in `src/utils/analytics.js` or by pushing directly to `window.dataLayer` (GTM/GA4) and `window._mtm` (Matomo Tag Manager). The helpers automatically respect consent and load tags when needed.

Quick start with helpers:

```js
import { trackPage, trackProductImpression, trackViewItem, trackAddToCart, trackBeginCheckout, trackPurchase, trackDonationStep, syncMatomoCart } from './src/utils/analytics.js';

trackPage('Home');
trackProductImpression(product, { item_list_name: 'Home Featured', item_list_id: 'home_grid', index: 1 });
trackViewItem(product);
trackAddToCart(product, 2);
trackBeginCheckout(itemsArray);
trackPurchase('ORD-123', 121.80, itemsArray, { tax: 9.80, shipping: 5.00, coupon: 'SUMMER10' });
trackDonationStep('details', { error: 'validation', fields: ['email'] });
// Optional: keep Matomo cart parity in custom UIs
syncMatomoCart(itemsArray);

// Matomo Content Tracking (helpers)
import { trackContentScan, trackContentClick } from './src/utils/analytics.js';
// Trigger a scan after rendering a block/route
trackContentScan(document);
// On teaser/CTA click
trackContentClick({ name: 'KB Teaser', piece: 'Hoodie Sizing Guide', target: '/learn/articles/hoodie-fit-and-sizing' });



## Consent Events (Matomo)
- The banner emits `_mtm` consent events to help gate MTM tags:
  - `cookies_necessary`, `cookies_functional`, `cookies_statistical` (analytics), `cookies_marketing`
- It also queues `_paq.requireConsent` early, then calls `_paq.rememberConsentGiven()` / `_paq.forgetConsentGiven()` on user choice.
- See `docs/MATOMO_ECOMMERCE_MAPPING.md` for MTM triggers, consent DLVs, and examples.

Consent events table (quick reference):

| Event | Purpose | Fires when |
|---|---|---|
| `cookies_necessary` | Baseline consent category | Always true (non-optional) |
| `cookies_functional` | Functional/site personalization | Functional toggle is enabled |
| `cookies_statistical` | Analytics/measurement | Analytics toggle is enabled |
| `cookies_marketing` | Marketing/ads | Marketing toggle is enabled |
| `cookies_update` | Snapshot payload for conditions | Always on change; includes `consent.{necessary,functional,analytics,marketing,experimentation}` |

Functional-only tags (MTM): trigger on `cookies_functional` or on `cookies_update` with condition `{{dlv.consent_functional}} equals true` to run personalization scripts only when functional cookies are allowed.

## Parity Cheatsheet (GA4 vs Matomo)
- GA4 add_to_cart vs Matomo update_cart: GA4 tracks single add events; Matomo expects FULL CART via `update_cart` (also emitted at `begin_checkout`).
- Early load: Both GTM and MTM load early; GTM behavior is governed by Consent Mode v2, MTM by `_paq.requireConsent` + `cookies_*` events.
- Purchase mapping: Both use `transaction_id`, `value`, `currency` (plus `tax`/`shipping` when available). Ensure unique IDs.
- Category hierarchy: Helpers emit GA4 `item_category..item_category5` and a Matomo-friendly `item_category_path` array.

## Troubleshooting (Matomo)
- Tags not firing: Confirm `_paq.requireConsent` is queued and that `cookies_*` consent events arrive; verify triggers listen to `update_cart` (not `add_to_cart`).
- Stale cart totals: Ensure an `update_cart` fires after quantity/remove actions and again at `begin_checkout` before `purchase`.
- Order missing: Check `transaction_id` uniqueness and that `grandTotal` equals expected sum (subtotal ± tax/shipping).
- Preview: Use MTM Preview to inspect Data Layer Variables and event payloads (`_mtm` queue) in real time.
```

Direct push reference (GA4-style payloads):

```js
// Always use consistent schemas and include currency where applicable
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({ event: 'page_view', page_name: 'Home' });

window.dataLayer.push({
  event: 'view_item_list',
  ecommerce: {
    item_list_name: 'All Products',
    item_list_id: 'products_all',
    items: [{
      item_id: 'p-1',
      item_name: 'Aurora Hoodie',
      price: 59.0,
      // Category hierarchy (helpers also add item_category_path for Matomo)
      item_category: 'Apparel',
      item_category2: 'Hoodies',
      index: 1
    }]
  }
});

window.dataLayer.push({
  event: 'view_item',
  ecommerce: { items: [{ item_id: 'p-1', item_name: 'Aurora Hoodie', price: 59.0, item_category: 'Apparel' }] }
});

window.dataLayer.push({
  event: 'add_to_cart',
  ecommerce: { currency: 'USD', items: [{ item_id: 'p-1', item_name: 'Aurora Hoodie', price: 59.0, quantity: 2 }] }
});

window.dataLayer.push({
  event: 'begin_checkout',
  ecommerce: { currency: 'USD', items: itemsArray }
});

window.dataLayer.push({
  event: 'purchase',
  ecommerce: {
    transaction_id: 'ORD-123',
    value: 121.80,
    currency: 'USD',
    tax: 9.80,
    shipping: 5.00,
    items: itemsArray
  }
});

// Donation custom step
window.dataLayer.push({ event: 'donation_step', step: 'payment', amount: 25, interval: 'monthly' });
```

## Product Photos
- Place your product photos in `public/images/product_photos/`.
- File naming: use a slug of the product name, e.g. `Aurora Hoodie` → `aurora-hoodie.jpg`. Optional: add a `aurora-hoodie.webp` next to it for modern browsers.
- The app prefers WebP when present via a `<picture>` element and falls back to JPG automatically.
- Generate WebP versions:
  - Optional toolchain: install `sharp` (`npm i -D sharp`) or ensure `cwebp` is in PATH.
  - Run: `npm run images:webp` to create `.webp` next to `.jpg/.png` files.
- Style toggle:
  - Photos are used regardless of theme; switching `Classic`/`Neo` changes the chrome, not the photo mapping.
 - Hero images:
   - Place `public/images/hero_l.png` (light) and `public/images/hero_d.png` (dark); run `npm run images:webp` to generate `*.webp`.
   - The hero switches live with the theme toggle; prefers WebP with PNG fallback.

Mirroring to Matomo Tag Manager (use `update_cart`):

```js
if (window._mtm) {
  // Matomo expects FULL CART on cart updates. Provide the full items array if possible.
  window._mtm.push({ event: 'update_cart', ecommerce: { currency: 'USD', items: [{ item_id: 'p-1', item_name: 'Aurora Hoodie', price: 59.0, quantity: 2 }] } });
}
```

Best practices:
- Push events after user interactions or route changes. The consent banner gates tag behavior; early pushes are buffered in `dataLayer`.
- Include `currency` on cart/checkout/purchase; keep a unique `transaction_id` for each order.
- Use GA4 item fields exactly (`item_id`, `item_name`, `price`, `quantity`, `item_category...item_category5`).
- For list impressions, include `item_list_name`, `item_list_id`, and per‑item `index`.
- For category hierarchies, prefer `product.categoryPath = ['Level1','Level2']` to have helpers emit the right GA4 fields.
- Verify with GTM Preview (and Matomo preview) and see `/docs/*` guides for mappings and QA.

## Debugging
- Console markers show GTM lifecycle when running locally (init start, event push, script append). Toggle with `window.__DEBUG_ANALYTICS__ = true|false`.
- See `docs/ANALYTICS.md` for event names, consent mapping, and GTM/MTM setup tips.

## Security & Privacy
This is a mock app with no real payments. Do not collect real personal data. The consent banner and tracking logic are for demonstration only.

## License
For demo/testing purposes only.
