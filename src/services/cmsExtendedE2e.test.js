/**
 * CMS Extended E2E Tests (P-117)
 *
 * Extended HTTP-level tests run nightly and on release tags.
 * Covers everything in cmsSmokeE2e.test.js plus:
 *   - Reserved-route collision guard: transactional routes must not exist in CMS
 *   - Page property shape validation (full property set)
 *   - Blog slug lookup (404 expected when no posts seeded)
 *
 * All suites are skipped if CMS_API_URL is not set.
 *
 * Run via:  CMS_API_URL=http://localhost:13802 npm run test:cms-e2e
 * In CI:    triggered by ci-nightly.yml using CMS_API_URL Actions variable.
 * See docs/TEST_RUNBOOK.md for scope and gating rules.
 */

import { describe, it, expect } from 'vitest';
import { RESERVED_ROUTES, CMS_PHASE_1_ROUTES } from '../config/reservedRoutes.js';

const BASE = (process.env.CMS_API_URL ?? '').replace(/\/$/, '');
const hasCms = BASE.length > 0;

const TIMEOUT = 20_000;

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

// ── Collision guard ───────────────────────────────────────────────────────────
// Transactional routes must never appear as CMS content nodes.
// If any of these return 200 from the CMS, a content node was accidentally created.

describe.skipIf(!hasCms)('collision guard — transactional routes absent from CMS', () => {
  // Exclude '/' (the homePage root exists in CMS but is code-owned at the SPA level)
  // and infrastructure paths that are never HTTP-routed by the CMS.
  const infra = new Set(['/', '/api', '/config.json']);
  const transactionalRoutes = [...RESERVED_ROUTES].filter(r => !infra.has(r));

  it.each(transactionalRoutes)(
    'GET /api/content/page?route=%s → 404 (no CMS node)',
    async (route) => {
      const { status } = await get(`/api/content/page?route=${route}`);
      expect(status).toBe(404);
    },
    TIMEOUT,
  );
});

// ── Phase-1 page property validation ─────────────────────────────────────────

describe.skipIf(!hasCms)('extended — phase-1 page property shapes', () => {
  it.each(CMS_PHASE_1_ROUTES.filter(r => r !== '/blog'))(
    'GET /api/content/page?route=%s has full standardPage property set',
    async (route) => {
      const { status, body } = await get(`/api/content/page?route=${route}`);
      expect(status).toBe(200);

      // Top-level shape
      expect(typeof body.id).toBe('string');
      expect(body.contentType).toBe('standardPage');
      expect(typeof body.name).toBe('string');
      expect(typeof body.url).toBe('string');

      // Properties shape
      const p = body.properties;
      expect(typeof p.pageTitle).toBe('string');
      expect(typeof p.bodyContent).toBe('string');
      expect(typeof p.seoTitle).toBe('string');
      expect(typeof p.seoDescription).toBe('string');
      expect(typeof p.hideFromNavigation).toBe('boolean');
      expect(Array.isArray(p.contentBlocks)).toBe(true);
    },
    TIMEOUT,
  );

  it('GET /api/content/page?route=/blog has blogOverview shape', async () => {
    const { status, body } = await get('/api/content/page?route=/blog');
    expect(status).toBe(200);
    expect(body.contentType).toBe('blogOverview');
    expect(typeof body.properties.introText).toBe('string');
  }, TIMEOUT);
});

// ── Blog index ────────────────────────────────────────────────────────────────

describe.skipIf(!hasCms)('extended — blog index', () => {
  it('returns items with expected summary shape when posts exist', async () => {
    const { status, body } = await get('/api/content/blog');
    expect(status).toBe(200);
    expect(Array.isArray(body.items)).toBe(true);

    for (const item of body.items) {
      expect(typeof item.id).toBe('string');
      expect(typeof item.title).toBe('string');
      expect(typeof item.slug).toBe('string');
      expect(typeof item.publishDate).toBe('string');
      expect(typeof item.summary).toBe('string');
      expect(typeof item.author).toBe('string');
      expect(Array.isArray(item.tags)).toBe(true);
    }
  }, TIMEOUT);
});

// ── Blog slug lookup ──────────────────────────────────────────────────────────

describe.skipIf(!hasCms)('extended — blog slug lookup', () => {
  it('GET /api/content/blog/unknown-slug → 404', async () => {
    const { status } = await get('/api/content/blog/this-slug-does-not-exist-xyz');
    expect(status).toBe(404);
  }, TIMEOUT);
});

// ── Settings completeness ─────────────────────────────────────────────────────

describe.skipIf(!hasCms)('extended — settings completeness', () => {
  it('all four settings fields are strings or arrays', async () => {
    const { status, body } = await get('/api/content/settings');
    expect(status).toBe(200);
    expect(typeof body.footerText).toBe('string');
    expect(Array.isArray(body.footerLinks)).toBe(true);
    expect(typeof body.defaultSeoTitle).toBe('string');
    expect(typeof body.defaultSeoDescription).toBe('string');
  }, TIMEOUT);

  it('footerLinks items have title and url when present', async () => {
    const { body } = await get('/api/content/settings');
    for (const link of body.footerLinks) {
      expect(typeof link.title).toBe('string');
      expect(typeof link.url).toBe('string');
    }
  }, TIMEOUT);
});
