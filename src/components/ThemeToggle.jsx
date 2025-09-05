import { useEffect, useMemo, useState } from 'react';

const THEMES = ['system','dark','light'];

function getInitialTheme() {
  try {
    const pref = localStorage.getItem('theme');
    if (pref === 'dark' || pref === 'light' || pref === 'system') return pref;
    return 'system';
  } catch { return 'system'; }
}

function applyTheme(theme) {
  try {
    const root = document.documentElement;
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    const wantDark = theme === 'dark' || (theme === 'system' && mq && mq.matches);
    if (wantDark) root.classList.add('dark'); else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  } catch {}
}

export default function ThemeToggle({ variant = 'button' }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    applyTheme(theme);
    try {
      document.dispatchEvent(new CustomEvent('theme:updated', { detail: { theme } }));
    } catch {}
    // If following system, attach a listener
    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    function onChange(e) {
      const pref = localStorage.getItem('theme');
      if (pref === 'system') applyTheme('system');
    }
    if (theme === 'system' && mq && mq.addEventListener) mq.addEventListener('change', onChange);
    return () => { if (mq && mq.removeEventListener) mq.removeEventListener('change', onChange); };
  }, [theme]);

  const icon = useMemo(() => theme === 'dark' ? '🌙' : theme === 'light' ? '☀️' : '🖥️', [theme]);
  const label = theme === 'dark' ? 'Dark' : theme === 'light' ? 'Light' : 'System';
  const next = useMemo(() => {
    const i = THEMES.indexOf(theme);
    return THEMES[(i + 1) % THEMES.length];
  }, [theme]);

  if (variant === 'icon') {
    return (
      <button
        className="icon-btn"
        onClick={() => setTheme(next)}
        aria-label={`Theme: ${label} (click to switch)`}
        title={`Theme: ${label} (click to switch)`}
      >
        <span role="img" aria-hidden="true">{icon}</span>
      </button>
    );
  }
  return (
    <button
      className="btn-secondary"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${label} (click to switch)`}
      title={`Theme: ${label} (click to switch)`}
    >
      <span className="mr-2" role="img" aria-hidden="true">{icon}</span>
      {label}
    </button>
  );
}
