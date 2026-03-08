// CMS service adapter — calls repo-owned /api/content/* endpoints.
// Maps API payloads to UI-friendly types and handles error/fallback behavior.
// Base URL is read from window.__CONFIG__.CMS_API_URL at runtime (defaults to
// same origin so a reverse proxy or dev Vite proxy can forward requests).

const TIMEOUT_MS = 8000;

function cmsBase() {
  return (typeof window !== 'undefined' && window.__CONFIG__?.CMS_API_URL) || '';
}

async function apiFetch(path) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${cmsBase()}${path}`, { signal: controller.signal });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// Returns the page DTO for a CMS-owned route, or null if not found / unavailable.
// Shape: { id, contentType, name, url, properties: { pageTitle, slug, seoTitle,
//           seoDescription, hideFromNavigation, bodyContent, heroHeading, ... } }
export async function getPage(route) {
  return apiFetch(`/api/content/page?route=${encodeURIComponent(route)}`);
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
