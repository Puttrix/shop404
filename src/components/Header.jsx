import { Link, NavLink } from 'react-router-dom';
import { useState } from 'react';
import { useCart } from '../state/cartState.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Header() {
  const { state } = useCart();
  const count = state.items.reduce((s,i)=>s+i.qty,0);
  const [open, setOpen] = useState(false);
  function close(){ setOpen(false); }
  return (
    <header className="bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700 sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2" onClick={close}>
            <span className="inline-block h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700" />
            <span className="font-semibold">MockShop</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <NavLink to="/" onClick={close} className={({isActive})=>`hover:text-brand-700 dark:hover:text-brand-300 ${isActive?'text-brand-700 dark:text-brand-300':''}`}>Home</NavLink>
            <NavLink to="/products" onClick={close} className={({isActive})=>`hover:text-brand-700 dark:hover:text-brand-300 ${isActive?'text-brand-700 dark:text-brand-300':''}`}>Products</NavLink>
            <NavLink to="/donate" onClick={close} className={({isActive})=>`hover:text-brand-700 dark:hover:text-brand-300 ${isActive?'text-brand-700 dark:text-brand-300':''}`}>Donate</NavLink>
          </nav>
        </div>
        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link to="/cart" className="btn-secondary" onClick={close}><span className="mr-2">🛒</span> Cart ({count})</Link>
        </div>
        {/* Mobile actions */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle variant="icon" />
          <Link to="/cart" className="relative icon-btn" onClick={close} aria-label="Cart">
            <span role="img" aria-hidden="true">🛒</span>
            <span className="badge-count" aria-hidden="true">{count}</span>
            <span className="sr-only">Cart ({count})</span>
          </Link>
          <button
            className="icon-btn"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={()=>setOpen(v=>!v)}
          >
            {/* Hamburger icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu panel */}
      {open && (
        <div>
          <div className="md:hidden absolute inset-x-0 top-16 z-40 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow">
            <nav id="mobile-menu" className="px-4 py-3 space-y-2">
              <NavLink to="/" onClick={close} className={({isActive})=>`block px-2 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 ${isActive?'text-brand-700 dark:text-brand-300':''}`}>Home</NavLink>
              <NavLink to="/products" onClick={close} className={({isActive})=>`block px-2 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 ${isActive?'text-brand-700 dark:text-brand-300':''}`}>Products</NavLink>
              <NavLink to="/donate" onClick={close} className={({isActive})=>`block px-2 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 ${isActive?'text-brand-700 dark:text-brand-300':''}`}>Donate</NavLink>
              <Link to="/cart" onClick={close} className="block px-2 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">🛒 Cart ({count})</Link>
            </nav>
          </div>
          {/* Backdrop */}
          <div className="md:hidden fixed inset-0 z-30 bg-black/30" onClick={close} />
        </div>
      )}
    </header>
  );
}
