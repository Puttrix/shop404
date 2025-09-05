import React from 'react';

function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .trim();
}

export default function ProductImage({ product, className = '' }) {
  const name = String(product?.name || '').trim();
  const slug = slugify(name); // hyphenated
  const rawLower = name.toLowerCase();
  const underscore = rawLower.replace(/[^a-z0-9]+/g, '_');
  const hyphen = rawLower.replace(/[^a-z0-9]+/g, '-');
  const tight = rawLower.replace(/[^a-z0-9]+/g, '');
  const candidates = [slug, underscore, hyphen, rawLower, tight, name];
  const exts = ['webp', 'jpg', 'jpeg', 'png'];
  const fallback = product?.image || '/images/placeholder.svg';

  function srcFor(i, j) {
    if (i >= candidates.length) return fallback;
    const base = `/images/product_photos/${candidates[i]}`;
    const ext = exts[j] || 'jpg';
    return `${base}.${ext}`;
  }

  function onError(e) {
    const img = e.currentTarget;
    const i = Number(img.getAttribute('data-i') || '0');
    const j = Number(img.getAttribute('data-j') || '0');
    const nextJ = j + 1;
    if (nextJ < exts.length) {
      img.setAttribute('data-j', String(nextJ));
      img.src = srcFor(i, nextJ);
      return;
    }
    const nextI = i + 1;
    if (nextI < candidates.length) {
      img.setAttribute('data-i', String(nextI));
      img.setAttribute('data-j', '0');
      img.src = srcFor(nextI, 0);
      return;
    }
    // Final fallback (SVG placeholder or original image path)
    img.onerror = null;
    img.src = fallback;
  }

  // Try webp first for the most likely (slug) pattern, then iterate
  return (
    <img
      src={srcFor(0, 0)}
      data-i="0"
      data-j="0"
      alt={product?.name || 'Product image'}
      className={className}
      onError={onError}
      loading="lazy"
    />
  );
}
