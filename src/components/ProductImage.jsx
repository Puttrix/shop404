import React from 'react';

function slugify(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .trim();
}

export default function ProductImage({ product, className = '' }) {
  const slug = slugify(product?.name);
  const base = `/images/product_photos/${slug}`;
  const fallback = product?.image || '/images/placeholder.svg';
  // We try webp first, then jpg. If neither exists, onError swaps to fallback.
  return (
    <picture>
      <source srcSet={`${base}.webp`} type="image/webp" />
      <img
        src={`${base}.jpg`}
        alt={product?.name || 'Product image'}
        className={className}
        onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src=fallback; }}
      />
    </picture>
  );
}

