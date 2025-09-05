import React from 'react';

export default function HeroImage({ className = '' }) {
  // Prefer WebP; fall back to PNG. Respect dark/light via media queries.
  // Files expected in public/images: hero_d.webp/png and hero_l.webp/png
  return (
    <picture>
      <source srcSet="/images/hero_d.webp" type="image/webp" media="(prefers-color-scheme: dark)" />
      <source srcSet="/images/hero_l.webp" type="image/webp" media="(prefers-color-scheme: light), (prefers-color-scheme: no-preference)" />
      <source srcSet="/images/hero_d.png" media="(prefers-color-scheme: dark)" />
      <img
        src="/images/hero_l.png"
        alt="Hero"
        className={className}
        onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/images/hero.svg'; }}
      />
    </picture>
  );
}

