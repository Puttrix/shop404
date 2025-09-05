import { Link } from 'react-router-dom';
import { useCart, totals } from '../state/cartState.jsx';
import { useEffect } from 'react';
import { trackPage, syncMatomoCart } from '../utils/analytics.js';

export default function Cart() {
  const { state, dispatch } = useCart();
  const t = totals(state.items);

  useEffect(() => { trackPage('Cart'); }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">Your cart</h1>
      {state.items.length === 0 ? (
        <div className="p-6 border rounded-lg bg-white">Your cart is empty. <Link className="text-brand-700" to="/products">Browse products</Link>.</div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {state.items.map(item => (
              <div key={item.id+item.variant} className="flex items-center justify-between border rounded-lg bg-white p-4">
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-600">Variant: {item.variant}</div>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={e=>{
                      const qty = +e.target.value;
                      dispatch({type:'SET_QTY', id:item.id, variant:item.variant, qty});
                      const nextItems = state.items.map(i => i.id === item.id && i.variant === item.variant ? { ...i, qty } : i);
                      syncMatomoCart(nextItems);
                    }}
                    className="input w-20"
                  />
                  <div className="w-24 text-right font-semibold">${(item.price*item.qty).toFixed(2)}</div>
                  <button
                    className="text-red-600"
                    onClick={()=>{
                      dispatch({type:'REMOVE', id:item.id, variant:item.variant});
                      const nextItems = state.items.filter(i => !(i.id === item.id && i.variant === item.variant));
                      syncMatomoCart(nextItems);
                    }}
                  >Remove</button>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="border rounded-lg bg-white p-4">
              <div className="flex justify-between py-1"><span>Subtotal</span><span>${t.subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between py-1"><span>Shipping</span><span>${t.shipping.toFixed(2)}</span></div>
              <div className="flex justify-between py-1"><span>Tax</span><span>${t.tax.toFixed(2)}</span></div>
              <div className="flex justify-between py-2 border-t mt-2 font-semibold"><span>Total</span><span>${t.total.toFixed(2)}</span></div>
              <Link to="/checkout" className="btn-primary w-full mt-3 text-center">Checkout</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
