export function setTitle(title, { fallback } = {}) {
  try {
    const base = 'Shop404';
    if (!title) {
      document.title = fallback || `${base} — Demo Ecommerce`;
      return;
    }
    document.title = `${title} — ${base}`;
  } catch {}
}
