import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getProduct } from '../data/products.js';
import { useCart } from '../state/cartState.jsx';
import { trackPage, trackViewItem, trackAddToCart } from '../utils/analytics.js';
import { setTitle } from '../utils/seo.js';
import ProductImage from '../components/ProductImage.jsx';

export default function ProductDetails() {
  const { id } = useParams();
  const product = getProduct(id);
  const { dispatch } = useCart();

  useEffect(() => {
    if (product) {
      setTitle(product.name);
      trackPage(`Product: ${product.name}`);
      trackViewItem(product);
    }
  }, [product]);

  if (!product) return <div className="p-8">Product not found.</div>;

  function add() {
    dispatch({ type: 'ADD', item: { id: product.id, name: product.name, price: product.price, qty: 1, variant: 'default', currency: 'USD' } });
    trackAddToCart(product, 1);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 grid md:grid-cols-2 gap-8">
      <div className="rounded-xl overflow-hidden border bg-white dark:bg-gray-800 dark:border-gray-700">
        <ProductImage product={product} className="w-full h-full object-cover" />
      </div>
      <div>
        <h1 className="text-3xl font-semibold">{product.name}</h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2">{product.category}</p>
        <div className="text-2xl font-bold mt-4">${product.price.toFixed(2)}</div>
        <p className="mt-4 text-gray-700 dark:text-gray-300">A stylish {product.category.toLowerCase()} designed for this demo store. Perfect for testing analytics and experimentation tools.</p>
        <div className="mt-6 flex gap-3">
          <button className="btn-primary" onClick={add}>Add to cart</button>
        </div>
      </div>
    </div>
  );
}
