import { useState } from 'react';
import { trackDonationStep } from '../../../utils/analytics.js';

export default function Payment({ data, onNext }) {
  const [method, setMethod] = useState(data.method || 'card');
  const [error, setError] = useState('');
  function submit(e){
    e.preventDefault();
    if (!method) {
      setError('Please choose a payment method.');
      trackDonationStep('payment', { error: 'no_method' });
      return;
    }
    onNext({ method }, '/donate/review');
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="font-medium">Payment method</div>
      <div className="flex gap-4">
        {['card','paypal','applepay'].map(m => (
          <label key={m} className="flex items-center gap-2"><input type="radio" checked={method===m} onChange={()=>setMethod(m)} /> {m}</label>
        ))}
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex justify-between items-center">
        <div className="text-gray-600 dark:text-gray-300">Donating <span className="font-medium">${data.amount}</span> ({data.interval})</div>
        <button className="btn-primary">Continue</button>
      </div>
    </form>
  );
}
