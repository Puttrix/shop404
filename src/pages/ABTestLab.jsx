import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { setTitle } from '../utils/seo.js';
import { trackPage } from '../utils/analytics.js';

export default function ABTestLab() {
  useEffect(() => {
    setTitle('A/B Test Lab');
    trackPage('A/B Test Lab', { page_type: 'experiment_preview' });
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">Experiment Sandbox</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">A/B Test Pre-Testing Page</h1>
        <p className="mt-3 max-w-3xl text-sm text-gray-700 dark:text-gray-300">
          This page is a stable baseline for Optimizely Web experiments. Variants should be created and delivered from Optimizely, not toggled in local UI.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <aside className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">How to use this page</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-gray-700 dark:text-gray-300">
            <li>Create an Optimizely experiment that targets URL path `/ab-test-lab`.</li>
            <li>Use the block IDs below as selectors for headline, copy, and CTA changes.</li>
            <li>Run and validate in Optimizely preview mode before production rollout.</li>
          </ol>
          <h3 className="mt-5 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Suggested metrics</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
            <li>CTA click-through rate</li>
            <li>Add to cart rate</li>
            <li>Donation start rate</li>
          </ul>
        </aside>

        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="rounded-xl border border-dashed border-gray-300 p-6 dark:border-gray-600">
            <p id="ab-lab-eyebrow" className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
              Baseline
            </p>
            <h2 id="ab-lab-headline" className="mt-2 text-2xl font-bold tracking-tight">
              Build confidence before launching your next experiment
            </h2>
            <p id="ab-lab-subcopy" className="mt-3 text-gray-700 dark:text-gray-300">
              This baseline content is intentionally simple so Optimizely can control variation copy, CTA text, and layout emphasis.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button id="ab-lab-primary-cta" type="button" className="btn-primary">Start baseline flow</button>
              <Link id="ab-lab-secondary-cta" to="/products" className="btn-secondary">Reference products page</Link>
            </div>
          </div>
        </section>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h3 className="text-lg font-semibold tracking-tight">A/B Content Blocks</h3>
        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
          These are static placeholder blocks for Optimizely targeting and preview checks.
        </p>

        <div className="block-outer mt-5 grid gap-4 md:grid-cols-2">
          <div className="content-area rounded-xl border border-dashed border-gray-300 p-4 dark:border-gray-600" id="Värde för A-test">
            <div className="space-y-3">
              <div className="block-outer rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                <p>block a</p>
              </div>
              <div className="block-outer rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                <p>block a</p>
              </div>
            </div>
          </div>

          <div className="content-area rounded-xl border border-dashed border-gray-300 p-4 dark:border-gray-600" id="Värde för B-test">
            <div className="space-y-3">
              <div className="block-outer rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                <p>block b</p>
              </div>
              <div className="block-outer rounded-lg bg-gray-50 p-3 dark:bg-gray-900/50">
                <p>block b</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
