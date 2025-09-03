import { useState } from 'react';

export default function Details({ data, onNext }) {
  const [form, setForm] = useState({ name: data.name || '', email: data.email || '' });
  function submit(e){ e.preventDefault(); onNext(form, '/donate/payment'); }
  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Full name</label>
          <input className="input mt-1" required value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input className="input mt-1" type="email" required value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
        </div>
      </div>
      <div className="flex justify-between items-center">
        <div className="text-gray-600">Donating <span className="font-medium">${data.amount}</span> ({data.interval})</div>
        <button className="btn-primary">Continue</button>
      </div>
    </form>
  );
}

