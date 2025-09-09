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

  // Matomo Tag Manager now loads early from index.html when configured; no loader here

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
  const url = (extra.page_location || (typeof location !== 'undefined' ? location.href : '')) || '';
  const title = (extra.page_title || (typeof document !== 'undefined' ? document.title : '') || name) || name;
  // GTM/GA4 via dataLayer
  if (consentAllows('analytics')) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: 'page_view', page_name: name, page_title: title, page_location: url, ...extra });
  }
  // Matomo: if using Tag Manager, push an event into _mtm
  if (consentAllows('analytics')) {
    if (window._mtm) {
      // Provide both generic and Matomo-friendly keys so MTM tags can map them easily
      window._mtm.push({ event: 'page_view', page_name: name, page_title: title, page_location: url, page_url: url, ...extra });
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
    // Matomo expects cart updates to reflect the FULL CART state.
    // Read current cart from localStorage and merge the just-added item to ensure accuracy
    try {
      const raw = localStorage.getItem('cart');
      const cart = raw ? JSON.parse(raw) : { items: [] };
      const map = new Map();
      // Seed from stored cart
      (cart.items || []).forEach(i => {
        const id = i.id;
        const prev = map.get(id) || { item_id: id, item_name: i.name, price: Number(i.price || 0), quantity: 0 };
        prev.quantity += Number(i.qty || 1);
        map.set(id, prev);
      });
      // Merge the currently added item in case localStorage isn't updated yet
      if (product && qty != null) {
        const id = product.id;
        const prev = map.get(id) || { item_id: id, item_name: product.name, price: Number(product.price || 0), quantity: 0 };
        prev.quantity += Number(qty || 1);
        // If name/price missing from stored cart, prefer product values
        if (!prev.item_name && product.name) prev.item_name = product.name;
        if (!prev.price && product.price != null) prev.price = Number(product.price);
        map.set(id, prev);
      }
      const fullItems = Array.from(map.values());
      window._mtm.push({ event: 'update_cart', ecommerce: { currency: 'USD', items: fullItems } });
    } catch (e) {
      // Fallback: still emit update_cart with the added item only
      window._mtm.push({ event: 'update_cart', ecommerce: { currency: 'USD', items: [itemFromProduct(product, qty)] } });
    }
  }
}

export function trackBeginCheckout(items) {
  if (!consentAllows('analytics')) return;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'begin_checkout', ecommerce: { currency: 'USD', items } });
  if (window._mtm) {
    // Ensure Matomo has full cart state at checkout
    window._mtm.push({ event: 'update_cart', ecommerce: { currency: 'USD', items } });
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

// Matomo-only convenience: push a full cart update based on current app cart state
export function syncMatomoCart(items) {
  if (!consentAllows('analytics')) return;
  if (!window._mtm) return;
  const mapped = (items || []).map(i => ({
    item_id: i.item_id || i.id,
    item_name: i.item_name || i.name,
    price: Number(i.price || 0),
    quantity: Number((i.quantity != null ? i.quantity : i.qty) || 1),
  }));
  window._mtm.push({ event: 'update_cart', ecommerce: { currency: 'USD', items: mapped } });
}

// Matomo Content Tracking helpers
export function trackContentScan(node) {
  if (!consentAllows('analytics')) return;
  try {
    window._paq = window._paq || [];
    window._paq.push(['trackContentImpressionsWithinNode', node || document]);
  } catch {}
}

export function trackContentClick({ name, piece, target }) {
  if (!consentAllows('analytics')) return;
  try {
    window._paq = window._paq || [];
    window._paq.push(['trackContentInteraction', 'click', name, piece, target]);
  } catch {}
}
