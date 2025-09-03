import { Link, NavLink } from 'react-router-dom';
import { useCart } from '../state/cartState.jsx';

export default function Header() {
  const { state } = useCart();
  const count = state.items.reduce((s,i)=>s+i.qty,0);
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="inline-block h-8 w-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-700" />
            <span className="font-semibold">MockShop</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <NavLink to="/" className={({isActive})=>`hover:text-brand-700 ${isActive?'text-brand-700':''}`}>Home</NavLink>
            <NavLink to="/products" className={({isActive})=>`hover:text-brand-700 ${isActive?'text-brand-700':''}`}>Products</NavLink>
            <NavLink to="/donate" className={({isActive})=>`hover:text-brand-700 ${isActive?'text-brand-700':''}`}>Donate</NavLink>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/cart" className="btn-secondary"><span className="mr-2">🛒</span> Cart ({count})</Link>
        </div>
      </div>
    </header>
  );
}
