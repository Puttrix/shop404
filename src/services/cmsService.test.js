import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getPage, getNavigation, getBlogPosts, getBlogPost, getSettings, clearCache } from './cmsService.js';

// --- fetch mock helpers ---

function mockFetch(status, body) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  });
}

function mockFetchError() {
  return vi.fn().mockRejectedValue(new Error('network error'));
}

beforeEach(() => {
  vi.unstubAllGlobals();
  clearCache(); // reset in-process cache so tests are isolated
});

afterEach(() => {
  vi.restoreAllMocks();
});

// --- getPage ---

describe('getPage', () => {
  it('returns page DTO on 200', async () => {
    const payload = {
      id: 'abc',
      contentType: 'standardPage',
      name: 'About',
      url: '/about',
      properties: { pageTitle: 'About Us', seoTitle: 'About - Shop404', bodyContent: '<p>Hi</p>' },
    };
    vi.stubGlobal('fetch', mockFetch(200, payload));

    const result = await getPage('/about');

    expect(result).toEqual(payload);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/content/page?route='),
      expect.any(Object)
    );
  });

  it('returns null on 404', async () => {
    vi.stubGlobal('fetch', mockFetch(404, { error: 'Page not found' }));
    expect(await getPage('/missing')).toBeNull();
  });

  it('returns null on network error for non-critical route', async () => {
    vi.stubGlobal('fetch', mockFetchError());
    expect(await getPage('/some-unknown-page')).toBeNull();
  });

  it('URL-encodes the route parameter', async () => {
    vi.stubGlobal('fetch', mockFetch(200, {}));
    await getPage('/path with spaces');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('/path with spaces')),
      expect.any(Object)
    );
  });
});

// --- getNavigation ---

describe('getNavigation', () => {
  it('returns items array on success', async () => {
    const payload = { items: [{ title: 'Home', url: '/' }, { title: 'About', url: '/about' }] };
    vi.stubGlobal('fetch', mockFetch(200, payload));

    const result = await getNavigation();

    expect(result).toEqual(payload.items);
  });

  it('returns [] when items key is missing', async () => {
    vi.stubGlobal('fetch', mockFetch(200, {}));
    expect(await getNavigation()).toEqual([]);
  });

  it('returns [] on 500', async () => {
    vi.stubGlobal('fetch', mockFetch(500, {}));
    expect(await getNavigation()).toEqual([]);
  });

  it('returns [] on network error', async () => {
    vi.stubGlobal('fetch', mockFetchError());
    expect(await getNavigation()).toEqual([]);
  });
});

// --- getBlogPosts ---

describe('getBlogPosts', () => {
  const sampleItems = [
    { id: '1', title: 'Post A', slug: '/blog/a', publishDate: '2026-01-01', summary: 'S', author: 'Alice', tags: [] },
  ];

  it('returns items array on success', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { items: sampleItems }));
    expect(await getBlogPosts(5)).toEqual(sampleItems);
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('limit=5'), expect.any(Object));
  });

  it('defaults limit to 10', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { items: [] }));
    await getBlogPosts();
    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('limit=10'), expect.any(Object));
  });

  it('returns [] when items key is missing', async () => {
    vi.stubGlobal('fetch', mockFetch(200, {}));
    expect(await getBlogPosts()).toEqual([]);
  });

  it('returns [] on network error', async () => {
    vi.stubGlobal('fetch', mockFetchError());
    expect(await getBlogPosts()).toEqual([]);
  });
});

// --- getBlogPost ---

describe('getBlogPost', () => {
  const post = {
    id: '2',
    title: 'Post A',
    slug: 'post-a',
    publishDate: '2026-01-01',
    summary: 'Summary',
    author: 'Alice',
    body: '<p>Body</p>',
    seoTitle: 'Post A - Blog',
    seoDescription: 'A post',
    tags: ['tag1'],
  };

  it('returns post DTO on 200', async () => {
    vi.stubGlobal('fetch', mockFetch(200, post));
    expect(await getBlogPost('post-a')).toEqual(post);
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/content/blog/post-a'),
      expect.any(Object)
    );
  });

  it('returns null on 404', async () => {
    vi.stubGlobal('fetch', mockFetch(404, { error: 'not found' }));
    expect(await getBlogPost('missing')).toBeNull();
  });

  it('returns null on network error', async () => {
    vi.stubGlobal('fetch', mockFetchError());
    expect(await getBlogPost('post-a')).toBeNull();
  });

  it('URL-encodes slug', async () => {
    vi.stubGlobal('fetch', mockFetch(200, {}));
    await getBlogPost('my post');
    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining(encodeURIComponent('my post')),
      expect.any(Object)
    );
  });
});

// --- getSettings ---

describe('getSettings', () => {
  it('returns settings DTO on success', async () => {
    const payload = { footerText: '© 2026', defaultSeoTitle: 'Shop404', defaultSeoDescription: 'Desc' };
    vi.stubGlobal('fetch', mockFetch(200, payload));
    expect(await getSettings()).toEqual(payload);
  });

  it('returns null on network error', async () => {
    vi.stubGlobal('fetch', mockFetchError());
    expect(await getSettings()).toBeNull();
  });

  it('returns null on 500', async () => {
    vi.stubGlobal('fetch', mockFetch(500, {}));
    expect(await getSettings()).toBeNull();
  });
});

// --- base URL from config ---

describe('CMS_API_URL config', () => {
  it('prepends CMS_API_URL to all requests', async () => {
    vi.stubGlobal('fetch', mockFetch(200, { items: [] }));
    vi.stubGlobal('window', { __CONFIG__: { CMS_API_URL: 'http://cms.example.com' } });

    await getNavigation();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining('http://cms.example.com/api/content/navigation'),
      expect.any(Object)
    );
  });
});

// --- in-process stale-on-error cache ---

describe('in-process cache — stale-on-error', () => {
  it('returns stale cached page when CMS is down', async () => {
    const payload = {
      id: 'abc', contentType: 'standardPage', name: 'About', url: '/about',
      properties: { pageTitle: 'About Us', bodyContent: '<p>Hi</p>' },
    };

    // First call: CMS is up → cache populated
    vi.stubGlobal('fetch', mockFetch(200, payload));
    await getPage('/about');

    // Second call: CMS is down → stale cache served
    vi.stubGlobal('fetch', mockFetchError());
    const result = await getPage('/about');

    expect(result).toEqual(payload);
  });

  it('returns stale cached navigation when CMS returns 503', async () => {
    const liveData = { items: [{ title: 'About', url: '/about' }] };

    vi.stubGlobal('fetch', mockFetch(200, liveData));
    await getNavigation(); // populate cache

    vi.stubGlobal('fetch', mockFetch(503, {}));
    const result = await getNavigation();

    expect(result).toEqual(liveData.items);
  });

  it('returns stale cached settings when fetch times out', async () => {
    const settings = { footerText: '© 2026', footerLinks: [], defaultSeoTitle: 'S', defaultSeoDescription: 'D' };

    vi.stubGlobal('fetch', mockFetch(200, settings));
    await getSettings(); // populate cache

    vi.stubGlobal('fetch', mockFetchError());
    const result = await getSettings();

    expect(result).toEqual(settings);
  });

  it('updates cache on successful re-fetch after outage', async () => {
    const stale = { id: 'x', name: 'About (old)', url: '/about', contentType: 'standardPage', properties: {} };
    const fresh = { id: 'y', name: 'About (new)', url: '/about', contentType: 'standardPage', properties: {} };

    vi.stubGlobal('fetch', mockFetch(200, stale));
    await getPage('/about');

    vi.stubGlobal('fetch', mockFetch(200, fresh));
    const result = await getPage('/about');

    expect(result).toEqual(fresh);
  });

  it('does not serve cache from a different path', async () => {
    const aboutPayload = { id: 'a', name: 'About', url: '/about', contentType: 'standardPage', properties: {} };

    vi.stubGlobal('fetch', mockFetch(200, aboutPayload));
    await getPage('/about'); // cache /about

    vi.stubGlobal('fetch', mockFetchError());
    const faqResult = await getPage('/faq'); // /faq has no cache

    // Should return the static fallback for /faq, not the /about cache
    expect(faqResult).not.toBeNull();
    expect(faqResult.url).toBe('/faq');
  });
});

// --- static fallback payloads (critical routes) ---

describe('static fallbacks — critical routes', () => {
  it('returns static fallback for /about when cache is cold and CMS is down', async () => {
    vi.stubGlobal('fetch', mockFetchError());
    const result = await getPage('/about');

    expect(result).not.toBeNull();
    expect(result.url).toBe('/about');
    expect(result.contentType).toBe('standardPage');
    expect(result.properties.bodyContent).toBeTruthy();
  });

  it('returns static fallback for /faq when CMS is unreachable', async () => {
    vi.stubGlobal('fetch', mockFetchError());
    const result = await getPage('/faq');

    expect(result).not.toBeNull();
    expect(result.url).toBe('/faq');
  });

  it('returns static fallback for /terms when CMS is unreachable', async () => {
    vi.stubGlobal('fetch', mockFetchError());
    expect((await getPage('/terms'))?.url).toBe('/terms');
  });

  it('returns static fallback for /privacy when CMS is unreachable', async () => {
    vi.stubGlobal('fetch', mockFetchError());
    expect((await getPage('/privacy'))?.url).toBe('/privacy');
  });

  it('returns null for non-critical route when cache is cold and CMS is down', async () => {
    vi.stubGlobal('fetch', mockFetchError());
    expect(await getPage('/blog/some-post')).toBeNull();
  });

  it('static fallback is superseded by live CMS response', async () => {
    const live = { id: 'live-about', name: 'About', url: '/about', contentType: 'standardPage', properties: { pageTitle: 'About Us' } };
    vi.stubGlobal('fetch', mockFetch(200, live));

    const result = await getPage('/about');

    expect(result.id).toBe('live-about');
  });

  it('static fallback is superseded by stale cache', async () => {
    const cached = { id: 'cached-about', name: 'About', url: '/about', contentType: 'standardPage', properties: {} };
    vi.stubGlobal('fetch', mockFetch(200, cached));
    await getPage('/about'); // populate cache

    vi.stubGlobal('fetch', mockFetchError());
    const result = await getPage('/about');

    expect(result.id).toBe('cached-about'); // cache wins over static fallback
  });
});

// --- non-critical routes return null on outage ---

describe('graceful unavailable — non-critical routes', () => {
  it('getBlogPost returns null when CMS is down and cache is cold', async () => {
    vi.stubGlobal('fetch', mockFetchError());
    expect(await getBlogPost('my-post')).toBeNull();
  });

  it('getBlogPosts returns [] when CMS is down and cache is cold', async () => {
    vi.stubGlobal('fetch', mockFetchError());
    expect(await getBlogPosts()).toEqual([]);
  });

  it('getSettings returns null when CMS is down and cache is cold', async () => {
    vi.stubGlobal('fetch', mockFetchError());
    expect(await getSettings()).toBeNull();
  });
});
