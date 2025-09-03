# Analytics Integration

This project is configured GTM‑first with Google Consent Mode v2 and Matomo Tag Manager (MTM‑only). The app emits a common set of ecommerce and flow events to `dataLayer` (for GTM/GA4) and `_mtm` (for Matomo).

## Loading Order
- Consent Mode defaults: index.html sets all consent to `denied` before any tags load.
- GTM load: index.html loads GTM as early as possible (either via meta `gtm-id` or runtime `/config.json`). GTM always loads; behavior is governed by Consent Mode.
- MTM load: analytics.js loads Matomo Tag Manager when `analytics` consent is granted and `MATOMO_TAG_MANAGER_CONTAINER_URL` is configured.

## Consent Mapping
- analytics_storage: mirrors banner `analytics` category
- ad_storage, ad_user_data, ad_personalization: mirror banner `marketing` category

On first load, defaults are denied. On user choice, the banner calls `gtag('consent','update', ...)` accordingly.

## Events
Emitted to `dataLayer` and, when available, mirrored to `_mtm`:
- page_view: `{ event: 'page_view', page_name }`
- view_item_list: `{ event: 'view_item_list', ecommerce: { items: [{ item_id, item_name, item_category, price }] } }`
- view_item: `{ event: 'view_item', ecommerce: { items: [{ item_id, item_name, price }] } }`
- add_to_cart: `{ event: 'add_to_cart', ecommerce: { items: [{ item_id, item_name, price, quantity }] } }`
- begin_checkout: `{ event: 'begin_checkout', ecommerce: { items } }`
- purchase: `{ event: 'purchase', ecommerce: { transaction_id, value, currency, items } }`
- donation_step: `{ event: 'donation_step', step, ...metadata }`

Example GA4 item schema (used in all ecommerce events):
```
{
  item_id: 'p-1',
  item_name: 'Aurora Hoodie',
  item_category: 'Apparel',
  price: 59.0,
  quantity: 1
}
```

## Configuration
- Dev: edit `public/config.json`
  - `GTM_ID`: your GTM container ID
  - `MATOMO_TAG_MANAGER_CONTAINER_URL`: full URL to your MTM container script
  - Other optional tags (e.g., `OPTIMIZELY_WEB_SNIPPET_URL`, `ODP_SDK_URL`)
- Prod / Docker / Portainer: set the same values via environment variables; the server exposes them at `/config.json`.

## Debugging
- GTM lifecycle logs appear in Console on localhost (init start, event push, script appended). Toggle with `window.__DEBUG_ANALYTICS__ = true|false`.
- Use GTM Preview to verify Consent Overview and event triggers.
- Inspect `window.dataLayer` and `window._mtm` arrays to see pushed events.
- Network: confirm `gtm.js` loads on page start; MTM container loads only after analytics consent is granted.

## Notes
- GA4 is configured inside GTM (no direct GA4 snippet in the app).
- Matomo is MTM‑only (no direct tracker fallback). Configure your MTM container to consume `dataLayer`/`_mtm` events and map them to Matomo tags.

