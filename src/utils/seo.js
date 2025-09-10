export function setTitle(title) {
  try {
    const base = 'Shop404';
    const suffix = 'Shop404 — Demo Ecommerce';
    if (!title) {
      document.title = suffix;
      return;
    }
    document.title = `${title} — ${base}`;
  } catch {}
}
