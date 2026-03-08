import { describe, it, expect } from 'vitest';
import { RESERVED_ROUTES, RESERVED_PREFIXES } from './reservedRoutes.js';

// These tests act as a collision guard between the CMS catch-all route and
// code-owned routes. If a reserved route is accidentally removed from the set,
// or if a CMS phase-1 route collides with a reserved one, these tests fail.

const EXPECTED_EXACT = [
  '/',
  '/products',
  '/cart',
  '/checkout',
  '/order-confirmation',
  '/donate',
  '/learn',
  '/ab-test-lab',
];

const EXPECTED_PREFIXES = [
  '/products/',
  '/donate/',
  '/learn/',
  '/api/',
];

// CMS phase-1 routes that must NOT appear in the reserved set.
const CMS_PHASE_1_ROUTES = ['/about', '/faq', '/terms', '/privacy', '/blog'];

describe('RESERVED_ROUTES', () => {
  it.each(EXPECTED_EXACT)('contains code-owned route %s', route => {
    expect(RESERVED_ROUTES.has(route)).toBe(true);
  });
});

describe('RESERVED_PREFIXES', () => {
  it.each(EXPECTED_PREFIXES)('contains prefix %s', prefix => {
    expect(RESERVED_PREFIXES).toContain(prefix);
  });
});

describe('collision guard — CMS phase-1 routes must not be reserved', () => {
  it.each(CMS_PHASE_1_ROUTES)('%s is not in RESERVED_ROUTES', route => {
    expect(RESERVED_ROUTES.has(route)).toBe(false);
  });

  it.each(CMS_PHASE_1_ROUTES)('%s does not start with a reserved prefix', route => {
    const collides = RESERVED_PREFIXES.some(p => route.startsWith(p));
    expect(collides).toBe(false);
  });
});
