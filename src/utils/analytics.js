// Unified analytics helpers for GTM/GA4, Matomo, ODP, Optimizely Web

function mapCategories(product) {
  // Supports:
  // - product.category (string)
  // - product.categoryPath (array of strings, hierarchical)
  // - product.category as array (fallback)
  const path = Array.isArray(product?.categoryPath)
    ? product.categoryPath
    : (Array.isArray(product?.category) ? product.category : (product?.category ? [product.category] : []));
  const out = {};
  if (path.length > 0) {
    out.item_category = path[0];
  }
  if (path.length > 1) out.item_category2 = path[1];
  if (path.length > 2) out.item_category3 = path[2];
  if (path.length > 3) out.item_category4 = path[3];
  if (path.length > 4) out.item_category5 = path[4];
  // Provide a hierarchy array for Matomo mapping convenience
  if (path.length) out.item_category_path = path;
  return out;
}

function itemFromProduct(product, quantity) {
  const base = {
    item_id: product.id,
    item_name: product.name,
    price: product.price
  };
  if (quantity != null) base.quantity = quantity;
  return { ...base, ...mapCategories(product) };
}

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

  // GTM is initialized in index.html after config loads (GTM-first)

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

export function trackProductImpression(product, listCtx = {}) {
  if (!consentAllows('analytics')) return;
  window.dataLayer = window.dataLayer || [];
  const payload = { event: 'view_item_list', ecommerce: { items: [itemFromProduct(product)] } };
  // Optional GA4 list context: item_list_name, item_list_id, index
  if (listCtx.item_list_name) payload.ecommerce.item_list_name = listCtx.item_list_name;
  if (listCtx.item_list_id) payload.ecommerce.item_list_id = listCtx.item_list_id;
  if (typeof listCtx.index === 'number') payload.ecommerce.items[0].index = listCtx.index;
  window.dataLayer.push(payload);
}

export function trackViewItem(product) {
  if (!consentAllows('analytics')) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'view_item', ecommerce: { items: [itemFromProduct(product)] } });
  if (window._mtm) {
    window._mtm.push({ event: 'view_item', ecommerce: { items: [itemFromProduct(product)] } });
  }
}

export function trackAddToCart(product, qty) {
  if (!consentAllows('analytics')) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'add_to_cart', ecommerce: { currency: 'USD', items: [itemFromProduct(product, qty)] } });
  if (window._mtm) {
    window._mtm.push({ event: 'add_to_cart', ecommerce: { currency: 'USD', items: [itemFromProduct(product, qty)] } });
  }
}

export function trackBeginCheckout(items) {
  if (!consentAllows('analytics')) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'begin_checkout', ecommerce: { currency: 'USD', items } });
  if (window._mtm) {
    window._mtm.push({ event: 'begin_checkout', ecommerce: { currency: 'USD', items } });
  }
}

export function trackPurchase(orderId, revenue, items, meta = {}) {
  if (!consentAllows('analytics')) return;
  window.dataLayer = window.dataLayer || [];
  const ecommerce = {
    transaction_id: orderId,
    value: revenue,
    currency: meta.currency || 'USD',
    items,
  };
  if (meta.tax != null) ecommerce.tax = meta.tax;
  if (meta.shipping != null) ecommerce.shipping = meta.shipping;
  if (meta.coupon) ecommerce.coupon = meta.coupon;
  window.dataLayer.push({ event: 'purchase', ecommerce });
  if (window._mtm) {
    window._mtm.push({ event: 'purchase', ecommerce });
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
