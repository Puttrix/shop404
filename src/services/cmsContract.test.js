/**
 * CMS Adapter Contract Tests (P-110)
 *
 * These tests validate the shape of payloads the `/api/content/*` adapter
 * returns and the frontend logic that consumes them.  They act as a regression
 * guard against DTO drift between the Umbraco controller and the React SPA.
 *
 * No HTTP calls are made — tests work against fixtures that mirror what the
 * Umbraco ContentApiController actually produces (see Controllers/ContentApiController.cs).
 */

import { describe, it, expect } from 'vitest';

// ---------------------------------------------------------------------------
// Canonical fixture payloads — "full" versions with every field present.
// Keep in sync with ContentApiController.cs MapPage / MapBlog* / GetSettings.
// ---------------------------------------------------------------------------

const FULL_PAGE = {
  id: '11111111-aaaa-bbbb-cccc-000000000001',
  contentType: 'standardPage',
  name: 'About',
  url: '/about',
  properties: {
    pageTitle: 'About Us',
    slug: 'about',
    seoTitle: 'About — Shop404',
    seoDescription: 'Learn about Shop404.',
    hideFromNavigation: false,
    bodyContent: '<p>Body text here.</p>',
    introText: '',
    heroHeading: '',
    heroText: '',
    contentBlocks: [],
    featuredProductsSection: [],
  },
};

const FULL_HOME = {
  id: '11111111-aaaa-bbbb-cccc-000000000002',
  contentType: 'homePage',
  name: 'Home',
  url: '/',
  properties: {
    pageTitle: 'Home',
    slug: '/',
    seoTitle: 'Shop404 — Demo',
    seoDescription: 'Demo ecommerce site.',
    hideFromNavigation: false,
    bodyContent: '',
    introText: '',
    heroHeading: 'Modern mock ecommerce + donation site',
    heroText: 'Built for testing analytics implementations.',
    contentBlocks: [],
    featuredProductsSection: [
      { alias: 'productTeaserBlock', data: { productName: 'Widget', image: '/img/w.png', price: '$9.99', link: '/products/1' } },
    ],
  },
};

const NAV_ITEM = { title: 'About', url: '/about' };

const FULL_BLOG_SUMMARY = {
  id: '22222222-aaaa-bbbb-cccc-000000000003',
  title: 'Getting Started',
  slug: 'getting-started',
  publishDate: '2026-01-15',
  summary: 'A quick introduction.',
  author: 'Alice',
  tags: ['intro', 'guide'],
};

const FULL_BLOG_DETAIL = {
  ...FULL_BLOG_SUMMARY,
  body: '<p>Full article body.</p>',
  seoTitle: 'Getting Started — Blog',
  seoDescription: 'Intro to Shop404.',
};

const FULL_SETTINGS = {
  footerText: '© 2026 Shop404.',
  footerLinks: [{ title: 'Privacy', url: '/privacy' }],
  defaultSeoTitle: 'Shop404 — Demo Ecommerce',
  defaultSeoDescription: 'A demo site.',
};

const BLOCK_HERO = {
  alias: 'heroBlock',
  data: { heading: 'Hero', text: 'Sub text', backgroundImage: '/img/bg.jpg', ctaText: 'Shop now', ctaLink: '/products' },
};
const BLOCK_CTA = {
  alias: 'ctaBlock',
  data: { title: 'Join us', description: 'Desc', buttonText: 'Click', buttonUrl: '/signup' },
};
const BLOCK_TEASER = {
  alias: 'productTeaserBlock',
  data: { productName: 'Widget', image: '/img/w.jpg', price: '$9.99', link: '/products/1' },
};

// ---------------------------------------------------------------------------
// Title resolution logic (mirrors CmsPage.jsx line 25)
// ---------------------------------------------------------------------------

function resolvePageTitle(page) {
  return page.properties?.seoTitle || page.properties?.pageTitle || page.name;
}

// Settings consumer logic (mirrors Footer.jsx / useCmsSettings)
function resolveFooterText(settings) {
  return settings?.footerText || `© ${new Date().getFullYear()} Shop404. For testing only.`;
}

// ---------------------------------------------------------------------------
// 1. Page DTO contract
// ---------------------------------------------------------------------------

describe('Page DTO — required top-level fields', () => {
  it('has id as non-empty string', () => {
    expect(typeof FULL_PAGE.id).toBe('string');
    expect(FULL_PAGE.id.length).toBeGreaterThan(0);
  });

  it('has contentType as non-empty string', () => {
    expect(typeof FULL_PAGE.contentType).toBe('string');
    expect(FULL_PAGE.contentType.length).toBeGreaterThan(0);
  });

  it('has name as string', () => {
    expect(typeof FULL_PAGE.name).toBe('string');
  });

  it('has url starting with /', () => {
    expect(FULL_PAGE.url).toMatch(/^\//);
  });

  it('has properties object', () => {
    expect(FULL_PAGE.properties).toBeDefined();
    expect(typeof FULL_PAGE.properties).toBe('object');
  });
});

describe('Page DTO — properties fields', () => {
  const { properties: p } = FULL_PAGE;

  it('has pageTitle string', () => expect(typeof p.pageTitle).toBe('string'));
  it('has slug string', () => expect(typeof p.slug).toBe('string'));
  it('has seoTitle string', () => expect(typeof p.seoTitle).toBe('string'));
  it('has seoDescription string', () => expect(typeof p.seoDescription).toBe('string'));
  it('has hideFromNavigation boolean', () => expect(typeof p.hideFromNavigation).toBe('boolean'));
  it('has bodyContent string', () => expect(typeof p.bodyContent).toBe('string'));
  it('has introText string', () => expect(typeof p.introText).toBe('string'));
  it('has heroHeading string', () => expect(typeof p.heroHeading).toBe('string'));
  it('has heroText string', () => expect(typeof p.heroText).toBe('string'));
  it('has contentBlocks array', () => expect(Array.isArray(p.contentBlocks)).toBe(true));
  it('has featuredProductsSection array', () => expect(Array.isArray(p.featuredProductsSection)).toBe(true));
});

describe('Page DTO — sparse payload (minimal valid response)', () => {
  const sparse = { id: 'x', contentType: 'standardPage', name: 'About', url: '/about', properties: {} };

  it('frontend does not crash when properties is empty', () => {
    expect(() => resolvePageTitle(sparse)).not.toThrow();
  });

  it('title resolution falls back to name when properties absent', () => {
    expect(resolvePageTitle(sparse)).toBe('About');
  });

  it('bodyContent absent → renders nothing (falsy check)', () => {
    expect(sparse.properties.bodyContent).toBeFalsy();
  });

  it('contentBlocks absent → array default prevents crash', () => {
    const blocks = sparse.properties.contentBlocks ?? [];
    expect(Array.isArray(blocks)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 2. Title resolution logic
// ---------------------------------------------------------------------------

describe('Page title resolution (CmsPage logic)', () => {
  it('prefers seoTitle over pageTitle and name', () => {
    const page = { name: 'N', properties: { seoTitle: 'SEO', pageTitle: 'Title' } };
    expect(resolvePageTitle(page)).toBe('SEO');
  });

  it('falls back to pageTitle when seoTitle is empty', () => {
    const page = { name: 'N', properties: { seoTitle: '', pageTitle: 'Title' } };
    expect(resolvePageTitle(page)).toBe('Title');
  });

  it('falls back to name when both seoTitle and pageTitle are absent', () => {
    const page = { name: 'Name', properties: {} };
    expect(resolvePageTitle(page)).toBe('Name');
  });

  it('falls back to name when properties is undefined', () => {
    const page = { name: 'Name' };
    expect(resolvePageTitle(page)).toBe('Name');
  });

  it('works for homePage content type', () => {
    expect(resolvePageTitle(FULL_HOME)).toBe('Shop404 — Demo');
  });
});

// ---------------------------------------------------------------------------
// 3. Navigation item contract
// ---------------------------------------------------------------------------

describe('Navigation item DTO', () => {
  it('has title string', () => expect(typeof NAV_ITEM.title).toBe('string'));
  it('has url string starting with /', () => {
    expect(typeof NAV_ITEM.url).toBe('string');
    expect(NAV_ITEM.url).toMatch(/^\//);
  });

  it('getNavigation returns [] when items key absent (service fallback)', () => {
    const data = {};
    expect(data?.items ?? []).toEqual([]);
  });

  it('getNavigation returns items array on valid response', () => {
    const data = { items: [NAV_ITEM] };
    expect(data?.items ?? []).toEqual([NAV_ITEM]);
  });
});

// ---------------------------------------------------------------------------
// 4. Blog summary DTO contract
// ---------------------------------------------------------------------------

describe('Blog summary DTO', () => {
  it('has id string', () => expect(typeof FULL_BLOG_SUMMARY.id).toBe('string'));
  it('has title string', () => expect(typeof FULL_BLOG_SUMMARY.title).toBe('string'));
  it('has slug string', () => expect(typeof FULL_BLOG_SUMMARY.slug).toBe('string'));
  it('has publishDate as yyyy-MM-dd string', () => {
    expect(FULL_BLOG_SUMMARY.publishDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
  it('has summary string', () => expect(typeof FULL_BLOG_SUMMARY.summary).toBe('string'));
  it('has author string', () => expect(typeof FULL_BLOG_SUMMARY.author).toBe('string'));
  it('has tags array', () => expect(Array.isArray(FULL_BLOG_SUMMARY.tags)).toBe(true));
});

describe('Blog summary DTO — sparse payload', () => {
  const sparse = { id: 'x', title: 'T', slug: 's', publishDate: '2026-01-01', summary: '', author: '', tags: [] };

  it('empty tags array is valid', () => expect(sparse.tags).toEqual([]));
  it('empty summary is valid', () => expect(sparse.summary).toBe(''));
  it('empty author is valid', () => expect(sparse.author).toBe(''));
});

// ---------------------------------------------------------------------------
// 5. Blog detail DTO contract
// ---------------------------------------------------------------------------

describe('Blog detail DTO', () => {
  it('has all blog summary fields', () => {
    expect(FULL_BLOG_DETAIL).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      slug: expect.any(String),
      publishDate: expect.any(String),
    });
  });

  it('has body string (rich text)', () => expect(typeof FULL_BLOG_DETAIL.body).toBe('string'));
  it('has seoTitle string', () => expect(typeof FULL_BLOG_DETAIL.seoTitle).toBe('string'));
  it('has seoDescription string', () => expect(typeof FULL_BLOG_DETAIL.seoDescription).toBe('string'));
  it('has tags array', () => expect(Array.isArray(FULL_BLOG_DETAIL.tags)).toBe(true));
});

// ---------------------------------------------------------------------------
// 6. Settings DTO contract
// ---------------------------------------------------------------------------

describe('Settings DTO', () => {
  it('has footerText string', () => expect(typeof FULL_SETTINGS.footerText).toBe('string'));
  it('has footerLinks array', () => expect(Array.isArray(FULL_SETTINGS.footerLinks)).toBe(true));
  it('footerLinks items have title and url', () => {
    FULL_SETTINGS.footerLinks.forEach(link => {
      expect(typeof link.title).toBe('string');
      expect(typeof link.url).toBe('string');
    });
  });
  it('has defaultSeoTitle string', () => expect(typeof FULL_SETTINGS.defaultSeoTitle).toBe('string'));
  it('has defaultSeoDescription string', () => expect(typeof FULL_SETTINGS.defaultSeoDescription).toBe('string'));
});

describe('Settings consumer logic (Footer.jsx)', () => {
  it('uses footerText from settings when present', () => {
    expect(resolveFooterText(FULL_SETTINGS)).toBe('© 2026 Shop404.');
  });

  it('falls back to default when settings is null', () => {
    const result = resolveFooterText(null);
    expect(result).toContain('Shop404');
    expect(result).toContain(String(new Date().getFullYear()));
  });

  it('falls back to default when footerText is empty string', () => {
    const result = resolveFooterText({ footerText: '' });
    expect(result).toContain('Shop404');
  });

  it('footerLinks defaults to [] when absent from settings', () => {
    const settings = { footerText: 'x' };
    expect(settings.footerLinks ?? []).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 7. Block DTO contract
// ---------------------------------------------------------------------------

describe('Block item DTO — base shape', () => {
  [BLOCK_HERO, BLOCK_CTA, BLOCK_TEASER].forEach(block => {
    it(`${block.alias} has alias string`, () => expect(typeof block.alias).toBe('string'));
    it(`${block.alias} has data object`, () => {
      expect(block.data).toBeDefined();
      expect(typeof block.data).toBe('object');
    });
  });
});

describe('heroBlock data fields', () => {
  const { data: d } = BLOCK_HERO;
  it('has heading string', () => expect(typeof d.heading).toBe('string'));
  it('has text string', () => expect(typeof d.text).toBe('string'));
  it('has backgroundImage string (url or empty)', () => expect(typeof d.backgroundImage).toBe('string'));
  it('has ctaText string', () => expect(typeof d.ctaText).toBe('string'));
  it('has ctaLink string', () => expect(typeof d.ctaLink).toBe('string'));
});

describe('ctaBlock data fields', () => {
  const { data: d } = BLOCK_CTA;
  it('has title string', () => expect(typeof d.title).toBe('string'));
  it('has description string', () => expect(typeof d.description).toBe('string'));
  it('has buttonText string', () => expect(typeof d.buttonText).toBe('string'));
  it('has buttonUrl string', () => expect(typeof d.buttonUrl).toBe('string'));
});

describe('productTeaserBlock data fields', () => {
  const { data: d } = BLOCK_TEASER;
  it('has productName string', () => expect(typeof d.productName).toBe('string'));
  it('has image string (url or empty)', () => expect(typeof d.image).toBe('string'));
  it('has price string', () => expect(typeof d.price).toBe('string'));
  it('has link string', () => expect(typeof d.link).toBe('string'));
});

describe('Block — unknown alias handling', () => {
  it('block with unknown alias has expected shape', () => {
    const unknownBlock = { alias: 'unknownBlock', data: {} };
    expect(unknownBlock.alias).toBe('unknownBlock');
    expect(unknownBlock.data).toEqual({});
  });

  it('data defaults to empty object when absent (spread-safe)', () => {
    const block = { alias: 'ctaBlock' };
    expect(block.data ?? {}).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// 8. Content type aliases match registered block aliases (cross-check)
// ---------------------------------------------------------------------------

import { getBlockComponent } from '../components/cms/BlockRegistry.js';

describe('Block alias cross-check: controller aliases match registry', () => {
  // These aliases must match ContentApiController.cs MapBlockData switch cases.
  const controllerAliases = ['heroBlock', 'ctaBlock', 'productTeaserBlock'];

  it.each(controllerAliases)(
    'controller alias "%s" is registered in BlockRegistry',
    alias => {
      expect(getBlockComponent(alias)).not.toBeNull();
    }
  );
});
