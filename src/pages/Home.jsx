import { Link } from 'react-router-dom';
import { products } from '../data/products.js';
import ProductCard from '../components/ProductCard.jsx';
import { useEffect } from 'react';
import { trackPage, trackProductImpression } from '../utils/analytics.js';

export default function Home() {
  useEffect(() => {
    trackPage('Home');
    products.forEach(trackProductImpression);
  }, []);
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-50 to-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Modern mock ecommerce + donation site</h1>
              <p className="mt-3 text-lg text-gray-700">Built for testing Matomo, GTM/GA4, Optimizely Web, and ODP implementations.</p>
              <div className="mt-6 flex gap-3">
                <Link to="/products" className="btn-primary">Shop products</Link>
                <Link to="/donate" className="btn-secondary">Make a donation</Link>
              </div>
            </div>
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
              <img
                src="/images/hero.svg"
                alt="Hero"
                className="w-full h-full object-cover"
                onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/images/placeholder.svg'; }}
              />
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Featured products</h2>
          <Link to="/products" className="text-brand-700 hover:underline">View all</Link>
        </div>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.slice(0,3).map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>
    </div>
  );
}
