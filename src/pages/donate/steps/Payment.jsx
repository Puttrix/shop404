import { useState } from 'react';

export default function Payment({ data, onNext }) {
  const [method, setMethod] = useState(data.method || 'card');
  function submit(e){ e.preventDefault(); onNext({ method }, '/donate/review'); }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="font-medium">Payment method</div>
      <div className="flex gap-4">
        {['card','paypal','applepay'].map(m => (
          <label key={m} className="flex items-center gap-2"><input type="radio" checked={method===m} onChange={()=>setMethod(m)} /> {m}</label>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="text-gray-600">Donating <span className="font-medium">${data.amount}</span> ({data.interval})</div>
        <button className="btn-primary">Continue</button>
      </div>
    </form>
  );
}

