# Design Notes (UI/Theme)

This document preserves UI/UX details removed from the README. It is not required for analytics setup, but can help when tweaking the look-and-feel.

## Dark Mode
- Mode: three states — `system`, `dark`, `light`.
- Persistence: `localStorage.theme` stores the chosen state; defaults to `system`.
- Early apply: a small script in `index.html` adds/removes the `dark` class on `<html>` before paint to avoid flashes.
- React toggle: `src/components/ThemeToggle.jsx` cycles System → Dark → Light and supports `variant="button"|"icon"`.
- Tailwind: `tailwind.config.js` uses `darkMode: 'class'`.
- Common components/styles updated with `dark:` variants:
  - Cards, inputs, badges, secondary buttons, header/footer, consent banner.
  - See `src/index.css` and components/pages for `dark:` classes.

Key files:
- `index.html` (early apply script)
- `tailwind.config.js` (dark mode config)
- `src/components/ThemeToggle.jsx`
- `src/index.css` (utility classes)

## Responsive Header
- Desktop (`md+`): full nav (Home/Products/Donate), theme button, and cart button with count.
- Mobile: theme icon, cart icon with count badge, and a hamburger button.
- Mobile menu: slide-down panel with links; backdrop tap or link click closes the menu.
- Animation: 300ms ease-out with transform/opacity, disabled for users preferring reduced motion.

Key files:
- `src/components/Header.jsx` (menu state + animation)
- `src/index.css` (`.icon-btn`, `.badge-count`)

## Notes
- These UI details are separate from analytics behavior and can be changed without impacting GTM/GA4/MTM integrations.

## Style Variants
- Active style: `neo` (modern/glass/gradient). The classic toggle is currently hidden and Neo is forced on.
- Toggle component (disabled by default): `src/components/StyleToggle.jsx` can be re-enabled in `Header.jsx` if needed.
- Early apply: `index.html` forces `style-neo` on `<html>` and stores `localStorage.style = 'neo'`.
- CSS overrides live in `src/index.css` under `.style-neo` selectors:
  - Pills and gradients for buttons, glass cards with backdrop-blur, subtle hover lift, blurred header/footer.
  - Hero background adjusts when `.hero-section` wrapper is present.
- Persisted in `localStorage.style` so you can switch back easily without code changes.

### Photos in Neo Style
- When `style-neo` is active, product images switch to curated stock photos (Unsplash) via URLs in `src/utils/images.js`.
- To use your own photos, replace the `PHOTOS` array with your URLs (or host locally and point to `/images/your-photo.jpg`).
- Licensing: current URLs reference Unsplash images; attribution is recommended if you publish. Replace with your licensed assets for production.
