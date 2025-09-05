import { useEffect } from 'react';
import { products } from '../data/products.js';
import ProductCard from '../components/ProductCard.jsx';
import { trackPage, trackProductImpression } from '../utils/analytics.js';

export default function Products() {
  useEffect(() => {
    trackPage('Products');
    products.forEach((p, idx) => trackProductImpression(p, { item_list_name: 'All Products', item_list_id: 'products_all', index: idx + 1 }));
  }, []);
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">All products</h1>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {products.map(p => <ProductCard key={p.id} product={p} />)}
      </div>
    </div>
  );
}
