# Matomo Tag Manager — Ecommerce Mapping Guide

This guide shows how to configure Matomo Tag Manager (MTM) to consume the app’s events and track ecommerce reliably (product/category details and order totals).

The app pushes events to both `window.dataLayer` and `window._mtm` with GA4-style ecommerce payloads. MTM can read either; we’ll refer to the event name and the `ecommerce` object throughout.

## Prerequisites
- A Matomo site (Site ID) and a Matomo Tag Manager container for that site.
- In the MTM container, add a “Matomo Configuration” tag with your Site ID and Tracker URL.
- Ensure consent integration in MTM matches your policy. The app only loads MTM when `analytics` consent is allowed.

## Data Layer Variables (DLV)
Create these Variables in MTM to map from the pushed event payloads. Use Data Layer Variable type.

- `dlv.event` → Path: `event`
- `dlv.ecommerce` → Path: `ecommerce`
- `dlv.items` → Path: `ecommerce.items`
- `dlv.transaction_id` → Path: `ecommerce.transaction_id`
- `dlv.value` → Path: `ecommerce.value`
- `dlv.currency` → Path: `ecommerce.currency`

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
- `evt.add_to_cart` → `add_to_cart`
- `evt.begin_checkout` → `begin_checkout`
- `evt.purchase` → `purchase`
- `evt.donation_step` → `donation_step`

## Tags — Two Approaches
Prefer the MTM Ecommerce tag templates if available. If not, use Custom HTML with `_paq` commands.

### A) Using MTM Ecommerce Tag Templates (Recommended)
Create the following tags and map variables accordingly.

1) Product Detail View (for `view_item`)
- Tag: Ecommerce Product View (or similar)
- SKU: `{{cjs.item_id}}`
- Name: `{{cjs.item_name}}`
- Category: `{{cjs.item_category}}`
- Price: `{{cjs.item_price}}`
- Trigger: `evt.view_item`

2) Add to Cart (for `add_to_cart`)
- Tag: Ecommerce Add To Cart
- Items: If template supports an items array, map `{{dlv.items}}`. Otherwise, add a Product sub‑mapping using `{{cjs.*}}` and Quantity `{{cjs.item_quantity}}`.
- Trigger: `evt.add_to_cart`

3) Checkout Start (optional, for `begin_checkout`)
- Tag: Ecommerce Cart Update
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

2) `add_to_cart` → Cart Update with Items
```
<script>
  var items={{dlv.items}}||[];
  window.__addItems(items);
  var total=window.__sumItems(items);
  _paq.push(['trackEcommerceCartUpdate', total]);
</script>
```

3) `begin_checkout` → Cart Update
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

## QA in Matomo
- Enable Preview/Debug in MTM; trigger each action in the app and confirm tags fire.
- In the Matomo UI, check Ecommerce > Sales for orders and revenue totals.
- Validate one test order end-to-end: product view → add to cart → checkout → purchase.
- Ensure order IDs are unique and `grandTotal` matches the expected sum.

## Troubleshooting
- No tags firing: Confirm the Custom Event name matches the app event and that analytics consent is granted (app only loads MTM on consent).
- Missing items: Verify `ecommerce.items` exists in the event payload and that your DLV paths are correct.
- Totals off: Make sure you’re summing `price * quantity` and including tax/shipping consistently.

## Additional Notes for Specialists
- Template mapping: If your MTM Ecommerce Order tag supports `Tax` and `Shipping` fields, map `{{dlv.tax}}` and `{{dlv.shipping}}` directly; otherwise use the Custom HTML `_paq` approach with `trackEcommerceOrder` arguments.
- Category hierarchy: If you want hierarchical categories, split `item_category_path` (array provided by the app) into multiple dimensions or pass the array directly if your template supports it.
- Consent: Align MTM consent settings with your governance; the app defers MTM loading until `analytics` consent is granted.
- Dedupe purchases: Matomo dedupes by Order ID. Ensure a unique `transaction_id` per order and avoid re‑submitting the same ID.
- Debugging tips: Use the browser console to inspect `window._mtm` queue and verify event payloads as they arrive.
