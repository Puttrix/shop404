import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart, totals } from '../state/cartState.jsx';
import { getProduct } from '../data/products.js';
import { trackBeginCheckout } from '../utils/analytics.js';
import { setTitle } from '../utils/seo.js';

export default function Checkout() {
  const { state, dispatch } = useCart();
  const navigate = useNavigate();
  const t = totals(state.items);
  const [form, setForm] = useState({ name:'', email:'', address:'', method:'card' });

  const items = useMemo(() => state.items.map(i => {
    const p = getProduct(i.id) || {};
    const currency = i.currency || 'USD';
    const out = { item_id: i.id, item_name: i.name, price: i.price, quantity: i.qty, currency };
    const path = Array.isArray(p.categoryPath) ? p.categoryPath : (p.category ? [p.category] : []);
    if (path[0]) out.item_category = path[0];
    if (path[1]) out.item_category2 = path[1];
    if (path[2]) out.item_category3 = path[2];
    if (path[3]) out.item_category4 = path[3];
    if (path[4]) out.item_category5 = path[4];
    if (path.length) out.item_category_path = path;
    return out;
  }), [state.items]);

  useEffect(() => {
    setTitle('Checkout');
    trackBeginCheckout(items);
  }, [items]);

  function placeOrder(e) {
    e.preventDefault();
    const orderId = 'ORD-' + Math.random().toString(36).slice(2,8).toUpperCase();
    const payload = { orderId, total: t.total, tax: t.tax, shipping: t.shipping, items };
    sessionStorage.setItem('lastOrder', JSON.stringify(payload));
    dispatch({ type: 'CLEAR' });
    navigate('/order-confirmation');
  }

  if (state.items.length === 0) {
    return <div className="p-8">Cart is empty. <Link to="/products" className="text-brand-700">Continue shopping</Link>.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 grid md:grid-cols-3 gap-8">
      <form onSubmit={placeOrder} className="md:col-span-2 space-y-4">
        <h1 className="text-2xl font-semibold">Checkout</h1>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Full name</label>
            <input className="input mt-1" required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input className="input mt-1" type="email" required value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Address</label>
          <textarea className="input mt-1" rows={3} required value={form.address} onChange={e=>setForm({...form, address:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium">Payment method</label>
          <div className="mt-2 flex items-center gap-4">
            {['card','paypal','applepay'].map(m => (
              <label key={m} className="flex items-center gap-2"><input type="radio" checked={form.method===m} onChange={()=>setForm({...form, method:m})}/> {m}</label>
            ))}
          </div>
        </div>
        <button className="btn-primary">Pay ${t.total.toFixed(2)}</button>
      </form>
      <aside>
        <div className="border rounded-lg bg-white dark:bg-gray-800 dark:border-gray-700 p-4">
          <div className="font-medium mb-2">Order summary</div>
          <ul className="divide-y">
            {state.items.map(i => (
              <li key={i.id+i.variant} className="py-2 flex justify-between text-sm">
                <span>{i.name} × {i.qty}</span>
                <span>${(i.qty*i.price).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between py-2 border-t mt-2 font-semibold"><span>Total</span><span>${t.total.toFixed(2)}</span></div>
        </div>
      </aside>
    </div>
  );
}
