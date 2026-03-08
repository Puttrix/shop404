// CMS service adapter — calls repo-owned /api/content/* endpoints.
// Maps API payloads to UI-friendly types and handles error/fallback behavior.
// Base URL is read from window.__CONFIG__.CMS_API_URL at runtime (defaults to
// same origin so a reverse proxy or dev Vite proxy can forward requests).
//
// Caching strategy (three layers, outermost wins):
//   1. HTTP cache  — driven by Cache-Control headers set by ContentApiController.cs
//                    (public, max-age=N, stale-while-revalidate=M).  Handles normal
//                    traffic and CDN/edge caching.
//   2. In-process  — populated on every successful fetch.  Served as stale-on-error
//                    when the CMS is unreachable (network failure, timeout, 5xx).
//                    Cleared on page reload; no TTL — any stale entry beats an outage.
//   3. Static      — PAGE_FALLBACKS in cmsFallbacks.js.  Served only for critical
//                    routes when both layers above are cold.  Non-critical routes
//                    return null → CmsPage shows a graceful "unavailable" state.

import { PAGE_FALLBACKS } from './cmsFallbacks.js';

const TIMEOUT_MS = 8000;

// In-process cache: path → last successful response data.
// Cleared by clearCache() (used in tests) or on module reload.
const _cache = new Map();

/** Clears the in-process cache.  Exported for tests only. */
export function clearCache() {
  _cache.clear();
}

function cmsBase() {
  return (typeof window !== 'undefined' && window.__CONFIG__?.CMS_API_URL) || '';
}

/**
 * Fetches a CMS adapter path.
 *
 * On success  → updates in-process cache, returns data.
 * On failure  → returns in-process stale cache entry if available,
 *               otherwise returns fallback (default null).
 */
async function apiFetch(path, { fallback = null } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${cmsBase()}${path}`, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    _cache.set(path, data);
    return data;
  } catch {
    const stale = _cache.get(path);
    if (stale !== undefined) return stale;
    return fallback;
  } finally {
    clearTimeout(timer);
  }
}

// Returns the page DTO for a CMS-owned route, or null if not found / unavailable.
// Shape: { id, contentType, name, url, properties: { pageTitle, slug, seoTitle,
//           seoDescription, hideFromNavigation, bodyContent, heroHeading, ... } }
// Critical routes (/about /faq /terms /privacy) have a static fallback payload.
export async function getPage(route) {
  return apiFetch(
    `/api/content/page?route=${encodeURIComponent(route)}`,
    { fallback: PAGE_FALLBACKS[route] ?? null }
  );
}

// Returns an ordered list of navigation items from the CMS Site Settings singleton.
// Shape: [{ title, url }]
// Returns [] on error or when navigation has not been configured.
export async function getNavigation() {
  const data = await apiFetch('/api/content/navigation');
  return data?.items ?? [];
}

// Returns a list of blog post summaries, newest first.
// Shape: [{ id, title, slug, publishDate, summary, author, tags }]
export async function getBlogPosts(limit = 10) {
  const data = await apiFetch(`/api/content/blog?limit=${limit}`);
  return data?.items ?? [];
}

// Returns the full blog post DTO for a given slug, or null if not found.
// Shape: { id, title, slug, publishDate, summary, author, body,
//           seoTitle, seoDescription, tags }
export async function getBlogPost(slug) {
  return apiFetch(`/api/content/blog/${encodeURIComponent(slug)}`);
}

// Returns global site settings from the CMS singleton, or null on error.
// Shape: { footerText, defaultSeoTitle, defaultSeoDescription }
export async function getSettings() {
  return apiFetch('/api/content/settings');
}
