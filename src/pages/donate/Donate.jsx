import { Routes, Route, useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Amount from './steps/Amount.jsx';
import Details from './steps/Details.jsx';
import Payment from './steps/Payment.jsx';
import Review from './steps/Review.jsx';
import Success from './steps/Success.jsx';
import { trackPage, trackDonationStep } from '../../utils/analytics.js';
import { setTitle } from '../../utils/seo.js';
import { useLocation } from 'react-router-dom';

export default function Donate() {
  const [data, setData] = useState({ amount: 25, interval: 'one-time', name: '', email: '', method: 'card' });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => { setTitle('Donate'); trackPage('Donate'); }, []);
  // Optional: refine title by step
  useEffect(() => {
    const path = location.pathname || '';
    if (path.endsWith('/donate')) { setTitle('Donate'); return; }
    if (path.includes('/donate/details')) setTitle('Donate · Details');
    else if (path.includes('/donate/payment')) setTitle('Donate · Payment');
    else if (path.includes('/donate/review')) setTitle('Donate · Review');
    else if (path.includes('/donate/success')) setTitle('Donate · Success');
    else if (path.includes('/donate')) setTitle('Donate · Amount');
  }, [location.pathname]);

  function next(stepData, nextPath) {
    const merged = { ...data, ...stepData };
    setData(merged);
    trackDonationStep(nextPath.replace('/donate/',''), merged);
    navigate(nextPath);
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-300"><Link to="/">Home</Link> / Donate</div>
      <div className="border rounded-xl bg-white dark:bg-gray-800 dark:border-gray-700 p-6">
        <h1 className="text-2xl font-semibold mb-4">Support our mission</h1>
        <Routes>
          <Route index element={<Amount data={data} onNext={(d)=>next(d, '/donate/details')} />} />
          <Route path="details" element={<Details data={data} onNext={(d)=>next(d, '/donate/payment')} />} />
          <Route path="payment" element={<Payment data={data} onNext={(d)=>next(d, '/donate/review')} />} />
          <Route path="review" element={<Review data={data} onNext={(d)=>next(d, '/donate/success')} />} />
          <Route path="success" element={<Success data={data} />} />
        </Routes>
      </div>
    </div>
  );
}
