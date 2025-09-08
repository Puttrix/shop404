# Matomo Tag Manager — Ecommerce Mapping Guide

This guide shows how to configure Matomo Tag Manager (MTM) to consume the app’s events and track ecommerce reliably (product/category details and order totals).

The app pushes events to both `window.dataLayer` and `window._mtm` with GA4-style ecommerce payloads. MTM can read either; we’ll refer to the event name and the `ecommerce` object throughout.

Event naming note:
- GA4: uses `add_to_cart`.
- Matomo: uses `update_cart` for cart state synchronization. The app emits `update_cart` to `_mtm` on add‑to‑cart, quantity changes, item removal, and at `begin_checkout` to ensure full‑cart parity. It does not push `_mtm` `add_to_cart`.

## Prerequisites
- A Matomo site (Site ID) and a Matomo Tag Manager container for that site.
- In the MTM container, add a “Matomo Configuration” tag with your Site ID and Tracker URL.
- Ensure consent integration in MTM matches your policy. MTM loads early (like GTM) via `index.html` when `MATOMO_TAG_MANAGER_CONTAINER_URL` is configured; use MTM’s consent controls to govern tag behavior.

## Data Layer Variables (DLV)
Create these Variables in MTM to map from the pushed event payloads. Use Data Layer Variable type.

- `dlv.event` → Path: `event`
- `dlv.ecommerce` → Path: `ecommerce`
- `dlv.items` → Path: `ecommerce.items`
- `dlv.transaction_id` → Path: `ecommerce.transaction_id`
- `dlv.value` → Path: `ecommerce.value`
- `dlv.currency` → Path: `ecommerce.currency`

Consent helper variables (for `cookies_update` payload):
- `dlv.consent` → Path: `consent`
- `dlv.consent_necessary` → Path: `consent.necessary`
- `dlv.consent_functional` → Path: `consent.functional`
- `dlv.consent_analytics` → Path: `consent.analytics`
- `dlv.consent_marketing` → Path: `consent.marketing`
- `dlv.consent_experimentation` → Path: `consent.experimentation`

Usage examples:
- Trigger condition on `cookies_update`: `{{dlv.consent_functional}} equals true` to gate functional-only tags.
- Combined condition: Fire tag if `{{dlv.consent_analytics}}` OR `{{dlv.consent_marketing}}` is true.

Optionally, create item-first helpers (use a Custom JavaScript Variable if your DLV doesn’t support array indexing):

Custom JS Variable `cjs.firstItem`
```
function() {
  var e = {{dlv.ecommerce}}; 
  if (!e || !e.items || !e.items.length) return null; 
  return e.items[0];
}
```

Then DLVs or CJS for item fields:
- `cjs.item_id` → `function(){var i={{cjs.firstItem}};return i&&i.item_id||null;}`
- `cjs.item_name` → `function(){var i={{cjs.firstItem}};return i&&i.item_name||null;}`
- `cjs.item_category` → `function(){var i={{cjs.firstItem}};return i&&i.item_category||null;}`
- `cjs.item_price` → `function(){var i={{cjs.firstItem}};return i&&i.price||null;}`
- `cjs.item_quantity` → `function(){var i={{cjs.firstItem}};return i&&i.quantity||1;}`

Tip: If your MTM supports array indexing in DLVs, you can also use `ecommerce.items.0.item_id`, etc., instead of CJS.

## Triggers (Custom Event)
Create a Custom Event trigger per app event name:
- `evt.page_view` → Event name equals `page_view`
- `evt.view_item_list` → `view_item_list`
- `evt.view_item` → `view_item`
- `evt.update_cart` → `update_cart`
- `evt.begin_checkout` → `begin_checkout`
- `evt.purchase` → `purchase`
- `evt.donation_step` → `donation_step`

Consent events (emitted by the app to `_mtm`):
- `evt.cookies_necessary` → `cookies_necessary`
- `evt.cookies_functional` → `cookies_functional`
- `evt.cookies_statistical` → `cookies_statistical` (maps to app’s `analytics` consent)
- `evt.cookies_marketing` → `cookies_marketing` (maps to app’s `marketing` consent)
- Optional consolidated: `cookies_update` (contains `{ consent: { necessary, functional, analytics, marketing, experimentation } }`)

Tip: The app does not push `_mtm` `add_to_cart`. Use `update_cart` for Matomo cart sync; GA4 still receives `add_to_cart`.

## SPA Pageviews (MTM‑only)
For single‑page app navigation, the app pushes `{ event: 'page_view' }` to `window._mtm` on every route change. To record pageviews in Matomo via Tag Manager (without direct `_paq` calls in app code):

1) Ensure your MTM container includes a Matomo Configuration tag (Site ID + Tracker URL) that fires early on all pages.
2) Create a Custom Event Trigger: `evt.page_view` (Event name equals `page_view`).
3) Add a “Matomo Analytics → Track Page View” tag and attach the `evt.page_view` trigger.
   - The tag will use the current `document.title` and `location.href`. The app updates `document.title` on route changes.
4) (Optional) Add consent gating: only fire the tag when your consent conditions are met (e.g., `{{dlv.consent_analytics}}` equals true or use MTM’s consent features).

Troubleshooting SPA PVs:
- If pageviews only appear on hard reloads, verify the `page_view` trigger exists and the tag fires on the Custom Event, not only on page load.
- Use Matomo Tag Manager preview to confirm that `page_view` events arrive and the “Track Page View” tag fires on navigation.
- Confirm the container script URL (`MATOMO_TAG_MANAGER_CONTAINER_URL`) is correct and loads on every route.

## Tags — Two Approaches
Prefer the MTM Ecommerce tag templates if available. If not, use Custom HTML with `_paq` commands.

### Consent Handling in MTM (Recommended)
- Add a small Custom HTML tag that runs early to enforce consent at the tracker level:
  ```html
  <script>
    window._paq = window._paq || [];
    _paq.push(['requireConsent']);
  </script>
  ```
- Create Custom Event triggers for the consent events above. Use them to call:
  ```html
  <!-- Triggered by cookies_statistical / cookies_marketing etc. when granted -->
  <script>
    window._paq = window._paq || [];
    _paq.push(['rememberConsentGiven']);
  </script>
  ```
- When consent is revoked (no optional categories), fire a Custom HTML tag on a dedicated trigger to call `forgetConsentGiven`:
  ```html
  <script>
    window._paq = window._paq || [];
    _paq.push(['forgetConsentGiven']);
  </script>
  ```

### Functional-Only Tagging Example
- Create a Custom Event Trigger: `evt.cookies_functional` (Event equals `cookies_functional`).
- Add a Custom HTML tag for a personalization script and attach the trigger:
  ```html
  <script>
    // Example: run site personalization init only when functional cookies are allowed
    (function(){
      var s = document.createElement('script');
      s.async = true; s.src = 'https://cdn.example.com/personalize.js';
      document.head.appendChild(s);
    })();
  </script>
  ```
  Optionally add a second trigger for `cookies_update` with a condition that `{{dlv.consent.functional}}` is true (if you parse the consent object), to re-evaluate on every update.

### A) Using MTM Ecommerce Tag Templates (Recommended)
Create the following tags and map variables accordingly.

1) Product Detail View (for `view_item`)
- Tag: Ecommerce Product View (or similar)
- SKU: `{{cjs.item_id}}`
- Name: `{{cjs.item_name}}`
- Category: `{{cjs.item_category}}`
- Price: `{{cjs.item_price}}`
- Trigger: `evt.view_item`

2) Cart Update (for `update_cart` and at Checkout)
- Important: Matomo expects cart updates to reflect the FULL CART, not just a single item.
- Tag: Ecommerce Cart Update
- Items Source: Full cart (see below). The app emits `_mtm` `update_cart` automatically when the cart changes and again at `begin_checkout`.
- Trigger: `evt.update_cart` (you may also OR with `evt.begin_checkout` if you prefer template-driven totals at checkout)

3) Checkout Start (additional sync, for `begin_checkout`)
- Tag: Ecommerce Cart Update (optional if you already handle `update_cart`)
- Total: sum of items (see “Totals” below) or map a variable if precomputed.
- Trigger: `evt.begin_checkout`

4) Order (for `purchase`)
- Tag: Ecommerce Order
- Order ID: `{{dlv.transaction_id}}`
- Grand Total: `{{dlv.value}}`
- Currency: `{{dlv.currency}}` (if supported in your template)
- Items: map `{{dlv.items}}` if supported. If the template requires separate product mappings, use a dedicated tag/recipe or the Custom HTML approach.
- Trigger: `evt.purchase`

5) Donation Steps (custom analytics)
- Tag: Track Event (Category: `donation`, Action: `step:{{step}}`, Label/Values from metadata)
- Trigger: `evt.donation_step`

### B) Using Custom HTML with `_paq` (Flexible)
If templates are limited, add Custom HTML tags that call Matomo’s tracker API.

Common helpers (add as a Custom HTML tag, no trigger):
```
<script>
  window.__sumItems = function(items){
    if(!items||!items.length) return 0;
    return items.reduce(function(t,i){var q=Number(i.quantity||1),p=Number(i.price||0);return t+(q*p);},0);
  };
  window.__addItems = function(items){
    if(!window._paq||!items) return;
    items.forEach(function(i){
      window._paq.push(['addEcommerceItem', i.item_id, i.item_name, i.item_category, i.price, i.quantity||1]);
    });
  };
</script>
```

Tags:
1) `view_item` → Product View
```
<script>
  var e={{dlv.ecommerce}}||{}; var items=e.items||[]; if(!items.length) return;
  var i=items[0];
  _paq.push(['setEcommerceView', i.item_id, i.item_name, i.item_category, i.price]);
  _paq.push(['trackPageView']);
  // Optionally clear product context after
  _paq.push(['setEcommerceView']);
</script>
```

2) `update_cart` → Cart Update with FULL CART
```
<script>
  // Read FULL CART from localStorage (app stores it at key 'cart')
  function __readCart(){
    try {
      var raw = localStorage.getItem('cart');
      var cart = raw ? JSON.parse(raw) : { items: [] };
      // cart.items[] has: { id, name, price, qty }
      return (cart.items || []).map(function(i){
        return { item_id: i.id, item_name: i.name, price: Number(i.price||0), quantity: Number(i.qty||1) };
      });
    } catch(e){ return []; }
  }
  var items = __readCart();
  window.__addItems(items);
  var total = window.__sumItems(items);
  _paq.push(['trackEcommerceCartUpdate', total]);
</script>
```
Notes:
- If you prefer not to read from localStorage, use the `_mtm` `update_cart` event that contains the full cart, then use `{{dlv.items}}` from that event for updates.

3) `begin_checkout` → Cart Update (parity)
```
<script>
  var items={{dlv.items}}||[];
  var total=window.__sumItems(items);
  _paq.push(['trackEcommerceCartUpdate', total]);
</script>
```

4) `purchase` → Order
```
<script>
  var e={{dlv.ecommerce}}||{}; var items=e.items||[];
  window.__addItems(items);
  _paq.push(['trackEcommerceOrder', e.transaction_id, e.value, e.subtotal||e.value, e.tax||0, e.shipping||0, e.coupon?Number(e.coupon_value||0):0]);
</script>
```

Note: `trackEcommerceOrder` signature is `(orderId, grandTotal, subTotal, tax, shipping, discount)`. Provide as many values as available.

## Product/Category Details & Totals
- Category: The app sends a single `item_category`. For Matomo hierarchies, pass an array instead, e.g. `['Apparel','Hoodies']` by transforming in a Custom JS Variable.
- Price/Quantity: Read from item fields; coerce to numbers in Custom JS/HTML.
- Grand Total: Sum of `price * quantity` for all items. Add `tax` and `shipping` if available to match your reporting.

Custom JS Variable `cjs.cartTotal`
```
function(){
  var items={{dlv.items}}||[]; 
  if(!items.length) return 0; 
  return items.reduce(function(t,i){return t+Number(i.price||0)*(Number(i.quantity||1));},0);
}
```

Use `{{cjs.cartTotal}}` in Cart Update tags when `ecommerce.value` is not provided.

Alternative (from localStorage):
```
function(){
  try{
    var raw = localStorage.getItem('cart');
    var cart = raw ? JSON.parse(raw) : { items: [] };
    return (cart.items||[]).reduce(function(t,i){return t+Number(i.price||0)*(Number(i.qty||1));},0);
  }catch(e){ return 0; }
}
```

## QA in Matomo
- Enable Preview/Debug in MTM; trigger each action in the app and confirm tags fire.
- In the Matomo UI, check Ecommerce > Sales for orders and revenue totals.
- Validate one test order end-to-end: product view → add to cart → checkout → purchase.
- Validate cart parity: quantity changes and removals update Matomo cart via `update_cart` before purchase.
- Ensure order IDs are unique and `grandTotal` matches the expected sum.

## Troubleshooting
- No tags firing: Confirm the Custom Event name matches the app event and that analytics consent is granted (app only loads MTM on consent).
- Missing items: Verify `ecommerce.items` exists in the event payload and that your DLV paths are correct.
- Totals off: Make sure you’re summing `price * quantity` and including tax/shipping consistently.

## App Helper (optional)
- `syncMatomoCart(items)`: A helper provided by the app to push `_mtm` `update_cart` with the full cart. It accepts GA4‑style items or app cart items (`{id,name,price,qty}`) and maps to Matomo item fields (`{item_id,item_name,price,quantity}`). Useful if you implement custom cart UX and want immediate Matomo parity on changes.

## Additional Notes for Specialists
- Template mapping: If your MTM Ecommerce Order tag supports `Tax` and `Shipping` fields, map `{{dlv.tax}}` and `{{dlv.shipping}}` directly; otherwise use the Custom HTML `_paq` approach with `trackEcommerceOrder` arguments.
- Category hierarchy: If you want hierarchical categories, split `item_category_path` (array provided by the app) into multiple dimensions or pass the array directly if your template supports it.
- Consent: Align MTM consent settings with your governance; the app defers MTM loading until `analytics` consent is granted.
- Dedupe purchases: Matomo dedupes by Order ID. Ensure a unique `transaction_id` per order and avoid re‑submitting the same ID.
- Debugging tips: Use the browser console to inspect `window._mtm` queue and verify event payloads as they arrive.
