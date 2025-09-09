import { useEffect } from 'react';
import { testimonials } from '../../data/testimonials.js';
import { setTitle } from '../../utils/seo.js';
import { trackPage, trackContentScan } from '../../utils/analytics.js';

export default function TestimonialsPage() {
  useEffect(() => { setTitle('Customer Stories'); trackPage('Learn Testimonials'); trackContentScan(document); }, []);
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">Customer Stories</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {testimonials.map(t => (
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
  );
}
