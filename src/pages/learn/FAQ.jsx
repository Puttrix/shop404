import { useEffect, useState } from 'react';
import { faqs } from '../../data/faqs.js';
import { setTitle } from '../../utils/seo.js';
import { trackPage, trackContentScan, trackContentClick } from '../../utils/analytics.js';

export default function FAQPage() {
  useEffect(() => { setTitle('FAQs'); trackPage('Learn FAQ'); trackContentScan(document); }, []);
  const [open, setOpen] = useState({});
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h1>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {faqs.map((f, idx) => (
          <div key={idx} className="py-4">
            <button
              className="matomoTrackContent w-full text-left"
              data-track-content="true"
              data-content-name="FAQ Question"
              data-content-piece={f.q}
              data-content-target="#faq-answer"
              onClick={() => trackContentClick({ name: 'FAQ Question', piece: f.q, target: '#faq-answer' })}
              onClick={() => setOpen(o => ({ ...o, [idx]: !o[idx] }))}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium">{f.q}</h3>
                <span className="text-sm text-gray-500">{open[idx] ? '−' : '+'}</span>
              </div>
            </button>
            {open[idx] && (
              <div id="faq-answer" className="mt-2 text-sm text-gray-700 dark:text-gray-300">{f.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
