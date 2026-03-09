/**
 * CMS API Smoke Tests (P-117)
 *
 * HTTP-level smoke tests against a live Umbraco CMS.
 * All suites are skipped if CMS_API_URL is not set — set it to the base URL
 * of the CMS (e.g. http://localhost:13802) to run these locally.
 *
 * Run via:  CMS_API_URL=http://localhost:13802 npm run test:cms-smoke
 * In CI:    set CMS_API_URL as a GitHub Actions repository variable.
 *
 * Requires: a running Umbraco CMS with seeded phase-1 content (ContentSeeder.cs).
 * See docs/TEST_RUNBOOK.md for scope and gating rules.
 */

import { describe, it, expect } from 'vitest';

const BASE = (process.env.CMS_API_URL ?? '').replace(/\/$/, '');
const hasCms = BASE.length > 0;

const TIMEOUT = 20_000;

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  const body = await res.json().catch(() => null);
  return { status: res.status, body };
}

// ── Navigation ───────────────────────────────────────────────────────────────

describe.skipIf(!hasCms)('CMS smoke — GET /api/content/navigation', () => {
  it('returns 200 with an items array', async () => {
    const { status, body } = await get('/api/content/navigation');
    expect(status).toBe(200);
    expect(body).toHaveProperty('items');
    expect(Array.isArray(body.items)).toBe(true);
  }, TIMEOUT);
});

// ── Settings ─────────────────────────────────────────────────────────────────

describe.skipIf(!hasCms)('CMS smoke — GET /api/content/settings', () => {
  it('returns 200 with settings shape', async () => {
    const { status, body } = await get('/api/content/settings');
    expect(status).toBe(200);
    expect(body).toHaveProperty('footerText');
    expect(body).toHaveProperty('footerLinks');
    expect(Array.isArray(body.footerLinks)).toBe(true);
    expect(body).toHaveProperty('defaultSeoTitle');
    expect(body).toHaveProperty('defaultSeoDescription');
  }, TIMEOUT);
});

// ── Phase-1 pages ─────────────────────────────────────────────────────────────

describe.skipIf(!hasCms)('CMS smoke — phase-1 pages', () => {
  const routes = ['/about', '/faq', '/terms', '/privacy'];

  it.each(routes)('GET /api/content/page?route=%s → 200 with page shape', async (route) => {
    const { status, body } = await get(`/api/content/page?route=${route}`);
    expect(status).toBe(200);
    expect(body).toHaveProperty('id');
    expect(typeof body.id).toBe('string');
    expect(body).toHaveProperty('contentType');
    expect(body).toHaveProperty('name');
    expect(body).toHaveProperty('url');
    expect(body).toHaveProperty('properties');
    expect(body.properties).toHaveProperty('pageTitle');
  }, TIMEOUT);
});

// ── Blog index ────────────────────────────────────────────────────────────────

describe.skipIf(!hasCms)('CMS smoke — GET /api/content/blog', () => {
  it('returns 200 with an items array', async () => {
    const { status, body } = await get('/api/content/blog');
    expect(status).toBe(200);
    expect(body).toHaveProperty('items');
    expect(Array.isArray(body.items)).toBe(true);
  }, TIMEOUT);

  it('respects the limit query param', async () => {
    const { status, body } = await get('/api/content/blog?limit=2');
    expect(status).toBe(200);
    expect(body.items.length).toBeLessThanOrEqual(2);
  }, TIMEOUT);
});

// ── 404 for unknown route ─────────────────────────────────────────────────────

describe.skipIf(!hasCms)('CMS smoke — 404 for unknown route', () => {
  it('GET /api/content/page?route=/nonexistent-xyz → 404', async () => {
    const { status } = await get('/api/content/page?route=/nonexistent-route-xyz');
    expect(status).toBe(404);
  }, TIMEOUT);

  it('GET /api/content/page without route param → 400', async () => {
    const { status } = await get('/api/content/page');
    expect(status).toBe(400);
  }, TIMEOUT);
});
