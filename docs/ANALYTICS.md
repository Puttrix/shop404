# Analytics Integration

This project is configured GTM‑first with Google Consent Mode v2 and Matomo Tag Manager (MTM‑only). The app emits a common set of ecommerce and flow events to `dataLayer` (for GTM/GA4) and `_mtm` (for Matomo).

## Loading Order
- Consent Mode defaults: index.html sets all consent to `denied` before any tags load.
- GTM load: index.html loads GTM as early as possible (either via meta `gtm-id` or runtime `/config.json`). GTM always loads; behavior is governed by Consent Mode.
- MTM load: index.html loads Matomo Tag Manager as early as possible when `MATOMO_TAG_MANAGER_CONTAINER_URL` is configured. The tracker is initialized with `_paq.push(['requireConsent'])`; the banner updates Matomo consent via `_paq.rememberConsentGiven()` / `_paq.forgetConsentGiven()`.

## Consent Mapping
- analytics_storage: mirrors banner `analytics` category
- ad_storage, ad_user_data, ad_personalization: mirror banner `marketing` category

On first load, defaults are denied. On user choice, the banner calls `gtag('consent','update', ...)` accordingly.

## Events
Emitted to `dataLayer` and, when available, mirrored to `_mtm`:
- page_view: `{ event: 'page_view', page_name }`
- view_item_list: `{ event: 'view_item_list', ecommerce: { item_list_name?, item_list_id?, items: [{ item_id, item_name, item_category..., index?, price }] } }`
- view_item: `{ event: 'view_item', ecommerce: { items: [{ item_id, item_name, item_category..., price }] } }`
- add_to_cart (GA4): `{ event: 'add_to_cart', ecommerce: { currency: 'USD', items: [{ item_id, item_name, item_category..., price, quantity }] } }`
  - Matomo receives `update_cart` instead of `add_to_cart` and always with the FULL CART (also on quantity/remove and at `begin_checkout`).
- begin_checkout: `{ event: 'begin_checkout', ecommerce: { currency: 'USD', items } }`
- purchase: `{ event: 'purchase', ecommerce: { transaction_id, value, currency: 'USD', tax?, shipping?, coupon?, items } }`
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

Notes:
- Category hierarchy is provided via GA4 fields `item_category` … `item_category5` and a helper `item_category_path` array for Matomo mapping.
- List impressions can include `item_list_name`, `item_list_id`, and per-item `index`.

See also:
- `docs/GA4_ECOMMERCE_EXAMPLES.md` for per-event payload examples
- `docs/MATOMO_ECOMMERCE_MAPPING.md` for MTM variable/tag setup, consent events, and `update_cart` parity

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
- Network: confirm both `gtm.js` and the MTM container script load on page start; MTM tag firing is governed by Matomo consent and app-emitted `cookies_*` events.

## Notes
- GA4 is configured inside GTM (no direct GA4 snippet in the app).
- Matomo is MTM‑only (no direct tracker fallback). Configure your MTM container to consume `dataLayer`/`_mtm` events and map them to Matomo tags.
