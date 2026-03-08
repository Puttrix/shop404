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
import LearnLayout from './pages/learn/Learn.jsx';
import FAQPage from './pages/learn/FAQ.jsx';
import TestimonialsPage from './pages/learn/Testimonials.jsx';
import { ArticlesList, ArticleDetail } from './pages/learn/Articles.jsx';
import ABTestLab from './pages/ABTestLab.jsx';
import CmsPage from './pages/CmsPage.jsx';
import ConsentBanner from './components/ConsentBanner.jsx';
import { CartProvider } from './state/cartState.jsx';
import { CmsSettingsProvider } from './state/cmsSettingsContext.jsx';

export default function App() {
  return (
    <CmsSettingsProvider>
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
            <Route path="/learn" element={<LearnLayout />} />
            <Route path="/learn/articles" element={<ArticlesList />} />
            <Route path="/learn/articles/:slug" element={<ArticleDetail />} />
            <Route path="/learn/faq" element={<FAQPage />} />
            <Route path="/learn/testimonials" element={<TestimonialsPage />} />
            <Route path="/ab-test-lab" element={<ABTestLab />} />
            {/* CMS catch-all: tries Umbraco content lookup, falls back to 404.
                Route order guarantees all code-owned routes above match first.
                See src/config/reservedRoutes.js for the full reserved set. */}
            <Route path="*" element={<CmsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CartProvider>
    </CmsSettingsProvider>
  );
}
