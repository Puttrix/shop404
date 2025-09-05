# Portainer — Deploy From Git (Stack)

This guide shows how to deploy MockShop on Portainer using “Stacks → Add stack → Repository”, configure runtime analytics env vars, and troubleshoot common issues.

## Prerequisites
- Portainer with an agent on a Docker host (CE or BE)
- Git repo URL for your fork of this project
- Outbound network allowed for `docker build` base images and for your analytics tags (GTM/Matomo/CDNs)

## Quick Start (Repository Stack)
1) In Portainer: Stacks → Add stack → Repository
- Repository URL: your Git URL (HTTPS or SSH)
- Compose path: `docker-compose.yml`
- Git credentials: set if repo is private
- Auto-update: optional (polling or webhooks)

2) Environment variables (in the Stack form)
- `PORT=3000` (internal app port)
- `GTM_ID=GTM-XXXXXXX` (optional but recommended)
- `MATOMO_TAG_MANAGER_CONTAINER_URL=https://matomo.example.com/js/container_ABC123.js` (optional)
- `OPTIMIZELY_WEB_SNIPPET_URL=https://cdn.optimizely.com/js/PROJECT_ID.js` (optional)
- `ODP_SDK_URL=https://cdn.foqt.com/v1/odp.js` (optional)

3) Deploy the stack
- Published port: `8080` (host) → `3000` (container) as defined in `docker-compose.yml`
- Open `http://YOUR-HOST:8080`
- Verify `http://YOUR-HOST:8080/config.json` reflects your env vars

## Environment Matrix
- `GTM_ID`: String (e.g., `GTM-ABC123`)
  - GTM-first pattern: place GA4 and other tags in GTM
- `GA4_ID`: String (not required; GA4 is managed inside GTM)
- `MATOMO_TAG_MANAGER_CONTAINER_URL`: Full URL to MTM container script
- `OPTIMIZELY_WEB_SNIPPET_URL`: Full snippet URL (if testing experiments)
- `ODP_SDK_URL`: ODP web SDK URL (if applicable)
- `PORT`: Internal app port; defaults to `3000`

Notes:
- The server exposes these at `/config.json` for the SPA to initialize tag loaders.
- In dev (`npm run dev`), edit `public/config.json` instead; Docker/Prod reads from env only.

## Update Flow (Changing Env Vars)
- Portainer → Stacks → your stack → Editor
- Change env var values; click “Update the stack”
- Container restarts; refresh app
- Confirm `/config.json` shows updated values

## Verifying Analytics
- With `GTM_ID` set, check Network tab for `gtm.js` and GTM Preview mode
- With `MATOMO_TAG_MANAGER_CONTAINER_URL`, confirm the MTM container script loads after analytics consent
- Use docs:
  - `docs/ANALYTICS_PARITY.md` for event mapping + QA checklist
  - `docs/MATOMO_ECOMMERCE_MAPPING.md` for MTM variables/tags
  - `docs/GA4_ECOMMERCE_EXAMPLES.md` for GA4 payload examples

## Common Pitfalls
- Port blocked: Ensure host port `8080` is open in firewall/security groups
- Private repo: Provide Git credentials (or deploy from a mirrored public repo)
- Build fails on ARM: The Node `alpine` images support ARM64/AMD64; ensure the agent node architecture matches
- No tags firing: Check `/config.json` shows the expected envs and confirm Consent Mode is granted in the app banner
- Matomo not loading: Ensure `MATOMO_TAG_MANAGER_CONTAINER_URL` points to a valid container script URL
- GTM not loading: Ensure `GTM_ID` is set and DNS allows `googletagmanager.com`
- Env changes not reflected: You might be viewing a cached SPA; hard-refresh or clear cache, and confirm stack updated successfully

## Screenshots (placeholders)
- Stack form — repository and compose path: `docs/images/portainer_stack_repo.png`
- Stack env vars section: `docs/images/portainer_stack_env.png`
- Stack details — ports and logs: `docs/images/portainer_stack_details.png`

Add screenshots to the paths above if you want them rendered in the repo.
