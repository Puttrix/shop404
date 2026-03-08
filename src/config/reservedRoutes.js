// Routes that are always code-owned. The CMS catch-all must never intercept these.
// React Router matches explicit routes before the CmsPage catch-all, so these
// are protected by route ordering alone — this module makes that contract explicit
// and testable.
//
// Route order in App.jsx (enforced):
//   1. Reserved exact/prefix routes (below) → code-owned components
//   2. CmsPage catch-all (path="*")         → Umbraco content lookup
//   3. 404 rendered by CmsPage              → when CMS returns null

export const RESERVED_ROUTES = new Set([
  '/',
  '/products',
  '/cart',
  '/checkout',
  '/order-confirmation',
  '/donate',
  '/learn',
  '/ab-test-lab',
  // Infrastructure paths — never matched by React Router client-side,
  // but included here so the full reserved set is documented in one place.
  '/api',
  '/config.json',
]);

// Path prefixes that are code-owned. Any route beginning with these is reserved.
export const RESERVED_PREFIXES = [
  '/products/',
  '/donate/',
  '/learn/',
  '/api/',
];
