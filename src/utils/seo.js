export function setTitle(title) {
  try {
    const base = 'MockShop';
    const suffix = 'MockShop — Demo Ecommerce';
    if (!title) {
      document.title = suffix;
      return;
    }
    document.title = `${title} — ${base}`;
  } catch {}
}

