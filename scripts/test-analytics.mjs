// Lightweight analytics payload test (no browser required)
// Run: node scripts/test-analytics.mjs

// Minimal DOM/window stubs
global.window = {
  __CONFIG__: {},
  dataLayer: [],
};

global.document = {
  addEventListener: () => {},
  head: { appendChild: () => {} },
  createElement: (tag) => ({ tagName: tag.toUpperCase(), set src(v){ this._src=v; }, get src(){ return this._src; }, async: true }),
  getElementsByTagName: () => [{ parentNode: { insertBefore: () => {} } }],
};

import {
  trackProductImpression,
  trackViewItem,
  trackAddToCart,
  trackBeginCheckout,
  trackPurchase,
  trackDonationStep,
} from '../src/utils/analytics.js';

let passed = 0, failed = 0;
function assert(name, cond, extra) {
  if (cond) {
    passed++; console.log('PASS:', name);
  } else {
    failed++; console.error('FAIL:', name, extra ? JSON.stringify(extra, null, 2) : '');
  }
}

function lastDL() { return window.dataLayer[window.dataLayer.length - 1]; }

// Test 1: view_item_list with list context and index
window.dataLayer.length = 0;
const prodA = { id: 'p-1', name: 'Aurora Hoodie', categoryPath: ['Apparel','Hoodies'], price: 59 };
trackProductImpression(prodA, { item_list_name: 'Home Featured', item_list_id: 'home_grid', index: 1 });
let e = lastDL();
assert('view_item_list event name', e.event === 'view_item_list', e);
assert('list name/id present', e.ecommerce.item_list_name === 'Home Featured' && e.ecommerce.item_list_id === 'home_grid', e);
assert('index present', e.ecommerce.items[0].index === 1, e);
assert('category hierarchy mapped', e.ecommerce.items[0].item_category === 'Apparel' && e.ecommerce.items[0].item_category2 === 'Hoodies', e.ecommerce.items[0]);

// Test 2: view_item with category mapping from single category
window.dataLayer.length = 0;
const prodB = { id: 'p-2', name: 'Nebula Sneakers', category: 'Footwear', price: 89 };
trackViewItem(prodB);
e = lastDL();
assert('view_item event name', e.event === 'view_item', e);
assert('view_item item fields', e.ecommerce.items[0].item_id === 'p-2' && e.ecommerce.items[0].item_name === 'Nebula Sneakers', e);
assert('view_item category', e.ecommerce.items[0].item_category === 'Footwear', e.ecommerce.items[0]);

// Test 3: add_to_cart includes currency and quantity
window.dataLayer.length = 0;
trackAddToCart(prodB, 2);
e = lastDL();
assert('add_to_cart event name', e.event === 'add_to_cart', e);
assert('add_to_cart currency', e.ecommerce.currency === 'USD', e);
assert('add_to_cart quantity', e.ecommerce.items[0].quantity === 2, e.ecommerce.items[0]);

// Test 4: begin_checkout includes currency and items passthrough
window.dataLayer.length = 0;
const items = [ { item_id: 'p-2', item_name: 'Nebula Sneakers', price: 89, quantity: 1 } ];
trackBeginCheckout(items);
e = lastDL();
assert('begin_checkout event name', e.event === 'begin_checkout', e);
assert('begin_checkout currency', e.ecommerce.currency === 'USD', e);
assert('begin_checkout items passthrough', Array.isArray(e.ecommerce.items) && e.ecommerce.items.length === 1, e);

// Test 5: purchase includes currency, transaction fields, and tax/shipping when provided
window.dataLayer.length = 0;
trackPurchase('ORD-TEST', 123.45, items, { tax: 10.0, shipping: 5.0 });
e = lastDL();
assert('purchase event name', e.event === 'purchase', e);
assert('purchase currency', e.ecommerce.currency === 'USD', e);
assert('purchase transaction/value', e.ecommerce.transaction_id === 'ORD-TEST' && e.ecommerce.value === 123.45, e);
assert('purchase tax/shipping present', e.ecommerce.tax === 10.0 && e.ecommerce.shipping === 5.0, e);

// Test 6: donation_step error payload
window.dataLayer.length = 0;
trackDonationStep('details', { error: 'validation', fields: ['email'] });
e = lastDL();
assert('donation_step event name', e.event === 'donation_step', e);
assert('donation_step step', e.step === 'details', e);
assert('donation_step error flag', e.error === 'validation' && Array.isArray(e.fields) && e.fields[0] === 'email', e);

console.log(`\nSummary: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
