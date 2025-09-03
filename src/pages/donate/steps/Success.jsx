import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { trackPage } from '../../../utils/analytics.js';

export default function Success({ data }) {
  const donation = useMemo(() => {
    try { return JSON.parse(sessionStorage.getItem('lastDonation')); } catch { return null; }
  }, []);

  useEffect(() => { trackPage('Donation success'); }, []);

  if (!donation) return <div className="p-4">No recent donation.</div>;
  return (
    <div className="space-y-3">
      <h2 className="text-xl font-semibold">Thank you for your donation!</h2>
      <p>Your donation <span className="font-mono">{donation.donationId}</span> was received.</p>
      <Link to="/" className="btn-primary inline-flex">Back to home</Link>
    </div>
  );
}

