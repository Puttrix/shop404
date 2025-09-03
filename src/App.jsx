import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Products from './pages/Products.jsx';
import ProductDetails from './pages/ProductDetails.jsx';
import Cart from './pages/Cart.jsx';
import Checkout from './pages/Checkout.jsx';
import OrderConfirmation from './pages/OrderConfirmation.jsx';
import Donate from './pages/donate/Donate.jsx';
import ConsentBanner from './components/ConsentBanner.jsx';
import { CartProvider } from './state/cartState.jsx';

export default function App() {
  return (
    <CartProvider>
      <div className="min-h-full flex flex-col">
        <Header />
        <ConsentBanner />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/donate/*" element={<Donate />} />
            <Route path="*" element={<div className='p-8'>Not Found</div>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CartProvider>
  );
}
