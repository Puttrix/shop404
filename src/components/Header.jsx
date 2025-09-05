import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from '../state/cartState.jsx';
import ThemeToggle from './ThemeToggle.jsx';

export default function Header() {
  const { state } = useCart();
  const count = state.items.reduce((s,i)=>s+i.qty,0);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // for animation
  function openMenu(){
    if (menuVisible) return;
    setMenuVisible(true);
    // allow render, then animate in
    requestAnimationFrame(() => setMenuOpen(true));
  }
  function closeMenu(){
    if (!menuVisible) return;
    setMenuOpen(false);
    setTimeout(() => setMenuVisible(false), 300); // match transition duration
  }
  function toggleMenu(){ menuVisible ? closeMenu() : openMenu(); }
  function close(){ closeMenu(); }
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
            aria-expanded={menuVisible && menuOpen}
            aria-controls="mobile-menu"
            onClick={toggleMenu}
          >
            {/* Hamburger icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
      </div>
      {/* Mobile menu panel */}
      {menuVisible && (
        <div>
          <div className={`md:hidden absolute inset-x-0 top-16 z-40 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow transform transition-all duration-300 ease-out motion-reduce:transition-none ${menuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
            <nav id="mobile-menu" className="px-4 py-3 space-y-2">
              <NavLink to="/" onClick={close} className={({isActive})=>`block px-2 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 ${isActive?'text-brand-700 dark:text-brand-300':''}`}>Home</NavLink>
              <NavLink to="/products" onClick={close} className={({isActive})=>`block px-2 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 ${isActive?'text-brand-700 dark:text-brand-300':''}`}>Products</NavLink>
              <NavLink to="/donate" onClick={close} className={({isActive})=>`block px-2 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700 ${isActive?'text-brand-700 dark:text-brand-300':''}`}>Donate</NavLink>
              <Link to="/cart" onClick={close} className="block px-2 py-2 rounded hover:bg-gray-50 dark:hover:bg-gray-700">🛒 Cart ({count})</Link>
            </nav>
          </div>
          {/* Backdrop */}
          <div className={`md:hidden fixed inset-0 z-30 bg-black/30 transition-opacity duration-300 motion-reduce:transition-none ${menuOpen ? 'opacity-100' : 'opacity-0'}`} onClick={close} />
        </div>
      )}
    </header>
  );
}
