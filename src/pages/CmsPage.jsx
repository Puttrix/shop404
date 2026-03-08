import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { getPage } from '../services/cmsService.js';
import { setTitle } from '../utils/seo.js';
import { trackPage } from '../utils/analytics.js';
import BlockRenderer from '../components/cms/BlockRenderer.jsx';

// Renders a CMS-owned page fetched from the adapter API.
// Reached only after all reserved code-owned routes have been tried first
// (React Router matches explicit routes before this catch-all).
export default function CmsPage() {
  const { pathname } = useLocation();
  // undefined = still loading, null = not found / CMS unavailable
  const [page, setPage] = useState(undefined);

  useEffect(() => {
    setPage(undefined);
    getPage(pathname).then(setPage);
  }, [pathname]);

  useEffect(() => {
    if (!page) return;
    const title = page.properties?.seoTitle || page.properties?.pageTitle || page.name;
    setTitle(title);
    trackPage(page.properties?.pageTitle || page.name, {
      page_title: title,
      cms_content_type: page.contentType,
    });
  }, [page]);

  if (page === undefined) {
    return <div className="p-8 text-gray-500">Loading…</div>;
  }

  if (page === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-2xl font-bold mb-2">Page not found</h1>
        <p className="text-gray-600 dark:text-gray-400">The page you are looking for does not exist or is not available.</p>
      </div>
    );
  }

  const { properties } = page;

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      {properties.heroHeading ? (
        <section className="mb-8">
          <h1 className="text-4xl font-bold">{properties.heroHeading}</h1>
          {properties.heroText && (
            <p className="mt-3 text-lg text-gray-700 dark:text-gray-300">{properties.heroText}</p>
          )}
        </section>
      ) : (
        <h1 className="text-3xl font-bold mb-6">{properties.pageTitle || page.name}</h1>
      )}

      {properties.bodyContent && (
        // Content comes from our own Umbraco backend — trusted rich text HTML.
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: properties.bodyContent }}
        />
      )}

      {!properties.bodyContent && properties.introText && (
        <p className="text-gray-700 dark:text-gray-300">{properties.introText}</p>
      )}

      <BlockRenderer blocks={properties.contentBlocks} />
      <BlockRenderer blocks={properties.featuredProductsSection} />
    </div>
  );
}
