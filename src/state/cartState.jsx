import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

const CartContext = createContext(null);

const initial = () => {
  try {
    const raw = localStorage.getItem('cart');
    return raw ? JSON.parse(raw) : { items: [], coupon: null };
  } catch {
    return { items: [], coupon: null };
  }
};

function reducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const existing = state.items.find(i => i.id === action.item.id && i.variant === action.item.variant);
      let items;
      if (existing) {
        items = state.items.map(i => i === existing ? { ...i, qty: i.qty + action.item.qty } : i);
      } else {
        items = [...state.items, action.item];
      }
      return { ...state, items };
    }
    case 'REMOVE': {
      return { ...state, items: state.items.filter(i => !(i.id === action.id && i.variant === action.variant)) };
    }
    case 'SET_QTY': {
      return {
        ...state,
        items: state.items.map(i => i.id === action.id && i.variant === action.variant ? { ...i, qty: action.qty } : i)
      };
    }
    case 'CLEAR': return { items: [], coupon: null };
    case 'COUPON': return { ...state, coupon: action.code };
    default: return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initial);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(state));
  }, [state]);

  const value = useMemo(() => ({ state, dispatch }), [state]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

export function totals(items) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const shipping = subtotal > 100 ? 0 : 8;
  const tax = +(subtotal * 0.2).toFixed(2);
  const total = +(subtotal + shipping + tax).toFixed(2);
  return { subtotal, shipping, tax, total };
}
