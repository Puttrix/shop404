import { useState } from 'react';
import { trackDonationStep } from '../../../utils/analytics.js';

export default function Details({ data, onNext }) {
  const [form, setForm] = useState({ name: data.name || '', email: data.email || '' });
  const [errors, setErrors] = useState({});
  function submit(e){
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Please enter a valid email.';
    setErrors(errs);
    if (Object.keys(errs).length) {
      trackDonationStep('details', { error: 'validation', fields: Object.keys(errs) });
      return;
    }
    onNext(form, '/donate/payment');
  }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input className={`input mt-1 ${errors.name?'ring-2 ring-red-500':''}`} value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
          {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input className={`input mt-1 ${errors.email?'ring-2 ring-red-500':''}`} type="email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
          {errors.email && <div className="text-xs text-red-600 mt-1">{errors.email}</div>}
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-gray-600">Donating <span className="font-medium">${data.amount}</span> ({data.interval})</div>
        <button className="btn-primary">Continue</button>
      </div>
    </form>
  );
}
