import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { trackPage, trackPurchase } from '../../../utils/analytics.js';
import { setTitle } from '../../../utils/seo.js';

export default function Success({ data }) {
  const donation = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('lastDonation')); } catch { return null; }
  }, []);

  useEffect(() => {
    setTitle('Donate · Success');
    trackPage('Donation success');
    if (donation && donation.donationId && donation.amount != null) {
      try {
        const items = [
          { item_id: 'donation', item_name: `Donation (${donation.interval || 'one-time'})`, price: Number(donation.amount || 0), quantity: 1 }
        ];
        // Use purchase to unify donation completion with ecommerce reporting
        trackPurchase(donation.donationId, Number(donation.amount || 0), items, { currency: 'USD' });
      } catch {}
    }
  }, [donation]);

  if (!donation) return <div className="p-4">No recent donation.</div>;
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Thank you for your donation!</h2>
      <p>Your donation <span className="font-mono">{donation.donationId}</span> was received.</p>
      <Link to="/" className="btn-primary inline-flex">Back to home</Link>
    </div>
  );
}
