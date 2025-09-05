import { useEffect, useState } from 'react';
import { trackDonationStep } from '../../../utils/analytics.js';

export default function Amount({ data, onNext }) {
  const presets = [10, 25, 50, 100];
  const [amount, setAmount] = useState(data.amount || 25);
  const [interval, setInterval] = useState(() => {
    try {
      const pref = localStorage.getItem('donation_default_interval');
      return pref || data.interval || 'one-time';
    } catch { return data.interval || 'one-time'; }
  });
  const [rememberMonthly, setRememberMonthly] = useState(() => {
    try { return localStorage.getItem('donation_default_interval') === 'monthly'; } catch { return false; }
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Keep checkbox in sync if stored preference changes elsewhere
    try { setRememberMonthly(localStorage.getItem('donation_default_interval') === 'monthly'); } catch {}
  }, []);

  function proceed(e) {
    if (e) e.preventDefault();
    const v = Number(amount);
    if (!Number.isFinite(v) || v < 1) {
      setError('Please enter an amount of at least $1.');
      trackDonationStep('amount', { error: 'invalid_amount', amount: amount, interval });
      return;
    }
    setError('');
    // Persist monthly default preference if applicable
    try {
      if (interval === 'monthly' && rememberMonthly) {
        localStorage.setItem('donation_default_interval', 'monthly');
        trackDonationStep('amount', { preference: 'monthly_default', enabled: true });
      } else if (rememberMonthly === false && localStorage.getItem('donation_default_interval') === 'monthly') {
        // If user unchecks while monthly is stored, clear it
        localStorage.removeItem('donation_default_interval');
        trackDonationStep('amount', { preference: 'monthly_default', enabled: false });
      }
    } catch {}
    onNext({ amount: v, interval }, '/donate/details');
  }

  function choosePreset(v) {
    setAmount(v);
  }

  function onIntervalChange(opt) {
    setInterval(opt);
    trackDonationStep('amount', { interval: opt, changed: true, amount: Number(amount) || 0 });
  }

  return (
    <form onSubmit={proceed} className="space-y-6">
      <div>
        <div className="font-medium mb-2">Choose amount</div>
        <div className="flex gap-2 flex-wrap items-center">
          {presets.map(v => (
            <button type="button" key={v} className={`btn ${amount===v?'btn-primary':'btn-secondary'}`} onClick={()=>choosePreset(v)}>${v}</button>
          ))}
          <input
            name="amount"
            placeholder="Custom"
            className="input w-28"
            type="number"
            min={1}
            step={1}
            value={amount}
            onChange={e=>setAmount(e.target.value)}
          />
        </div>
        {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
      </div>
      <div>
        <div className="font-medium mb-2">Frequency</div>
        <div className="flex gap-4 items-center">
          {['one-time','monthly','yearly'].map(opt => (
            <label key={opt} className="flex items-center gap-2"><input type="radio" name="interval" checked={interval===opt} onChange={()=>onIntervalChange(opt)} /> {opt}</label>
          ))}
        </div>
        {interval==='monthly' && (
          <div className="mt-2 space-y-1">
            <div className="text-sm text-brand-700">Tip: Monthly gifts sustain long‑term impact. You can edit/cancel anytime.</div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!rememberMonthly} onChange={e=>{
                const on = e.target.checked; setRememberMonthly(on);
                trackDonationStep('amount', { preference: 'monthly_default', enabled: on });
              }} />
              Make monthly my default on this device
            </label>
            {rememberMonthly && (
              <div className="text-xs text-gray-600 space-x-2">
                <span>
                  Monthly is your default on this device.
                </span>
                <button type="button" className="underline text-brand-700" onClick={()=>{
                  setInterval('one-time');
                  trackDonationStep('amount', { interval: 'one-time', source: 'notice_change' });
                }}>Switch to one‑time for this donation</button>
                <button type="button" className="underline text-gray-700" onClick={()=>{
                  try { localStorage.removeItem('donation_default_interval'); } catch {}
                  setRememberMonthly(false);
                  trackDonationStep('amount', { preference: 'monthly_default', enabled: false, source: 'clear_link' });
                }}>Clear monthly default</button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button className="btn-primary">Continue</button>
      </div>
    </form>
  );
}
