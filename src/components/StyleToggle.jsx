import { useEffect, useState } from 'react';

function getInitialStyle() {
  try {
    const s = localStorage.getItem('style');
    return s === 'neo' ? 'neo' : 'classic';
  } catch { return 'classic'; }
}

export default function StyleToggle({ variant = 'button' }) {
  const [style, setStyle] = useState(getInitialStyle);

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (style === 'neo') root.classList.add('style-neo');
      else root.classList.remove('style-neo');
      localStorage.setItem('style', style);
    } catch {}
  }, [style]);

  const next = style === 'neo' ? 'classic' : 'neo';
  const label = style === 'neo' ? 'Classic' : 'Neo';
  const icon = style === 'neo' ? '✨' : '🧪';

  if (variant === 'icon') {
    return (
      <button
        className="icon-btn"
        onClick={() => setStyle(next)}
        aria-label={`Style: ${style} (click to switch)`}
        title={`Style: ${style} (click to switch)`}
      >
        <span role="img" aria-hidden="true">{icon}</span>
      </button>
    );
  }
  return (
    <button
      className="btn-secondary"
      onClick={() => setStyle(next)}
      aria-label={`Style: ${style} (click to switch)`}
      title={`Style: ${style} (click to switch)`}
    >
      <span className="mr-2" role="img" aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}

