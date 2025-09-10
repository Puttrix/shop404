# GTM Container — Setup & Mapping Guide

This guide helps you configure a Google Tag Manager container for Shop404. It maps app events to GA4 tags using Data Layer variables and Custom Event triggers. If you prefer importing a prebuilt container, use these steps as a checklist to recreate it safely in your GTM account.

Note: Shop404 follows a GTM‑first strategy. GA4 is configured inside GTM; the app only pushes events to `dataLayer` and loads GTM. Consent Mode v2 is set before tags load.

Matomo parity note:
- GA4 uses `add_to_cart`. Matomo uses `update_cart` and expects FULL CART updates (also at `begin_checkout`).
- This guide focuses on GTM/GA4. For Matomo mapping, consent events, and `update_cart`, see `docs/MATOMO_ECOMMERCE_MAPPING.md`.

## 1) Create GA4 Configuration
- Tag: Google Analytics: GA4 Configuration
- Measurement ID: your GA4 property’s ID
- Fields to set (optional):
  - Send a page view event: disabled (we push `page_view` ourselves)
- Consent: Ensure it respects Consent Mode (default if Consent is enabled in your container)
- Trigger: All Pages

## 2) Data Layer Variables (DLV)
Create these variables to read from pushed events.

- `dlv.ecommerce` → Data Layer Variable Name: `ecommerce`
- `dlv.items` → `ecommerce.items`
- `dlv.transaction_id` → `ecommerce.transaction_id`
- `dlv.value` → `ecommerce.value`
- `dlv.currency` → `ecommerce.currency`
- `dlv.step` → `step`
- Optional item helpers (for first item):
  - `dlv.item_id` → `ecommerce.items.0.item_id`
  - `dlv.item_name` → `ecommerce.items.0.item_name`
  - `dlv.item_category` → `ecommerce.items.0.item_category`
  - `dlv.item_category2` → `ecommerce.items.0.item_category2`
  - `dlv.item_price` → `ecommerce.items.0.price`
  - `dlv.item_quantity` → `ecommerce.items.0.quantity`

Tip: If your container doesn’t allow array index, use a Custom JS Variable to return `ecommerce.items[0]` and read fields from it.

## 3) Triggers (Custom Event)
Create a Custom Event trigger for each app event name:
- `evt.page_view` → Event name: `page_view`
- `evt.view_item_list` → `view_item_list`
- `evt.view_item` → `view_item`
- `evt.add_to_cart` → `add_to_cart`
- `evt.begin_checkout` → `begin_checkout`
- `evt.purchase` → `purchase`
- `evt.donation_step` → `donation_step`

Note: Matomo Tag Manager should trigger on `update_cart` instead of `add_to_cart`. This difference is intentional.

## 4) GA4 Event Tags
One GA4 Event Tag per event, using the GA4 Configuration Tag you created.

1) Page View
- Tag: GA4 Event
- Event name: `page_view`
- Event parameters:
  - `page_name` → `{{DLV - page_name}}` (or read from `event` data if you add it)
- Trigger: `evt.page_view`

2) Item List View (Impressions)
- Tag: GA4 Event
- Event name: `view_item_list`
- Parameters:
  - `item_list_name` → `{{ecommerce.item_list_name}}` (DLV to `ecommerce.item_list_name` if you create it)
  - `item_list_id` → `{{ecommerce.item_list_id}}`
  - `items` → `{{dlv.items}}`
- Trigger: `evt.view_item_list`

3) View Item
- Tag: GA4 Event
- Event name: `view_item`
- Parameters:
  - `items` → `{{dlv.items}}`
- Trigger: `evt.view_item`

4) Add To Cart
- Tag: GA4 Event
- Event name: `add_to_cart`
- Parameters:
  - `currency` → `{{dlv.currency}}` (defaults to `USD` from app)
  - `items` → `{{dlv.items}}`
- Trigger: `evt.add_to_cart`

5) Begin Checkout
- Tag: GA4 Event
- Event name: `begin_checkout`
- Parameters:
  - `currency` → `{{dlv.currency}}`
  - `items` → `{{dlv.items}}`
- Trigger: `evt.begin_checkout`

6) Purchase
- Tag: GA4 Event
- Event name: `purchase`
- Parameters:
  - `transaction_id` → `{{dlv.transaction_id}}`
  - `value` → `{{dlv.value}}`
  - `currency` → `{{dlv.currency}}`
  - `tax` → `{{ecommerce.tax}}` (DLV to `ecommerce.tax`)
  - `shipping` → `{{ecommerce.shipping}}` (DLV to `ecommerce.shipping`)
  - `items` → `{{dlv.items}}`
- Trigger: `evt.purchase`

7) Donation Step (Custom)
- Tag: GA4 Event
- Event name: `donation_step`
- Parameters:
  - `step` → `{{dlv.step}}`
  - Optional: map `amount`, `interval`, `error` if you add DLVs for them
- Trigger: `evt.donation_step`

## 5) Preview & QA
- Enter GTM Preview mode; load the app and accept analytics in the consent banner
- Navigate across pages and flows; verify events appear and GA4 Event tags fire
- See `docs/ANALYTICS_PARITY.md` for a thorough QA checklist

## 6) Notes & Tips
- Consent: GTM loads always but respects Consent Mode; confirm consent in GTM Preview → Consent Overview
- List Context: The app includes `item_list_name`, `item_list_id`, and per‑item `index` for `view_item_list`
- Category Hierarchy: Items include `item_category`…`item_category5` for GA4 and an `item_category_path` array for Matomo mapping
- Currency: The app includes `currency: 'USD'` on `add_to_cart` and `begin_checkout`; purchases include tax/shipping when available

For Matomo Tag Manager setup, see `docs/MATOMO_ECOMMERCE_MAPPING.md`.

## Server-side GTM (Optional)
If you use a GTM Server container (sGTM) with a custom domain (e.g., `https://gtm.example.com`), you can direct GA4 hits through it.

App support:
- The server can expose `GTM_SERVER_CONTAINER_URL` at `/config.json`.
- On startup, the app pushes `{ transport_url: '<your-sgtm-url>' }` into `dataLayer` before GTM loads.

GTM configuration steps:
1) Create a Data Layer Variable:
   - Name: `DLV - transport_url`
   - Data Layer Variable Name: `transport_url`
2) Edit your GA4 Configuration tag:
   - Field: Transport URL
   - Value: `{{DLV - transport_url}}`
3) Preview and verify:
   - In GTM Preview, confirm `transport_url` appears on page load and GA4 hits go to your sGTM domain.

Notes:
- Consent: Consent Mode v2 is set before GTM. The GA4 client in sGTM will receive consent signals (via `gcs` parameter) automatically when using GTM/GA4.
- DNS: Point a first‑party subdomain (e.g., `gtm.example.com`) to your sGTM endpoint (per Google’s setup guide). Ensure HTTPS.
- No change to the GTM web snippet is required; only GA4 traffic routing changes via Transport URL.

## Importable Container (Variables + Triggers)
- File: `docs/gtm/container_shop404.json`
- Contains: Data Layer Variables and Custom Event triggers for all app events
- After import: create GA4 Configuration and GA4 Event tags per the steps above

Notes:
- This export intentionally excludes tags to avoid linking to a hardcoded Measurement ID. Use your own GA4 ID via the “GA4 Measurement ID” Constant variable, then wire it into your GA4 Configuration tag.

## Consent Mode in GTM
- Ensure Consent Mode is enabled in Admin → Container Settings when available.
- In Preview → Consent Overview, confirm `analytics_storage` becomes `granted` after banner acceptance.
- GA4 tags will automatically respect consent; do not force-fire without consent.

## DebugView & QA Checklist
- Open GA4 DebugView and GTM Preview side-by-side.
- Verify each event’s parameters and `items` array populate correctly.
- Check `purchase` has `transaction_id`, `value`, `currency`, `tax`, `shipping`.
- Confirm list impressions carry `item_list_name`, `item_list_id`, and `index`.
- Ensure no duplicate `purchase` events per transaction when reloading confirmation page.

## Common Pitfalls
- Missing items: Map `items` from `ecommerce.items` exactly; avoid renaming fields.
- Currency not set: Ensure `currency` is passed on cart/checkout and purchase.
- Consent blocked: Events show but tags don’t fire; check Consent Overview.
- Duplicate purchases: Use a unique `transaction_id` and avoid re-firing on page refresh (the app uses sessionStorage; you can add GTM guards if needed).
