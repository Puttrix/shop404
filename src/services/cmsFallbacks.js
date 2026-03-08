/**
 * Static fallback payloads for critical CMS routes.
 *
 * These are served as a last resort when BOTH the live CMS fetch AND the
 * in-process stale cache are unavailable (e.g. cold start during CMS outage).
 *
 * Rules:
 * - Critical pages (legal/compliance + global navigation/settings) have a fallback.
 * - Non-critical pages (blog, dynamic content) return null → CmsPage shows
 *   "temporarily unavailable" without crashing.
 * - Fallback content should be minimal and clearly temporary.
 *   Do NOT embed real editorial content here — it will drift.
 *
 * Update process:
 * - If editorial content changes significantly, the in-process cache will update
 *   automatically once the CMS is reachable again. Static fallbacks only need
 *   updating when route structure or content type aliases change.
 */

const UNAVAILABLE_BODY = '<p>This page is temporarily unavailable. Please try again shortly.</p>';

/** Fallback page payloads keyed by clean URL route. */
export const PAGE_FALLBACKS = {
  '/about': makePage('about', 'About', 'About'),
  '/faq': makePage('faq', 'FAQ', 'FAQ'),
  '/terms': makePage('terms', 'Terms and Conditions', 'Terms and Conditions'),
  '/privacy': makePage('privacy', 'Privacy Policy', 'Privacy Policy'),
};

/** Routes that have a static fallback payload. */
export const CRITICAL_ROUTES = new Set(Object.keys(PAGE_FALLBACKS));

function makePage(slug, name, pageTitle) {
  return {
    id: `fallback-${slug}`,
    contentType: 'standardPage',
    name,
    url: `/${slug}`,
    properties: {
      pageTitle,
      slug,
      seoTitle: '',
      seoDescription: '',
      hideFromNavigation: false,
      bodyContent: UNAVAILABLE_BODY,
      introText: '',
      heroHeading: '',
      heroText: '',
      contentBlocks: [],
      featuredProductsSection: [],
    },
  };
}
