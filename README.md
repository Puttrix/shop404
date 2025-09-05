# MockShop — Mock Ecommerce + Donation Site

A modern, pretty demo site for testing analytics and experimentation implementations:
- Matomo / Matomo Tag Manager
- Google Tag Manager (GTM) / GA4
- Optimizely Web Experimentation
- Optimizely Data Platform (ODP)

Built with Vite + React + Tailwind. Includes a full ecommerce flow (listings, product detail, cart, checkout, confirmation) and a multi-step SPA donation wizard.

## Features
- Products grid, product details, cart, checkout, and order confirmation
- Donation flow with steps: amount → details → payment → review → success
  - Monthly vs one‑time UX nudge; optional persistent monthly default (per device)
  - Client-side validation and `donation_step` error tracking
- Analytics helpers push to `dataLayer` (GTM/GA4) and Matomo `_mtm`
  - GA4 ecommerce basics with category hierarchy (`item_category...item_category5`)
  - List context on impressions (`item_list_name`, `item_list_id`, `index`)
  - Currency on cart/checkout; purchase includes optional tax/shipping
- Consent banner with categories (analytics, marketing, experimentation) controlling tag behavior via Consent Mode (GTM always loads)
- Runtime config via `/config.json` generated from container env vars

## Local Development

Prereqs: Node 18+.

- Install: `npm install`
- Dev: `npm run dev` → http://localhost:5173
- Build: `npm run build`
- Preview: `npm run preview`

Notes for dev:
- In dev, `/config.json` is served from `public/config.json`. Edit that file to set `GTM_ID`, `MATOMO_TAG_MANAGER_CONTAINER_URL`, etc. Do not commit secrets.
- In production (`npm start` or Docker), `/config.json` is generated from environment variables.

Environment variables for runtime config are read by the server only when running the Docker image or `npm start` with built assets. For local dev, tags won’t load unless your tools are inserted manually.

## Events & Data Layer
Key events emitted:
- `page_view`: on route changes/pages
- `view_item_list`: product list impressions, includes `item_list_name`, `item_list_id`, `items[].index`
- `view_item`: product detail
- `add_to_cart`: add to cart (with `ecommerce.currency`)
- `begin_checkout`: checkout start (with `ecommerce.currency`)
- `purchase`: order confirmation (includes `transaction_id`, `value`, `currency`, optional `tax`/`shipping`)
- `donation_step`: donation wizard step with metadata

Matomo via Tag Manager can consume the same ecommerce events from `_mtm`/`dataLayer`.

## Docker
Build and run locally:

```bash
docker build -t mockshop .
docker run -p 8080:3000 \
  -e GTM_ID=GTM-XXXXXXX \
  -e MATOMO_TAG_MANAGER_CONTAINER_URL=https://matomo.example.com/js/container_ABC123.js \
  -e OPTIMIZELY_WEB_SNIPPET_URL=https://cdn.optimizely.com/js/PROJECT_ID.js \
  -e ODP_SDK_URL=https://cdn.foqt.com/v1/odp.js \
  mockshop
```

App serves at http://localhost:8080. `/config.json` reflects env settings.

## Portainer (Deploy from Git)
See `docs/PORTAINER.md` for full steps, env matrix, and troubleshooting.
Quick outline:
1. Push this repo (or your fork) to Git.
2. Portainer → Stacks → Add stack → Repository:
   - Repository URL: your Git URL
   - Compose path: `docker-compose.yml`
   - Auto-update: optional
3. Set env vars in the stack: `GTM_ID`, `MATOMO_TAG_MANAGER_CONTAINER_URL`, `OPTIMIZELY_WEB_SNIPPET_URL`, `ODP_SDK_URL`.
4. Deploy. Access at `http://YOUR-HOST:8080`. Check `/config.json` for your settings.

## Configuration Notes
- Consent Mode: The banner sets Google Consent Mode v2. Defaults are denied; updates occur on user choice. GTM always loads but respects consent.
- GTM-first: Configure GA4 (and other tags) inside GTM. No direct GA4 snippet is used in the app.
- Matomo: Use Matomo Tag Manager (MTM). Set `MATOMO_TAG_MANAGER_CONTAINER_URL` to your container script URL, e.g. `https://matomo.example.com/js/container_ABC123.js`.
- Optimizely Web: provide the snippet URL to test activation and variations.
- ODP: if you have a web SDK snippet, set `ODP_SDK_URL` and configure inside your tag manager.
 - Donation defaults: if the user opts in, the app stores `donation_default_interval=monthly` in `localStorage` to preselect monthly in future sessions.

## Structure
- `src/pages`: pages and donation wizard steps
- `src/components`: shared UI and consent banner
- `src/state`: simple cart state with localStorage persistence
- `src/utils/analytics.js`: unified event helpers and tag loader
- `server.js`: static file server and runtime config endpoint

## Roadmap & Ideas
- See `docs/ROADMAP.md` for themes, milestones, backlog, and decisions. Add ideas there as short bullets; move items across sections as work progresses.
  - For analytics specifics, see `docs/ANALYTICS.md` (Consent Mode, GTM-first, MTM-only, events).
  - For event mappings and QA steps, see `docs/ANALYTICS_PARITY.md`.
  - For GA4 ecommerce item payload examples per event, see `docs/GA4_ECOMMERCE_EXAMPLES.md`.
  - For Matomo Tag Manager ecommerce mapping (variables, triggers, tags), see `docs/MATOMO_ECOMMERCE_MAPPING.md`.
  - For Google Tag Manager setup (GA4 config, DLVs, triggers, tags), see `docs/GTM_CONTAINER.md`.
  - Importable GTM container (variables + triggers): `docs/gtm/container_mockshop.json`.

## Testing
- Run analytics payload checks: `npm run test:analytics`
  - Verifies GA4 payload structure (list context, category hierarchy, currency on cart/checkout, purchase tax/shipping) and donation error tracking.

## Debugging
- Console markers show GTM lifecycle when running locally (init start, event push, script append). Toggle with `window.__DEBUG_ANALYTICS__ = true|false`.
- See `docs/ANALYTICS.md` for event names, consent mapping, and GTM/MTM setup tips.

## Security & Privacy
This is a mock app with no real payments. Do not collect real personal data. The consent banner and tracking logic are for demonstration only.

## License
For demo/testing purposes only.
