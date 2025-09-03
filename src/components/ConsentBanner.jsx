import { useEffect, useState } from 'react';

const defaultConsent = { necessary: true, analytics: false, marketing: false, experimentation: false };

function loadSaved() {
  try { return JSON.parse(localStorage.getItem('consent')) || defaultConsent; } catch { return defaultConsent; }
}

export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(defaultConsent);

  useEffect(() => {
    const saved = loadSaved();
    setConsent(saved);
    // open banner if not yet set
    if (localStorage.getItem('consent') == null) setOpen(true);
    window.__consent = saved;
  }, []);

  function persist(next) {
    localStorage.setItem('consent', JSON.stringify(next));
    window.__consent = next;
    setConsent(next);
    setOpen(false);
    // Let tag loaders know consent changed
    document.dispatchEvent(new CustomEvent('consent:updated', { detail: next }));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-3xl m-4 rounded-xl border border-gray-200 bg-white p-4 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 className="font-semibold mb-1">Cookie & Tracking Preferences</h2>
            <p className="text-sm text-gray-600 mb-3">We use cookies for analytics, marketing, and experimentation. Choose your preferences.</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked readOnly /> Necessary</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={consent.analytics} onChange={e=>setConsent({...consent, analytics:e.target.checked})}/> Analytics</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={consent.marketing} onChange={e=>setConsent({...consent, marketing:e.target.checked})}/> Marketing</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={consent.experimentation} onChange={e=>setConsent({...consent, experimentation:e.target.checked})}/> Experimentation</label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="btn-secondary" onClick={()=>persist({ ...defaultConsent, analytics:false, marketing:false, experimentation:false })}>Reject all</button>
            <button className="btn-primary" onClick={()=>persist({ ...defaultConsent, analytics:true, marketing:true, experimentation:true })}>Accept all</button>
          </div>
        </div>
      </div>
    </div>
  );
}

