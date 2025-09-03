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
- Analytics helpers that push to `dataLayer` (GTM/GA4) and Matomo `_mtm`, plus hooks for ODP/Optimizely
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
- `view_item_list`: product list impressions
- `view_item`: product detail
- `add_to_cart`: add to cart
- `begin_checkout`: checkout start
- `purchase`: order confirmation
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
1. Push this repo to GitHub.
2. In Portainer → Stacks → Add stack → Repository, set:
   - Repository URL: your Git URL
   - Compose path: `docker-compose.yml`
   - Auto-update: optional
3. Set environment variables in the stack (GTM_ID, MATOMO_TAG_MANAGER_CONTAINER_URL, OPTIMIZELY_WEB_SNIPPET_URL, ODP_SDK_URL).
4. Deploy the stack. Port 8080 maps to the service.

You can later update env vars and redeploy to change tag configs.

## Configuration Notes
- Consent Mode: The banner sets Google Consent Mode v2. Defaults are denied; updates occur on user choice. GTM always loads but respects consent.
- GTM-first: Configure GA4 (and other tags) inside GTM. No direct GA4 snippet is used in the app.
- Matomo: Use Matomo Tag Manager (MTM). Set `MATOMO_TAG_MANAGER_CONTAINER_URL` to your container script URL, e.g. `https://matomo.example.com/js/container_ABC123.js`.
- Optimizely Web: provide the snippet URL to test activation and variations.
- ODP: if you have a web SDK snippet, set `ODP_SDK_URL` and configure inside your tag manager.

## Structure
- `src/pages`: pages and donation wizard steps
- `src/components`: shared UI and consent banner
- `src/state`: simple cart state with localStorage persistence
- `src/utils/analytics.js`: unified event helpers and tag loader
- `server.js`: static file server and runtime config endpoint

## Roadmap & Ideas
- See `docs/ROADMAP.md` for themes, milestones, backlog, and decisions. Add ideas there as short bullets; move items across sections as work progresses.
 - For analytics specifics, see `docs/ANALYTICS.md` (Consent Mode, GTM-first, MTM-only, events).

## Debugging
- Console markers show GTM lifecycle when running locally (init start, event push, script append). Toggle with `window.__DEBUG_ANALYTICS__ = true|false`.
- See `docs/ANALYTICS.md` for event names, consent mapping, and GTM/MTM setup tips.

## Security & Privacy
This is a mock app with no real payments. Do not collect real personal data. The consent banner and tracking logic are for demonstration only.

## License
For demo/testing purposes only.
