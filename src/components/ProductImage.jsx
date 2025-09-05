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
  const slug = slugify(name);
  const rawLower = name.toLowerCase();
  const candidates = [slug, rawLower, name];
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

  // We still offer the preferred WebP via <source> for the primary slug
  const preferredBase = `/images/product_photos/${slug}`;

  return (
    <picture>
      <source srcSet={`${preferredBase}.webp`} type="image/webp" />
      <img
        src={srcFor(0, 1)}
        data-i="0"
        data-j="1" /* start at jpg, source tag already tried webp */
        alt={product?.name || 'Product image'}
        className={className}
        onError={onError}
        loading="lazy"
      />
    </picture>
  );
}
