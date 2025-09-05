// Minimal Matomo-oriented test for update_cart emission
// Run: node scripts/test-matomo.mjs

// Stubs
global.window = {
  __CONFIG__: {},
  dataLayer: [],
  _mtm: [],
};

// Minimal localStorage stub with a pre-existing cart state
const __store = new Map();
__store.set('cart', JSON.stringify({ items: [
  { id: 'p-1', name: 'Aurora Hoodie', price: 59, qty: 1, variant: 'default' },
] }));

global.localStorage = {
  getItem: (k) => (__store.has(k) ? __store.get(k) : null),
  setItem: (k, v) => { __store.set(k, String(v)); },
  removeItem: (k) => { __store.delete(k); },
};

global.document = {
  addEventListener: () => {},
};

import { trackAddToCart, trackBeginCheckout, syncMatomoCart } from '../src/utils/analytics.js';

let passed = 0, failed = 0;
function assert(name, cond, extra) {
  if (cond) { passed++; console.log('PASS:', name); }
  else { failed++; console.error('FAIL:', name, extra ? JSON.stringify(extra, null, 2) : ''); }
}

// Call trackAddToCart for a different product; ensure update_cart includes FULL CART (existing + new)
const prodB = { id: 'p-2', name: 'Nebula Sneakers', price: 89 };
trackAddToCart(prodB, 2);

// Expect two _mtm pushes: add_to_cart and update_cart; we validate the last
const last = window._mtm[window._mtm.length - 1];
assert('mtm event is update_cart', last && last.event === 'update_cart', last);
assert('update_cart has items array', last && Array.isArray(last.ecommerce?.items), last);
assert('update_cart contains existing and new items', last.ecommerce.items.length === 2, last);

// Validate mapping
const byId = Object.fromEntries(last.ecommerce.items.map(i => [i.item_id, i]));
assert('existing item mapped from storage', byId['p-1']?.item_name === 'Aurora Hoodie' && byId['p-1']?.quantity === 1, byId['p-1']);
assert('new item merged with requested qty', byId['p-2']?.item_name === 'Nebula Sneakers' && byId['p-2']?.quantity === 2, byId['p-2']);

console.log(`\nSummary: ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

// Begin Checkout should also emit update_cart with provided items
window._mtm.length = 0;
const checkoutItems = [
  { item_id: 'p-1', item_name: 'Aurora Hoodie', price: 59, quantity: 1 },
  { item_id: 'p-2', item_name: 'Nebula Sneakers', price: 89, quantity: 2 },
];
trackBeginCheckout(checkoutItems);

// Find update_cart among pushes
const uc = window._mtm.find(e => e.event === 'update_cart');
assert('begin_checkout emits update_cart', !!uc, window._mtm);
assert('update_cart carries checkout items', Array.isArray(uc?.ecommerce?.items) && uc.ecommerce.items.length === 2, uc);
const byId2 = Object.fromEntries(uc.ecommerce.items.map(i => [i.item_id, i]));
assert('checkout item p-2 quantity preserved', byId2['p-2']?.quantity === 2, byId2['p-2']);

console.log(`\nSummary (with checkout): ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);

// Direct syncMatomoCart with cart-shaped items (id/name/price/qty)
window._mtm.length = 0;
syncMatomoCart([
  { id: 'p-3', name: 'Orbit Cap', price: 29, qty: 3 },
  { id: 'p-4', name: 'Luna Tee', price: 25, qty: 1 },
]);
const last2 = window._mtm[window._mtm.length - 1];
assert('syncMatomoCart emits update_cart', last2?.event === 'update_cart', last2);
const byId3 = Object.fromEntries(last2.ecommerce.items.map(i => [i.item_id, i]));
assert('syncMatomoCart maps quantities', byId3['p-3']?.quantity === 3 && byId3['p-4']?.quantity === 1, byId3);

console.log(`\nSummary (with syncMatomoCart): ${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
