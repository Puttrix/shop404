/**
 * Analytics Parity Tests — CMS Pages (P-111)
 *
 * Verifies that:
 * 1. `page_view` fires correctly on CMS-owned pages via `trackPage`.
 * 2. All analytics pushes are gated by the `analytics` consent category.
 * 3. No ecommerce or content-tracking events fire on marketing/CMS pages.
 * 4. Matomo `_mtm` receives `page_view` when the global is present.
 * 5. `trackContentScan` / `trackContentClick` are consent-gated.
 *
 * Parity baseline (recorded per P-111 acceptance criteria):
 *   ✓ page_view    fires on every CMS page load (via CmsPage.jsx → trackPage)
 *   ✓ page_view    is gated by analytics consent (denied → no push)
 *   ✓ page_view    carries cms_content_type from the CMS DTO
 *   ✗ view_item_list / view_item / add_to_cart / purchase  (never on CMS pages)
 *   ✗ trackContentScan / trackContentClick                 (not called by CmsPage)
 *   ✓ _mtm receives page_view when window._mtm is present
 *   ✓ _paq content helpers are consent-gated
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { trackPage, trackContentScan, trackContentClick } from './analytics.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns a minimal window stub sufficient for analytics.js */
function makeWindow({ analytics = true, mtm = false } = {}) {
  return {
    __consent: { analytics, marketing: true, experimentation: true },
    __CONFIG__: {},
    dataLayer: [],
    _mtm: mtm ? [] : undefined,
    _paq: undefined,
  };
}

/** Returns a minimal document stub that satisfies ensureTagsLoaded */
function makeDocument() {
  return {
    title: 'Test Page',
    addEventListener: vi.fn(),
    createElement: vi.fn().mockReturnValue({ src: '', async: false }),
    head: { appendChild: vi.fn() },
  };
}

beforeEach(() => {
  vi.unstubAllGlobals();
  vi.stubGlobal('document', makeDocument());
  vi.stubGlobal('location', { href: 'http://localhost/about' });
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ---------------------------------------------------------------------------
// 1. page_view event shape
// ---------------------------------------------------------------------------

describe('trackPage — event shape', () => {
  it('pushes page_view to dataLayer', () => {
    const win = makeWindow();
    vi.stubGlobal('window', win);

    trackPage('About');

    expect(win.dataLayer).toHaveLength(1);
    expect(win.dataLayer[0].event).toBe('page_view');
  });

  it('includes page_name matching the supplied name', () => {
    const win = makeWindow();
    vi.stubGlobal('window', win);

    trackPage('About');

    expect(win.dataLayer[0].page_name).toBe('About');
  });

  it('includes page_title from extra when provided', () => {
    const win = makeWindow();
    vi.stubGlobal('window', win);

    trackPage('About', { page_title: 'About — Shop404' });

    expect(win.dataLayer[0].page_title).toBe('About — Shop404');
  });

  it('passes through cms_content_type from CmsPage extra', () => {
    const win = makeWindow();
    vi.stubGlobal('window', win);

    trackPage('About', { page_title: 'About — Shop404', cms_content_type: 'standardPage' });

    expect(win.dataLayer[0].cms_content_type).toBe('standardPage');
  });

  it('page_location is included in the event', () => {
    const win = makeWindow();
    vi.stubGlobal('window', win);

    trackPage('About', { page_location: 'http://localhost/about' });

    expect(win.dataLayer[0].page_location).toBe('http://localhost/about');
  });
});

// ---------------------------------------------------------------------------
// 2. Consent gating — analytics consent denied
// ---------------------------------------------------------------------------

describe('trackPage — consent gating', () => {
  it('does NOT push to dataLayer when analytics consent is denied', () => {
    const win = makeWindow({ analytics: false });
    vi.stubGlobal('window', win);

    trackPage('About');

    expect(win.dataLayer).toHaveLength(0);
  });

  it('DOES push to dataLayer when analytics consent is allowed', () => {
    const win = makeWindow({ analytics: true });
    vi.stubGlobal('window', win);

    trackPage('About');

    expect(win.dataLayer).toHaveLength(1);
  });

  it('does not push to _mtm when analytics consent is denied', () => {
    const win = makeWindow({ analytics: false, mtm: true });
    vi.stubGlobal('window', win);

    trackPage('About');

    expect(win._mtm).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Matomo _mtm push
// ---------------------------------------------------------------------------

describe('trackPage — Matomo _mtm', () => {
  it('pushes page_view to _mtm when window._mtm is present', () => {
    const win = makeWindow({ mtm: true });
    vi.stubGlobal('window', win);

    trackPage('About');

    expect(win._mtm).toHaveLength(1);
    expect(win._mtm[0].event).toBe('page_view');
  });

  it('_mtm event includes page_name', () => {
    const win = makeWindow({ mtm: true });
    vi.stubGlobal('window', win);

    trackPage('About');

    expect(win._mtm[0].page_name).toBe('About');
  });

  it('does not crash when _mtm is absent', () => {
    const win = makeWindow({ mtm: false });
    vi.stubGlobal('window', win);

    expect(() => trackPage('About')).not.toThrow();
  });

  it('pushes same extra fields to both dataLayer and _mtm', () => {
    const win = makeWindow({ mtm: true });
    vi.stubGlobal('window', win);

    trackPage('About', { cms_content_type: 'standardPage' });

    expect(win.dataLayer[0].cms_content_type).toBe('standardPage');
    expect(win._mtm[0].cms_content_type).toBe('standardPage');
  });
});

// ---------------------------------------------------------------------------
// 4. CMS-page parity: specific content types
// ---------------------------------------------------------------------------

describe('trackPage — CMS content type parity', () => {
  const cmsPages = [
    { name: 'About',              contentType: 'standardPage',  path: '/about' },
    { name: 'FAQ',                contentType: 'standardPage',  path: '/faq' },
    { name: 'Terms',              contentType: 'standardPage',  path: '/terms' },
    { name: 'Privacy Policy',     contentType: 'standardPage',  path: '/privacy' },
    { name: 'Blog',               contentType: 'blogOverview',  path: '/blog' },
    { name: 'Getting Started',    contentType: 'blogPost',      path: '/blog/getting-started' },
  ];

  cmsPages.forEach(({ name, contentType, path }) => {
    it(`fires page_view for ${contentType} "${name}"`, () => {
      const win = makeWindow();
      vi.stubGlobal('window', win);

      trackPage(name, {
        page_title: `${name} — Shop404`,
        page_location: `http://localhost${path}`,
        cms_content_type: contentType,
      });

      const pushed = win.dataLayer[0];
      expect(pushed.event).toBe('page_view');
      expect(pushed.page_name).toBe(name);
      expect(pushed.cms_content_type).toBe(contentType);
    });
  });
});

// ---------------------------------------------------------------------------
// 5. No ecommerce events fire on CMS pages (parity boundary)
// ---------------------------------------------------------------------------

describe('CMS page parity — no ecommerce events', () => {
  it('dataLayer has no add_to_cart event after CMS page_view', () => {
    const win = makeWindow();
    vi.stubGlobal('window', win);

    // Simulate what CmsPage.jsx does — only trackPage
    trackPage('About', { cms_content_type: 'standardPage' });

    const events = win.dataLayer.map(e => e.event);
    expect(events).not.toContain('add_to_cart');
    expect(events).not.toContain('view_item');
    expect(events).not.toContain('begin_checkout');
    expect(events).not.toContain('purchase');
  });
});

// ---------------------------------------------------------------------------
// 6. Matomo content tracking helpers (consent-gated)
// ---------------------------------------------------------------------------

describe('trackContentScan — consent gating', () => {
  it('pushes to _paq when analytics consent is allowed', () => {
    const win = makeWindow({ analytics: true });
    win._paq = [];
    vi.stubGlobal('window', win);

    trackContentScan(null);

    expect(win._paq).toHaveLength(1);
    expect(win._paq[0][0]).toBe('trackContentImpressionsWithinNode');
  });

  it('does NOT push to _paq when analytics consent is denied', () => {
    const win = makeWindow({ analytics: false });
    win._paq = [];
    vi.stubGlobal('window', win);

    trackContentScan(null);

    expect(win._paq).toHaveLength(0);
  });
});

describe('trackContentClick — consent gating', () => {
  it('pushes trackContentInteraction to _paq when consent allowed', () => {
    const win = makeWindow({ analytics: true });
    win._paq = [];
    vi.stubGlobal('window', win);

    trackContentClick({ name: 'Hero', piece: 'Shop now', target: '/products' });

    expect(win._paq[0][0]).toBe('trackContentInteraction');
    expect(win._paq[0][1]).toBe('click');
    expect(win._paq[0][2]).toBe('Hero');
  });

  it('does NOT push to _paq when analytics consent is denied', () => {
    const win = makeWindow({ analytics: false });
    win._paq = [];
    vi.stubGlobal('window', win);

    trackContentClick({ name: 'Hero', piece: 'Shop now', target: '/products' });

    expect(win._paq).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// 7. CmsPage trackPage call shape (extracted from CmsPage.jsx line 27-30)
// ---------------------------------------------------------------------------

describe('CmsPage.jsx trackPage call contract', () => {
  /**
   * CmsPage calls:
   *   trackPage(page.properties?.pageTitle || page.name, {
   *     page_title: title,
   *     cms_content_type: page.contentType,
   *   });
   * This group validates that pattern produces the expected event payload.
   */
  function simulateCmsPageTrack(win, page) {
    const title = page.properties?.seoTitle || page.properties?.pageTitle || page.name;
    trackPage(page.properties?.pageTitle || page.name, {
      page_title: title,
      cms_content_type: page.contentType,
    });
  }

  it('page_name uses pageTitle property', () => {
    const win = makeWindow();
    vi.stubGlobal('window', win);

    simulateCmsPageTrack(win, {
      name: 'About',
      contentType: 'standardPage',
      properties: { pageTitle: 'About Us', seoTitle: '' },
    });

    expect(win.dataLayer[0].page_name).toBe('About Us');
  });

  it('page_name falls back to node name when pageTitle absent', () => {
    const win = makeWindow();
    vi.stubGlobal('window', win);

    simulateCmsPageTrack(win, {
      name: 'About',
      contentType: 'standardPage',
      properties: {},
    });

    expect(win.dataLayer[0].page_name).toBe('About');
  });

  it('page_title uses seoTitle when present', () => {
    const win = makeWindow();
    vi.stubGlobal('window', win);

    simulateCmsPageTrack(win, {
      name: 'About',
      contentType: 'standardPage',
      properties: { pageTitle: 'About Us', seoTitle: 'About — Shop404' },
    });

    expect(win.dataLayer[0].page_title).toBe('About — Shop404');
  });

  it('cms_content_type matches the CMS content type alias', () => {
    const win = makeWindow();
    vi.stubGlobal('window', win);

    simulateCmsPageTrack(win, {
      name: 'Blog',
      contentType: 'blogOverview',
      properties: { pageTitle: 'Blog' },
    });

    expect(win.dataLayer[0].cms_content_type).toBe('blogOverview');
  });
});
