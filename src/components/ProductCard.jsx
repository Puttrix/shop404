import { Link } from 'react-router-dom';
import { useCart } from '../state/cartState.jsx';
import { trackAddToCart, trackProductImpression } from '../utils/analytics.js';

export default function ProductCard({ product }) {
  const { dispatch } = useCart();
  // Optional: track impression when card mounts within a list wrapper should pass listCtx
  function add() {
    dispatch({ type: 'ADD', item: { id: product.id, name: product.name, price: product.price, qty: 1, variant: 'default', currency: 'USD' } });
    trackAddToCart(product, 1);
  }
  return (
    <div className="card">
      <Link to={`/products/${product.id}`} className="block aspect-[4/3] bg-gray-100 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/images/placeholder.svg'; }}
        />
      </Link>
      <div className="card-body">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-medium"><Link to={`/products/${product.id}`}>{product.name}</Link></h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{product.category}</p>
          </div>
          <div className="font-semibold">${product.price.toFixed(2)}</div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="badge">In stock</span>
          <button className="btn-primary" onClick={add}>Add to cart</button>
        </div>
      </div>
    </div>
  );
}
