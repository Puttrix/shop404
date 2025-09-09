import { Link, Routes, Route, NavLink } from 'react-router-dom';
import { useEffect } from 'react';
import { kbArticles } from '../../data/kb.js';
import { testimonials } from '../../data/testimonials.js';
import { setTitle } from '../../utils/seo.js';
import { trackPage, trackContentScan, trackContentClick } from '../../utils/analytics.js';

export default function LearnLayout() {
  useEffect(() => {
    setTitle('Learn');
    trackPage('Learn');
    trackContentScan(document);
  }, []);
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">Learn & Resources</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <Link
          to="articles"
          className="matomoTrackContent card"
          data-content-name="Learn Tile"
          data-content-piece="Articles"
          data-content-target="/learn/articles"
          onClick={() => trackContentClick({ name: 'Learn Tile', piece: 'Articles', target: '/learn/articles' })}
        >
          <div className="card-body">
            <h3 className="font-medium mb-1">Guides & Articles</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Sizing, care, and how‑to guides.</p>
          </div>
        </Link>
        <Link
          to="faq"
          className="matomoTrackContent card"
          data-content-name="Learn Tile"
          data-content-piece="FAQ"
          data-content-target="/learn/faq"
          onClick={() => trackContentClick({ name: 'Learn Tile', piece: 'FAQ', target: '/learn/faq' })}
        >
          <div className="card-body">
            <h3 className="font-medium mb-1">FAQs</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Answers to common questions.</p>
          </div>
        </Link>
        <Link
          to="testimonials"
          className="matomoTrackContent card"
          data-content-name="Learn Tile"
          data-content-piece="Testimonials"
          data-content-target="/learn/testimonials"
          onClick={() => trackContentClick({ name: 'Learn Tile', piece: 'Testimonials', target: '/learn/testimonials' })}
        >
          <div className="card-body">
            <h3 className="font-medium mb-1">Customer Stories</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Real feedback from our customers.</p>
          </div>
        </Link>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Popular reads</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {kbArticles.slice(0,3).map(a => (
            <Link key={a.slug}
              to={`articles/${a.slug}`}
              className="matomoTrackContent card"
              data-content-name="KB Teaser"
              data-content-piece={a.title}
              data-content-target={`/learn/articles/${a.slug}`}
              onClick={() => trackContentClick({ name: 'KB Teaser', piece: a.title, target: `/learn/articles/${a.slug}` })}
            >
              <div className="card-body">
                <h3 className="font-medium mb-1">{a.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">{a.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">What customers say</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {testimonials.slice(0,3).map(t => (
            <div key={t.id}
              className="matomoTrackContent card"
              data-content-name="Testimonial"
              data-content-piece={t.author}
              data-content-target={`/products/${t.productId}`}
            >
              <div className="card-body">
                <div className="text-yellow-500" aria-label={`${t.rating} out of 5 stars`}>{'★★★★★'.slice(0,t.rating)}</div>
                <blockquote className="mt-2 text-sm">“{t.quote}”</blockquote>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">— {t.author}, {t.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
