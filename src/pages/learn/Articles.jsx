import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { kbArticles } from '../../data/kb.js';
import { setTitle } from '../../utils/seo.js';
import { trackPage, trackContentScan, trackContentClick } from '../../utils/analytics.js';

export function ArticlesList() {
  useEffect(() => { setTitle('Guides & Articles'); trackPage('Learn Articles'); trackContentScan(document); }, []);
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">Guides & Articles</h1>
      <div className="space-y-4">
        {kbArticles.map(a => (
          <Link key={a.slug}
            to={`/learn/articles/${a.slug}`}
            className="matomoTrackContent block rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-800"
            data-content-name="KB Teaser"
            data-content-piece={a.title}
            data-content-target={`/learn/articles/${a.slug}`}
            onClick={() => trackContentClick({ name: 'KB Teaser', piece: a.title, target: `/learn/articles/${a.slug}` })}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-medium">{a.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{a.excerpt}</p>
              </div>
              <span className="text-xs text-gray-500">{a.readingMinutes} min</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export function ArticleDetail() {
  const { slug } = useParams();
  const article = kbArticles.find(a => a.slug === slug);
  useEffect(() => {
    setTitle(article ? article.title : 'Article');
    trackPage('Article', { article_slug: slug });
    trackContentScan(document);
  }, [slug]);
  if (!article) return <div className="p-8">Not found</div>;
  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold">{article.title}</h1>
        <div className="text-sm text-gray-500">{article.readingMinutes} min read</div>
      </header>
      <div className="prose dark:prose-invert max-w-none">
        <p>{article.body}</p>
      </div>
    </article>
  );
}
