// Unified analytics helpers for GTM/GA4, Matomo, ODP, Optimizely Web

function consentAllows(key) {
  const c = (typeof window !== 'undefined' && window.__consent) || { analytics: true, marketing: true, experimentation: true };
  if (key === 'analytics') return !!c.analytics;
  if (key === 'marketing') return !!c.marketing;
  if (key === 'experimentation') return !!c.experimentation;
  return true;
}

// Tag loaders driven by /config.json and consent
function ensureTagsLoaded() {
  if (ensureTagsLoaded._loaded) return;
  ensureTagsLoaded._loaded = true;

  const cfg = window.__CONFIG__ || {};

  document.addEventListener('consent:updated', () => {
    // On consent change, we could reload tags or update tracking frameworks as needed.
  });

  // GTM (GTM-first): load regardless of consent; Consent Mode governs behavior
  if (cfg.GTM_ID) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    const s = document.createElement('script');
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtm.js?id=${cfg.GTM_ID}`;
    document.head.appendChild(s);
    // Add noscript iframe
    const ns = document.createElement('noscript');
    ns.innerHTML = `<iframe src="https://www.googletagmanager.com/ns.html?id=${cfg.GTM_ID}" height="0" width="0" style="display:none;visibility:hidden"></iframe>`;
    document.body.appendChild(ns);
  }

  // GA4 direct removed for GTM-first approach

  // Matomo Tag Manager preferred; fallback to direct tracker if no MTM config
  if (cfg.MATOMO_TAG_MANAGER_CONTAINER_URL && consentAllows('analytics')) {
    window._mtm = window._mtm || [];
    window._mtm.push({ 'mtm.startTime': new Date().getTime(), event: 'mtm.Start' });
    const d = document, g = d.createElement('script'), s = d.getElementsByTagName('script')[0];
    g.async = true; g.src = cfg.MATOMO_TAG_MANAGER_CONTAINER_URL; s.parentNode.insertBefore(g, s);
  }

  // Optimizely Web snippet URL (if provided) — experimentation
  if (cfg.OPTIMIZELY_WEB_SNIPPET_URL && consentAllows('experimentation')) {
    const s = document.createElement('script');
    s.src = cfg.OPTIMIZELY_WEB_SNIPPET_URL;
    s.async = true;
    document.head.appendChild(s);
  }

  // Optimizely Data Platform (ODP) Web SDK
  if (cfg.ODP_SDK_URL && consentAllows('analytics')) {
    const s = document.createElement('script');
    s.src = cfg.ODP_SDK_URL;
    s.async = true;
    document.head.appendChild(s);
  }
}

export function trackPage(name, extra = {}) {
  ensureTagsLoaded();
  // GTM/GA4 via dataLayer
  if (consentAllows('analytics')) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'page_view', page_name: name, ...extra });
  }
  // Matomo: if using Tag Manager, push an event into _mtm
  if (consentAllows('analytics')) {
    if (window._mtm) {
      window._mtm.push({ event: 'page_view', page_name: name, ...extra });
    }
  }
}

export function trackProductImpression(product) {
  if (!consentAllows('analytics')) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: 'view_item_list',
    ecommerce: { items: [{ item_id: product.id, item_name: product.name, item_category: product.category, price: product.price }] }
  });
}

export function trackViewItem(product) {
  if (!consentAllows('analytics')) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'view_item', ecommerce: { items: [{ item_id: product.id, item_name: product.name, price: product.price }] } });
  if (window._mtm) {
    window._mtm.push({ event: 'view_item', ecommerce: { items: [{ item_id: product.id, item_name: product.name, price: product.price }] } });
  }
}

export function trackAddToCart(product, qty) {
  if (!consentAllows('analytics')) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'add_to_cart', ecommerce: { items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: qty }] } });
  if (window._mtm) {
    window._mtm.push({ event: 'add_to_cart', ecommerce: { items: [{ item_id: product.id, item_name: product.name, price: product.price, quantity: qty }] } });
  }
}

export function trackBeginCheckout(items) {
  if (!consentAllows('analytics')) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'begin_checkout', ecommerce: { items } });
  if (window._mtm) {
    window._mtm.push({ event: 'begin_checkout', ecommerce: { items } });
  }
}

export function trackPurchase(orderId, revenue, items) {
  if (!consentAllows('analytics')) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'purchase', ecommerce: { transaction_id: orderId, value: revenue, currency: 'USD', items } });
  if (window._mtm) {
    window._mtm.push({ event: 'purchase', ecommerce: { transaction_id: orderId, value: revenue, currency: 'USD', items } });
  }
}

export function trackDonationStep(step, data = {}) {
  if (!consentAllows('analytics')) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'donation_step', step, ...data });
  if (window._mtm) {
    window._mtm.push({ event: 'donation_step', step, ...data });
  }
}
