# Developers Guide

A quick, practical reference for working on MockShop locally: setup, APIs, data models, and debugging tips.

## Prereqs & Setup
- Node 18+
- Install deps: `npm install`
- Dev server: `npm run dev` → http://localhost:5173
- Build: `npm run build`
- Preview: `npm run preview`
- Prod server (serves dist + runtime config): `npm start`

Config sources
- Dev: `public/config.json` (do not commit secrets). Set `GTM_ID`, `MATOMO_TAG_MANAGER_CONTAINER_URL`, etc.
- Prod: environment variables → served at `/config.json` by `server.js`.

## SPA Routes (key)
- `/` Home, `/products`, `/products/:id`
- `/cart`, `/checkout`, `/order-confirmation`
- `/donate/*` (wizard)
- `/learn`, `/learn/articles`, `/learn/articles/:slug`, `/learn/faq`, `/learn/testimonials`

## Analytics Helpers (src/utils/analytics.js)
All helpers respect consent and load tags as needed.
- `trackPage(name, extra?)`
- `trackProductImpression(product, listCtx?)`
- `trackViewItem(product)`
- `trackAddToCart(product, qty)`
- `trackBeginCheckout(items)`
- `trackPurchase(orderId, value, items, meta?)` where `meta = { currency?, tax?, shipping?, coupon? }`
- `trackDonationStep(step, data?)`
- `syncMatomoCart(items)` → Matomo `update_cart` with full cart state
- Content tracking (Matomo):
  - `trackContentScan(node=document)` → `_paq.push(['trackContentImpressionsWithinNode', node])`
  - `trackContentClick({ name, piece, target })` → `_paq.push(['trackContentInteraction','click', ...])`

Notes
- GA4 events are pushed to `window.dataLayer`; Matomo events mirror into `window._mtm` when available.
- Matomo cart parity: `trackAddToCart` also emits `_mtm` `update_cart` with FULL CART.

## Consent & Tag Loading
- Consent defaults to denied in `index.html` (Consent Mode v2). The banner updates on choice.
- GTM loads early via `__loadGTM` from runtime config.
- MTM loads early via `__loadMTM` from runtime config; `_paq.requireConsent` is queued.
- Content impressions enabled globally: `_paq.push(['trackAllContentImpressions']);` and `['trackVisibleContentImpressions']`.
- Banner emits events to both `dataLayer` and `_mtm`: `cookies_necessary`, `cookies_functional`, `cookies_statistical` (analytics), `cookies_marketing`, plus `cookies_update` with `{ consent }` snapshot and revocation events.

## Data Models
- Product (src/data/products.js): `{ id, name, price, category | categoryPath[] }`
- Cart item (app state): `{ id, name, price, qty, variant }`
- GA4 item (analytics): `{ item_id, item_name, price, quantity, item_category...item_category5 }`
- KB Article (src/data/kb.js): `{ slug, title, excerpt, body, topics[], products[], readingMinutes }`
- FAQ (src/data/faqs.js): `{ q, a, topics[] }`
- Testimonial (src/data/testimonials.js): `{ id, quote, author, role, rating, productId }`

## Adding Content (Learn)
- Add articles to `src/data/kb.js`, FAQs to `src/data/faqs.js`, testimonials to `src/data/testimonials.js`.
- Annotate new teasers/tiles with `class="matomoTrackContent"` and `data-content-name|piece|target`. Optionally add `data-track-content="true"`.
- On click handlers, call `trackContentClick({ name, piece, target })`.

## UX Notes
- Cart button shows a brief pulse when item count increases (Header component + CSS in `src/index.css`).

## Testing & Debugging
- Analytics payload checks: `npm run test:analytics`
- Matomo cart sync checks: `npm run test:matomo`
- Enable console markers locally: `window.__DEBUG_ANALYTICS__ = true`
- Verify GTM in Preview (Consent Overview) and Matomo via MTM Preview.
- Check `/config.json` reflects current runtime config.

## Conventions
- React + Vite + Tailwind; utility-first styles in `src/index.css` and component classes.
- SPA page titles via `src/utils/seo.js` `setTitle()`.
- Cart state persisted to `localStorage` under key `cart`.

