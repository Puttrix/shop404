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
- `PUBLISH_PORT=8080` (host port; change if 8080 is taken, e.g., `8443` or `8081`)
- `GTM_ID=GTM-XXXXXXX` (optional but recommended)
- `MATOMO_TAG_MANAGER_CONTAINER_URL=https://matomo.example.com/js/container_ABC123.js` (optional)
- `OPTIMIZELY_WEB_SNIPPET_URL=https://cdn.optimizely.com/js/PROJECT_ID.js` (optional)
- `ODP_SDK_URL=https://cdn.foqt.com/v1/odp.js` (optional)

3) Deploy the stack
- Published port: `${PUBLISH_PORT}` (host, defaults to `8080`) → `3000` (container)
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
- `PUBLISH_PORT`: Host port published; defaults to `8080`
- `REGISTRY_IMAGE` (optional): Only if you override the default image. The provided `docker-compose.registry.yml` uses `ghcr.io/Puttrix/MockSite:latest` by default.

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
- With `MATOMO_TAG_MANAGER_CONTAINER_URL`, confirm the MTM container script loads on page start; tag firing is governed by Matomo consent (`requireConsent`) and app-emitted `cookies_*` events
- Use docs:
  - `docs/ANALYTICS_PARITY.md` for event mapping + QA checklist
  - `docs/MATOMO_ECOMMERCE_MAPPING.md` for MTM variables/tags
  - `docs/GA4_ECOMMERCE_EXAMPLES.md` for GA4 payload examples

## Common Pitfalls
- Port blocked: Ensure host port `8080` is open in firewall/security groups
 - 8080 already in use: Set `PUBLISH_PORT` to a free port (e.g., `8081`) in the Stack env vars. Access the app at `http://YOUR-HOST:${PUBLISH_PORT}`.
- Private repo: Provide Git credentials (or deploy from a mirrored public repo)
- Build fails on ARM: The Node `alpine` images support ARM64/AMD64; ensure the agent node architecture matches
- No tags firing: Check `/config.json` shows the expected envs and confirm Consent Mode is granted in the app banner (GA4) and that `cookies_*` events have fired / Matomo consent is remembered

### Pull vs Build (stack updates)
- Error: `pull access denied for mockshop ... requested access to the resource is denied`
  - Cause: The stack defines `image: mockshop:latest` but it’s built locally (not published). Using “Pull and redeploy” runs `docker compose pull`, which tries to pull from a registry and fails.
  - Fix options:
    - Preferred: Use “Update the stack” or let GitOps auto‑update redeploy the stack, which will build from source (this repo’s compose includes `pull_policy: build`).
    - Or publish to a registry (e.g., `ghcr.io/you/mockshop:TAG`), update `image:` accordingly, and then “Pull and redeploy” will work.
    - Avoid “Pull and redeploy” for stacks that build images from source and aren’t using a registry.

## Deploying From GitHub Container Registry (GHCR)
Option A — Build on Portainer (no registry)
- Use `docker-compose.yml` as Compose path (includes `build: .`).
- Set env vars as needed; click “Deploy the stack” or rely on GitOps polling/webhook.
- Use “Update the stack” to rebuild on changes (not “Pull and redeploy”).

Option B — Pull from GHCR (recommended for CI/CD)
1) Enable GitHub Actions in your repo and publish images to GHCR:
   - The repo includes `.github/workflows/publish.yml` which builds multi‑arch images and pushes to `ghcr.io/OWNER/REPO` on pushes to `main` and tags.
   - Ensure Actions has permission to write packages (default for `GITHUB_TOKEN`).
2) In Portainer, set Compose path to `docker-compose.registry.yml` and add env vars:
   - `PUBLISH_PORT=8081` (if 8080 is used)
   - Other analytics envs as needed
3) Deploy the stack. Use “Pull and redeploy” for updates (images are pulled from GHCR).

Notes
- If your GHCR namespace is private, configure Portainer’s registry credentials for `ghcr.io` with a PAT that has `read:packages`.
- You can pin to a specific tag or digest to control rollouts.
- Matomo not loading: Ensure `MATOMO_TAG_MANAGER_CONTAINER_URL` points to a valid container script URL
- GTM not loading: Ensure `GTM_ID` is set and DNS allows `googletagmanager.com`
- Env changes not reflected: You might be viewing a cached SPA; hard-refresh or clear cache, and confirm stack updated successfully

## Screenshots (placeholders)
- Stack form — repository and compose path: `docs/images/portainer_stack_repo.png`
- Stack env vars section: `docs/images/portainer_stack_env.png`
- Stack details — ports and logs: `docs/images/portainer_stack_details.png`

Add screenshots to the paths above if you want them rendered in the repo.

## Auto-Update From Git (Recommended)
Two options: polling or webhook.

Polling
- In the Stack form, enable “Auto update” and choose a schedule. Portainer will pull the repo and redeploy on changes.

Webhook
- In Portainer: Stacks → your stack → Webhooks → Create.
- Copy the webhook URL.
- In GitHub: Settings → Webhooks → Add webhook:
  - Payload URL: the Portainer webhook URL
  - Content type: `application/json`
  - Secret: set a random token (optional)
  - Which events: Just the push event
- On push to the selected branch, Portainer redeploys the stack.

Notes
- If build cache issues arise, toggle “Re-pull image” or add a cache-busting arg.
- For private repos over SSH, add a Portainer Git credential or deploy from a mirror.
