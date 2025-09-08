import { useEffect, useState } from 'react';

const defaultConsent = { necessary: true, functional: false, analytics: false, marketing: false, experimentation: false };

function loadSaved() {
  try { return JSON.parse(localStorage.getItem('consent')) || defaultConsent; } catch { return defaultConsent; }
}

export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [consent, setConsent] = useState(defaultConsent);

  function pushMtmConsentEvents(c) {
    try {
      if (!window._mtm) return;
      // Always reflect current snapshot
      const events = [];
      if (c.necessary) events.push('cookies_necessary');
      if (c.functional) events.push('cookies_functional');
      if (c.analytics) events.push('cookies_statistical');
      if (c.marketing) events.push('cookies_marketing');
      events.forEach(ev => window._mtm.push({ event: ev }));
      // Optional: consolidated payload for debugging/conditions
      window._mtm.push({ event: 'cookies_update', consent: c });
    } catch {}
  }

  function pushGtmConsentEvents(c) {
    try {
      window.dataLayer = window.dataLayer || [];
      const events = [];
      if (c.necessary) events.push('cookies_necessary');
      if (c.functional) events.push('cookies_functional');
      if (c.analytics) events.push('cookies_statistical');
      if (c.marketing) events.push('cookies_marketing');
      events.forEach(ev => window.dataLayer.push({ event: ev }));
      // Consolidated snapshot for GTM variables/conditions
      window.dataLayer.push({ event: 'cookies_update', consent: c });
    } catch {}
  }

  function pushRevokedMtm(prev, next) {
    try {
      if (!window._mtm) return;
      if (prev.functional && !next.functional) window._mtm.push({ event: 'cookies_revoked_functional' });
      if (prev.analytics && !next.analytics) window._mtm.push({ event: 'cookies_revoked_statistical' });
      if (prev.marketing && !next.marketing) window._mtm.push({ event: 'cookies_revoked_marketing' });
    } catch {}
  }

  function pushRevokedGtm(prev, next) {
    try {
      window.dataLayer = window.dataLayer || [];
      if (prev.functional && !next.functional) window.dataLayer.push({ event: 'cookies_revoked_functional' });
      if (prev.analytics && !next.analytics) window.dataLayer.push({ event: 'cookies_revoked_statistical' });
      if (prev.marketing && !next.marketing) window.dataLayer.push({ event: 'cookies_revoked_marketing' });
    } catch {}
  }

  function updatePaqConsent(c) {
    try {
      if (!window._paq) return;
      const granted = !!(c.functional || c.analytics || c.marketing || c.experimentation);
      if (granted) window._paq.push(['rememberConsentGiven']);
      else window._paq.push(['forgetConsentGiven']);
    } catch {}
  }

  useEffect(() => {
    const saved = loadSaved();
    setConsent(saved);
    // open banner if not yet set
    if (localStorage.getItem('consent') == null) setOpen(true);
    window.__consent = saved;
    // Emit Matomo consent events for the current state
    pushMtmConsentEvents(saved);
    // Emit GTM consent events for the current state
    pushGtmConsentEvents(saved);
    // Update Matomo tracker consent state
    updatePaqConsent(saved);
    // Apply saved consent to Google Consent Mode on load
    try {
      const map = {
        ad_storage: saved.marketing ? 'granted' : 'denied',
        analytics_storage: saved.analytics ? 'granted' : 'denied',
        ad_user_data: saved.marketing ? 'granted' : 'denied',
        ad_personalization: saved.marketing ? 'granted' : 'denied'
      };
      window.gtag && window.gtag('consent', 'update', map);
    } catch {}
  }, []);

  function persist(next) {
    const prev = consent || defaultConsent;
    localStorage.setItem('consent', JSON.stringify(next));
    window.__consent = next;
    setConsent(next);
    setOpen(false);
    // Emit Matomo consent events on change
    pushMtmConsentEvents(next);
    // Emit revocation events if toggled off (MTM)
    pushRevokedMtm(prev, next);
    // Emit GTM consent events on change
    pushGtmConsentEvents(next);
    // Emit revocation events if toggled off (GTM)
    pushRevokedGtm(prev, next);
    // Update Matomo tracker consent state
    updatePaqConsent(next);
    // Let tag loaders know consent changed
    document.dispatchEvent(new CustomEvent('consent:updated', { detail: next }));
    // Update Google Consent Mode v2
    try {
      const map = {
        ad_storage: next.marketing ? 'granted' : 'denied',
        analytics_storage: next.analytics ? 'granted' : 'denied',
        ad_user_data: next.marketing ? 'granted' : 'denied',
        ad_personalization: next.marketing ? 'granted' : 'denied'
      };
      window.gtag && window.gtag('consent', 'update', map);
    } catch {}
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto max-w-3xl m-4 rounded-xl border border-gray-200 bg-white p-4 shadow-lg dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <h2 className="font-semibold mb-1">Cookie & Tracking Preferences</h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">We use cookies for analytics, marketing, and experimentation. Choose your preferences.</p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" checked readOnly /> Necessary</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={!!consent.functional} onChange={e=>setConsent({...consent, functional:e.target.checked})}/> Functional</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={consent.analytics} onChange={e=>setConsent({...consent, analytics:e.target.checked})}/> Analytics</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={consent.marketing} onChange={e=>setConsent({...consent, marketing:e.target.checked})}/> Marketing</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={consent.experimentation} onChange={e=>setConsent({...consent, experimentation:e.target.checked})}/> Experimentation</label>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="btn-secondary" onClick={()=>persist({ ...defaultConsent, functional:false, analytics:false, marketing:false, experimentation:false })}>Reject all</button>
            <button className="btn-primary" onClick={()=>persist({ ...defaultConsent, functional:true, analytics:true, marketing:true, experimentation:true })}>Accept all</button>
          </div>
        </div>
      </div>
    </div>
  );
}
