export function isNeo() {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('style-neo');
}

export function productImage(product) {
  try {
    if (isNeo()) {
      // Use curated photo URLs (Unsplash) when Neo style is active
      const PHOTOS = [
        // 1: Hoodie
        'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
        // 2: Sneakers
        'https://images.unsplash.com/photo-1528701800489-20be3c2ea5be?auto=format&fit=crop&w=1200&q=80',
        // 3: Backpack
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1200&q=80',
        // 4: Bottle
        'https://images.unsplash.com/photo-1556306535-ab4d2e016ad4?auto=format&fit=crop&w=1200&q=80',
        // 5: Headphones
        'https://images.unsplash.com/photo-1512486130939-2c4f79935e4f?auto=format&fit=crop&w=1200&q=80',
      ];
      const idx = String(product.id || '').match(/(\d+)$/);
      const n = idx ? Number(idx[1]) : 1;
      const mapped = Math.max(1, Math.min(PHOTOS.length, n));
      return PHOTOS[mapped - 1];
    }
  } catch {}
  return product.image;
}

export function heroImage() {
  return isNeo() ? '/images/hero-neo.svg' : '/images/hero.svg';
}
