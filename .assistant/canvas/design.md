# Design & Architecture Notes

## UI/UX Design

### Theme System
- **Dark Mode**: Three states — `system`, `dark`, `light`
- **Persistence**: `localStorage.theme` stores chosen state; defaults to `system`
- **Flash Prevention**: Early apply script in `index.html` adds/removes `dark` class before paint
- **Component**: `ThemeToggle.jsx` cycles System → Dark → Light with `variant="button"|"icon"`
- **Configuration**: `tailwind.config.js` uses `darkMode: 'class'`

### Style Variants
- **Active Style**: Neo (modern/glass/gradient)
- **Classic Toggle**: Currently hidden; Neo forced on by default
- **Early Apply**: `index.html` forces `style-neo` on `<html>`, persisted in `localStorage.style`
- **CSS Overrides**: Pills/gradients for buttons, glass cards with backdrop-blur, subtle hover lift, blurred header/footer

### Responsive Design
- **Desktop (`md+`)**: Full nav (Home/Products/Donate), theme button, cart button with count
- **Mobile**: Theme icon, cart icon with count badge, hamburger menu
- **Mobile Menu**: Slide-down panel with links; backdrop tap or link click closes
- **Animation**: 300ms ease-out with transform/opacity; respects `prefers-reduced-motion`

### Product Photos
- **Location**: `public/images/product_photos/`
- **Naming**: Slug of product name (e.g., `Aurora Hoodie` → `aurora-hoodie.jpg`)
- **Format Priority**: WebP preferred, falls back to JPG/PNG automatically via `<picture>` element
- **Generation**: `npm run images:webp` creates `.webp` alongside existing images
- **Hero Images**: `hero_l.png` (light) and `hero_d.png` (dark) switch live with theme toggle

## Technical Architecture

### Stack
- **Frontend**: Vite + React 18 + Tailwind CSS
- **Router**: React Router 6 (client-side SPA routing)
- **State**: Simple context-based cart state with localStorage persistence
- **Server**: Express serving static build + runtime config endpoint

### Key Patterns
- **Utility-First CSS**: Tailwind utilities in `src/index.css`
- **Small, Focused Components**: Modular UI components in `src/components/`
- **Analytics Helpers**: Centralized in `src/utils/analytics.js`
- **Runtime Configuration**: `/config.json` generated from environment variables in production

### File Structure
```
src/
  components/     # Reusable UI components
  pages/          # Route-level page components
    donate/       # Multi-step donation wizard
    learn/        # Knowledge base, FAQ, testimonials
  state/          # Cart state management
  utils/          # Analytics, images, SEO helpers
  data/           # Static data (products, KB, FAQs, testimonials)
```

### Analytics Architecture
- **Loading Order**: Consent Mode defaults → GTM load → MTM load
- **Event Flow**: User action → Helper function → Push to `dataLayer` + `_mtm`
- **Consent Gating**: Tags respect consent categories via Consent Mode v2
- **Category Hierarchy**: GA4 `item_category...item_category5` + Matomo `item_category_path`

### Deployment Patterns
- **Development**: `npm run dev` with `public/config.json`
- **Production**: `npm run build && npm start` with env vars
- **Docker**: Single-stage build with Express server
- **Portainer**: Git-based stack deployment with env matrix

## Design Decisions (Historical)

### Why GTM-First?
- Maximum flexibility for analysts without code changes
- Centralized tag management and consent orchestration
- Easier A/B testing of tracking implementations
- Standard industry pattern for enterprise analytics

### Why MTM-Only (No Direct Tracker)?
- Demonstrates tag manager parity with GTM approach
- Cleaner consent management through tag containers
- Reduces client-side script bloat
- Shows proper MTM implementation patterns

### Why No Real Backend?
- Focus remains on frontend analytics patterns
- Simpler deployment and demo setup
- Avoids PII/payment compliance complexity
- Static hosting compatible (with runtime config overlay)

### Why Block Indexing?
- Prevents demo content from appearing in search results
- Avoids confusion with real ecommerce sites
- No SEO value needed for testing/demo purposes
- Implemented via robots.txt, meta tags, and headers

## UX Enhancements

### Cart Notification
- Brief pulse animation on cart button when items added
- Visual feedback without intrusive modals
- CSS-based implementation in `src/index.css`

### Form Validation
- Client-side validation in donation wizard
- Error tracking via `donation_step` events
- Clear error messages and field highlighting

### Content Tracking
- Matomo Content Tracking on Learn section
- Automatic impressions via `trackAllContentImpressions`
- Interaction tracking on teaser/CTA clicks
- SPA-safe with `trackContentImpressionsWithinNode`
