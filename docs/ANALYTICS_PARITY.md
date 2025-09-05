# Analytics Parity — Event Mapping & QA Checklist

Purpose: Ensure emitted events from the app align across GTM/GA4 and Matomo Tag Manager (MTM), with clear parameters, trigger guidance, and a practical QA checklist.

## Scope
- Platforms: Google Tag Manager (GTM) with GA4; Matomo Tag Manager (MTM)
- Sources: App pushes to `window.dataLayer` and mirrors to `window._mtm` when available
- Consent: Analytics events fire only when `analytics` consent is allowed (Consent Mode v2)

## Event Mapping Matrix

| App Event | GA4 Event (via GTM) | Key Params (GA4) | MTM Mapping (suggestion) |
|---|---|---|---|
| `page_view` | `page_view` | `page_title`/`page_location` (derive), custom `page_name` | Custom Event trigger: event equals `page_view`; Fire a Matomo “Page View” Tag (auto URL); optionally set Custom Dimension for `page_name` |
| `view_item_list` | `view_item_list` | `item_list_name?`, `item_list_id?`, `items[]` (id, name, category, price, `index?`) | Custom Event trigger: `view_item_list`; use Matomo “Custom Event” or Data Layer to populate a Matomo Ecommerce “Product View/List” tag (if using plugin) |
| `view_item` | `view_item` | `items[]` (id, name, price, category optional) | Trigger: `view_item`; Matomo Ecommerce “Product Detail View” (Product SKU/Name/Category from item[0]) |
| `add_to_cart` | `add_to_cart` | `currency`, `items[]` (id, name, price, quantity) | Trigger: `add_to_cart`; Matomo Ecommerce “Add to Cart” with item fields mapped from Data Layer |
| `begin_checkout` | `begin_checkout` | `currency`, `items[]` | Trigger: `begin_checkout`; Matomo Ecommerce “Cart Update/Checkout Start” (Cart value from sum of items) |
| `purchase` | `purchase` | `transaction_id`, `value`, `currency`, `tax` (opt), `shipping` (opt), `coupon` (opt), `items[]` | Trigger: `purchase`; Matomo Ecommerce “Order” tag mapping Order ID, Revenue, Tax, Shipping, Items |
| `donation_step` | `donation_step` (custom GA4) | `step` plus any metadata (e.g., `amount`, `interval`, `error`) | Trigger: `donation_step`; Matomo “Custom Event” or “Event” with Category `donation`, Action `step:{step}`, and Labels/Dimensions from metadata |

Notes:
- GA4 ecommerce items should use the standard GA4 item schema. At minimum: `item_id`, `item_name`, `price`, optionally `quantity`, `item_category`.
- For GA4 purchase, recommended params include `transaction_id`, `value`, `currency`. Tax/Shipping/Coupon are optional but preferred when available.
- MTM mappings can be implemented with Data Layer Variables pointing to `ecommerce.items[0].item_id`, etc., or with a Data Layer to Variables JSON path.
 - List context fields (`item_list_name`, `item_list_id`, `index`) are included by the app on list impressions.
 - The app includes `currency: 'USD'` on `add_to_cart` and `begin_checkout`.

## Sample Payloads (from the app)

```
// Page view
{ event: 'page_view', page_name: 'Home' }

// List impression
{ event: 'view_item_list', ecommerce: { items: [
  { item_id: 'p-1', item_name: 'Aurora Hoodie', item_category: 'Apparel', price: 59.0 }
] } }

// Product view
{ event: 'view_item', ecommerce: { items: [
  { item_id: 'p-1', item_name: 'Aurora Hoodie', price: 59.0 }
] } }

// Add to cart
{ event: 'add_to_cart', ecommerce: { items: [
  { item_id: 'p-1', item_name: 'Aurora Hoodie', price: 59.0, quantity: 1 }
] } }

// Begin checkout
{ event: 'begin_checkout', ecommerce: { items: [
  { item_id: 'p-1', item_name: 'Aurora Hoodie', price: 59.0, quantity: 1 }
] } }

// Purchase
{ event: 'purchase', ecommerce: {
  transaction_id: 'ord_12345',
  value: 118.0,
  currency: 'USD',
  items: [ { item_id: 'p-1', item_name: 'Aurora Hoodie', price: 59.0, quantity: 2 } ]
} }

// Donation step
{ event: 'donation_step', step: 'amount', amount: 25, interval: 'monthly' }
```

## GTM Configuration Hints
- Create GA4 Configuration Tag; enable Consent checks.
- Create GA4 Event Tags:
  - `view_item_list` with `items` from `Event Data -> ecommerce.items`
  - `view_item` with `items` as above
  - `add_to_cart`, `begin_checkout`, `purchase` with respective params; `purchase` includes `transaction_id`, `value`, `currency`
  - `donation_step` as a custom GA4 event; include `step` and relevant metadata
- Triggers: Custom Event triggers where Event Name equals the app event (e.g., `purchase`).
- Consent: Verify analytics_storage is granted before events dispatch (GTM Preview → Consent).

## MTM Configuration Hints
- Define Data Layer Variables (DLV) to map fields:
  - `ecommerce.items` (Array)
  - `ecommerce.items[0].item_id`, `item_name`, `price`, `quantity`
  - `ecommerce.transaction_id`, `value`, `currency`
  - `step`, `amount`, `interval` for donation
- Create Tags:
  - Ecommerce: “Order” (for `purchase`), “Add to Cart”, “Product View/List” as needed
  - Custom Event: for `donation_step` and `page_view` enrichment
- Triggers: Custom Event equals the app event name.
- Consent: Ensure container honors your consent model; load MTM only when analytics consent is true (the app already does this).

## QA Checklist
Run in Dev (Vite preview) and in built/Container environments.

- Consent Defaults: On first load, confirm Consent Mode set to `denied` (GTM Preview → Consent Overview).
- Analytics On: Accept analytics; verify GTM `gtm.js` loads and events start pushing.
- MTM Load: After consent, confirm MTM container script loads.
- Page View: Navigate between routes; see `page_view` pushes with `page_name`.
- List Impression: Visit product grid; verify one `view_item_list` with items populated.
- View Item: Open a product; verify `view_item` with correct `item_id`/`item_name`.
- Add to Cart: Add item; verify `add_to_cart` with quantity and price.
- Begin Checkout: Start checkout; verify `begin_checkout` with cart items.
- Purchase: Complete checkout; verify `purchase` with `transaction_id`, `value`, `currency`, and items.
- Donation Steps: Walk through donation wizard; verify `donation_step` events per step, including validation errors if emitted.
- Totals Consistency: For `purchase`, confirm `value` equals sum(price*qty) ± tax/shipping when applicable.
- Currency: Confirm `currency` present (USD default in app) and matches GA4 property settings.
- GTM Preview: All above events should appear with GA4 tags firing; no consent violations.
- Matomo Debug: In MTM/Matomo debug, confirm tags fire and orders/events appear.
- Edge: Decline analytics; verify no analytics events fire and MTM doesn’t load.

## Troubleshooting
- No events in GTM: Check Consent Overview; ensure analytics_storage is granted after banner.
- Items missing: Verify DLV paths (e.g., `ecommerce.items`) and that events include `items` arrays.
- MTM not loading: Ensure `MATOMO_TAG_MANAGER_CONTAINER_URL` is set and analytics consent granted.
- Purchase not attributed: Confirm unique `transaction_id` and `value` present; check tag triggers.
