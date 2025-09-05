import React, { useEffect, useState } from 'react';

export default function HeroImage({ className = '' }) {
  const [isDark, setIsDark] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    function sync() {
      try { setIsDark(document.documentElement.classList.contains('dark')); } catch {}
    }
    // Listen to our custom theme event
    document.addEventListener('theme:updated', sync);
    // Observe class changes as a fallback
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => {
      document.removeEventListener('theme:updated', sync);
      mo.disconnect();
    };
  }, []);

  const base = isDark ? 'hero_d' : 'hero_l';
  const webp = `/images/${base}.webp`;
  const png = `/images/${base}.png`;

  return (
    <picture>
      <source srcSet={webp} type="image/webp" />
      <img
        src={png}
        alt="Hero"
        className={className}
        onError={(e)=>{ e.currentTarget.onerror=null; e.currentTarget.src='/images/hero.svg'; }}
      />
    </picture>
  );
}
