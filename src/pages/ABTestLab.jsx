import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { setTitle } from '../utils/seo.js';
import { trackPage } from '../utils/analytics.js';

const SCENARIOS = [
  {
    id: 'headline-cta',
    name: 'Headline + CTA',
    description: 'Quickly compare messaging and call-to-action framing.',
    metrics: ['CTA click-through rate', 'Add to cart rate', 'Donation start rate'],
  },
  {
    id: 'social-proof',
    name: 'Social proof block',
    description: 'Evaluate trust copy position and testimonial emphasis.',
    metrics: ['Product detail view rate', 'Checkout start rate', 'Bounce rate'],
  },
  {
    id: 'price-framing',
    name: 'Price framing',
    description: 'Compare price presentation and value framing.',
    metrics: ['Average order value', 'Checkout completion rate', 'Coupon usage'],
  },
];

const VARIANTS = ['A', 'B'];

const PREVIEW_COPY = {
  'headline-cta': {
    A: {
      eyebrow: 'Variant A',
      headline: 'Launch-ready essentials for modern teams',
      subcopy: 'Clarity-first layout with direct action labels.',
      cta: 'Explore products',
    },
    B: {
      eyebrow: 'Variant B',
      headline: 'Build your stack with confidence',
      subcopy: 'Benefit-led message and lower-friction CTA style.',
      cta: 'Start shopping',
    },
  },
  'social-proof': {
    A: {
      eyebrow: 'Variant A',
      headline: 'Trusted by builders shipping every week',
      subcopy: 'Compact social proof near the primary action.',
      cta: 'See customer stories',
    },
    B: {
      eyebrow: 'Variant B',
      headline: 'Used by fast-moving teams in production',
      subcopy: 'Expanded trust narrative with stronger supporting text.',
      cta: 'Read testimonials',
    },
  },
  'price-framing': {
    A: {
      eyebrow: 'Variant A',
      headline: 'Simple pricing, clear value',
      subcopy: 'Feature-forward framing with direct pricing context.',
      cta: 'View plans',
    },
    B: {
      eyebrow: 'Variant B',
      headline: 'Start small, scale when ready',
      subcopy: 'Outcome-forward framing with commitment reassurance.',
      cta: 'Compare options',
    },
  },
};

export default function ABTestLab() {
  const [scenarioId, setScenarioId] = useState(SCENARIOS[0].id);
  const [variant, setVariant] = useState('A');

  useEffect(() => {
    setTitle('A/B Test Lab');
    trackPage('A/B Test Lab', { page_type: 'experiment_preview' });
  }, []);

  const scenario = useMemo(
    () => SCENARIOS.find((item) => item.id === scenarioId) || SCENARIOS[0],
    [scenarioId],
  );

  const preview = PREVIEW_COPY[scenario.id][variant];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">Experiment Sandbox</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">A/B Test Pre-Testing Page</h1>
        <p className="mt-3 max-w-3xl text-sm text-gray-700 dark:text-gray-300">
          Use this page to dry-run experiment ideas before production setup. Content blocks are intentionally lightweight and easy to replace later.
        </p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Scenario</h2>
          <div className="mt-4 space-y-3">
            {SCENARIOS.map((item) => (
              <label
                key={item.id}
                className={`block cursor-pointer rounded-xl border p-3 transition ${
                  scenarioId === item.id
                    ? 'border-brand-500 bg-brand-50 dark:border-brand-400 dark:bg-gray-700/70'
                    : 'border-gray-200 hover:border-brand-300 dark:border-gray-600 dark:hover:border-brand-400'
                }`}
              >
                <input
                  className="sr-only"
                  type="radio"
                  name="scenario"
                  checked={scenarioId === item.id}
                  onChange={() => setScenarioId(item.id)}
                />
                <p className="font-medium">{item.name}</p>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{item.description}</p>
              </label>
            ))}
          </div>

          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Variant</h2>
          <div className="mt-3 flex gap-2">
            {VARIANTS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setVariant(option)}
                className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                  variant === option
                    ? 'bg-brand-700 text-white dark:bg-brand-500'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Variant {option}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="rounded-xl border border-dashed border-gray-300 p-6 dark:border-gray-600">
            <p className="text-xs font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">{preview.eyebrow}</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight">{preview.headline}</h2>
            <p className="mt-3 text-gray-700 dark:text-gray-300">{preview.subcopy}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <button type="button" className="btn-primary">{preview.cta}</button>
              <Link to="/products" className="btn-secondary">Reference products page</Link>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-gray-50 p-4 dark:bg-gray-900/50">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400">Suggested Success Metrics</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700 dark:text-gray-300">
              {scenario.metrics.map((metric) => (
                <li key={metric}>{metric}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
