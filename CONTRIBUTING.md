# Contributing to MockShop

Thanks for your interest in improving this demo project. A few quick guidelines to help you ship focused, high‑quality changes.

## Getting Started
- Prereqs: Node 18+.
- Install: `npm install`
- Dev: `npm run dev` → http://localhost:5173
- Build: `npm run build`
- Preview: `npm run preview`
- Prod server (serves dist + runtime config): `npm start`
- Dev config: edit `public/config.json` (do not commit secrets). Prod uses env vars exposed at `/config.json` by `server.js`.

## Branches & Commits
- Create a feature branch from `main`.
- Keep commits small and descriptive (optionally follow Conventional Commits, e.g., `feat: add Learn FAQ page`).
- One logical change per PR; avoid unrelated refactors.

## Pull Requests
- Keep the diff tight; include:
  - Purpose and scope
  - Before/after notes or screenshots (UI)
  - Validation steps (commands to run, pages to visit)
- Run local checks before submitting:
  - `npm run test:analytics`
  - `npm run test:matomo`
- Update docs if behavior changes (README, docs/*, ROADMAP when relevant).

## Code Style & Architecture
- Stack: Vite + React + Tailwind (utility‑first in `src/index.css`).
- Prefer small, focused components and helpers.
- Follow existing patterns; avoid adding heavy deps.
- Analytics: use `src/utils/analytics.js` helpers. Do not add direct GA4 snippet; GTM‑first remains the strategy.
- Matomo: use Tag Manager (MTM); respect consent. For content tracking, annotate blocks with `matomoTrackContent` and `data-content-*` and use `trackContentScan`/`trackContentClick`.
- Cart/state: use `src/state/cartState.jsx`; it persists to `localStorage`.

## Testing & QA
- Unit‑style scripts:
  - `npm run test:analytics` checks GA4 payload shape
  - `npm run test:matomo` checks Matomo cart `update_cart` parity
- Manual QA:
  - GTM Preview (Consent Overview) + GA4 DebugView
  - Matomo Tag Manager Preview for events, content impressions/interactions
- Images: place in `public/images/product_photos/`. Generate WebP: `npm run images:webp`.

## Consent, Privacy, and Indexing
- Do not collect real personal data. This is a demo.
- Keep no‑index in place (robots meta/header/robots.txt) unless explicitly requested.
- Consent Mode v2 is enabled; keep analytics behavior consent‑aware.

## Documentation
- If you add a feature or change behavior, update:
  - README (features, structure, usage)
  - Relevant doc(s) under `docs/`
  - `docs/ROADMAP.md` (move items across Backlog/In Progress/Done as appropriate)

## Containers & Deploy
- If you change runtime/env behavior, reflect it in `docker-compose*.yml`, `Dockerfile`, and docs (`README`, `docs/PORTAINER.md`).

## Misc
- Don’t commit secrets or private URLs. Use env vars.
- Keep changes minimal and focused. Avoid unrelated formatting churn.

Thanks for contributing!
