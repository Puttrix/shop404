import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { trackPage, trackPurchase } from '../utils/analytics.js';
import { setTitle } from '../utils/seo.js';

export default function OrderConfirmation() {
  const order = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('lastOrder')); } catch { return null; }
  }, []);

  useEffect(() => {
    setTitle('Order confirmation');
    trackPage('Order confirmation');
    if (order) trackPurchase(order.orderId, order.total, order.items, { tax: order.tax, shipping: order.shipping });
  }, [order]);

  if (!order) {
    return <div className="p-8">No recent order. <Link className="text-brand-700" to="/products">Shop now</Link>.</div>;
  }
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="border rounded-xl bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-semibold">Thank you for your order!</h1>
        <p className="text-gray-700 dark:text-gray-300 mt-2">Your order <span className="font-mono">{order.orderId}</span> is confirmed.</p>
        <Link to="/products" className="btn-primary mt-4 inline-flex">Continue shopping</Link>
      </div>
    </div>
  );
}
