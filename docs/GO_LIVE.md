# Go-Live Checklist — CMS Phase 1

Pre-launch verification, rollback procedures, and risk register for the
Shop404 Umbraco CMS phase-1 rollout.

Related docs: [PORTAINER.md](PORTAINER.md) · [SECRETS.md](SECRETS.md) ·
[CMS_CONTENT_SCOPE.md](CMS_CONTENT_SCOPE.md) · [EDITORIAL_WORKFLOW.md](EDITORIAL_WORKFLOW.md)

---

## Go-Live Checklist

Work through each section in order. Mark each item as it is verified.
**Owner** indicates who is responsible for that step.

### 1. Infrastructure

| # | Check | Owner |
|---|-------|-------|
| 1.1 | Stack deployed with `docker-compose.full.yml` via Portainer | Ops |
| 1.2 | `COMPOSE_PROJECT_NAME` is environment-specific (e.g. `shop404-prod`) | Ops |
| 1.3 | `MSSQL_DATABASE` is environment-specific (e.g. `Shop404CmsProd`) | Ops |
| 1.4 | `MSSQL_SA_PASSWORD` is strong and stored only in Portainer stack vars | Ops |
| 1.5 | `UMBRACO_ADMIN_PASSWORD` is strong and stored only in Portainer stack vars | Ops |
| 1.6 | `CMS_API_URL` is set to the public CMS hostname reachable by the browser | Ops |
| 1.7 | `CMS_CORS_ORIGINS` is set to the production SPA origin (not a wildcard) | Ops |
| 1.8 | `CMS_PUBLISH_PORT` is not publicly exposed (behind firewall or reverse proxy) | Ops |
| 1.9 | GitHub secret `PORTAINER_WEBHOOK_URL` is set and deploy webhook is confirmed working | Ops |
| 1.10 | Both Docker images (`shop404`, `shop404-cms`) are published to GHCR on `main` | CI |

### 2. CMS Setup

| # | Check | Owner |
|---|-------|-------|
| 2.1 | Umbraco backoffice loads at `http://HOST:CMS_PUBLISH_PORT/umbraco` | CMS Admin |
| 2.2 | Admin password has been changed from any default (see [SECRETS.md](SECRETS.md)) | CMS Admin |
| 2.3 | Content tree is seeded: Home, About, FAQ, Terms, Privacy, Blog, Site Settings | CMS Admin |
| 2.4 | `shop404-editor` and `shop404-publisher` user groups are present in Users → Groups | CMS Admin |
| 2.5 | Site Settings: `headerNavigation` picker configured with the correct pages | Publisher |
| 2.6 | Site Settings: `footerText` and `footerLinks` are configured | Publisher |
| 2.7 | `/about` and `/faq` body content replaced with final editorial copy | Publisher |
| 2.8 | `/terms` reviewed and approved by two people before publish (see [EDITORIAL_WORKFLOW.md](EDITORIAL_WORKFLOW.md)) | Publisher × 2 |
| 2.9 | `/privacy` reviewed and approved by two people before publish | Publisher × 2 |
| 2.10 | All published nodes have `seoTitle` and `seoDescription` set or inheriting from Site Settings | Publisher |

### 3. SPA Verification

| # | Check | Owner |
|---|-------|-------|
| 3.1 | `http://HOST:PUBLISH_PORT/config.json` reflects correct `CMS_API_URL` | Dev |
| 3.2 | `/about`, `/faq`, `/terms`, `/privacy` render final editorial content (not seed placeholder) | Dev |
| 3.3 | `/blog` loads the blog overview page | Dev |
| 3.4 | `/api/content/navigation` returns the expected nav items | Dev |
| 3.5 | `/api/content/settings` returns configured `footerText` and `footerLinks` | Dev |
| 3.6 | Code-owned routes (`/products`, `/cart`, `/checkout`, `/donate/*`) work as expected | Dev |
| 3.7 | Consent banner loads; analytics events are gated correctly (see [ANALYTICS_PARITY.md](ANALYTICS_PARITY.md)) | Dev |
| 3.8 | GTM and/or Matomo tags fire on CMS pages (`page_view` with `cms_content_type`) | Dev |
| 3.9 | No CORS errors in browser console on CMS API calls | Dev |

### 4. Outage Fallback Smoke Test

Run this before go-live to confirm the cache/fallback layer (P-113) works:

```bash
# 1. Load /about in the browser (warms in-process cache).
# 2. Stop the CMS container.
docker compose -f docker-compose.full.yml stop shop404-cms

# 3. Reload /about — should serve from in-process cache (no visible change).
# 4. Hard-refresh or open in a new browser session.
#    /about should show the static fallback: "This page is temporarily unavailable."
# 5. Restart the CMS.
docker compose -f docker-compose.full.yml start shop404-cms
# 6. Reload /about — should return to live CMS content.
```

| # | Check | Owner |
|---|-------|-------|
| 4.1 | CMS stop: cached page serves without visible error | Dev |
| 4.2 | Cold load (new session, CMS down): `/about` shows temporary-unavailable fallback | Dev |
| 4.3 | Cold load (new session, CMS down): `/blog` shows "page not found" (expected) | Dev |
| 4.4 | CMS restart: live content restores on next page load | Dev |

---

## Rollback Paths

### A — Code rollback (bad deploy)

1. In Portainer, open the stack → **Editor** → change the image tag to the
   previous known-good tag (e.g. `ghcr.io/puttrix/shop404:sha-XXXXXX`).
2. Click **Update the stack**. Containers are replaced without data loss.
3. Alternatively, revert the Git commit and push to `main` — the CI pipeline
   rebuilds and the Portainer webhook redeploys automatically.

**Testable:** Yes — roll forward/back image tags in staging before production.

### B — CMS content rollback (bad publish)

1. Open the content node in the Umbraco backoffice.
2. **Info** tab → **History** → locate the last clean version.
3. Click **Rollback** → confirm. The node is reverted and immediately
   republished at the rolled-back version.
4. Notify the team channel with the version date restored and reason.

For legal pages (`/terms`, `/privacy`), the same two-person approval rule
applies to the rollback publish.

**Testable:** Yes — practice in staging: publish a bad version, roll back,
verify the live page reflects the restored content.

### C — Full database restore (catastrophic failure)

Use only if the Umbraco DB is corrupted or data is unrecoverable via backoffice.

1. Stop the CMS container: `docker compose -f docker-compose.full.yml stop shop404-cms`
2. Restore the SQL Server backup into the `shop404_sql_data` volume (or a new
   database) using `sqlcmd` or the SQL Server management tools.
3. Restart the stack: `docker compose -f docker-compose.full.yml up -d`

**Backup cadence:** Configure scheduled SQL Server backups via a cron job or
managed backup service. Store backups outside the Docker host.

### D — Emergency CMS disable (SPA continues serving)

If the CMS is completely unavailable and cannot be restarted quickly:

1. The SPA automatically serves from the in-process cache (P-113).
2. On cold loads, critical pages (`/about`, `/faq`, `/terms`, `/privacy`) show
   the static fallback payload from `src/services/cmsFallbacks.js`.
3. Non-critical pages (blog, unknown routes) show the standard "page not found"
   state — no action required.
4. No code change or redeploy is needed; the fallback layer is always active.

---

## Risk Register

| ID | Risk | Likelihood | Impact | Mitigation | Status |
|----|------|-----------|--------|-----------|--------|
| R-01 | CMS container crashes in production | Medium | Medium | In-process cache + static fallbacks (P-113); incident runbook in `notes.md` | Mitigated |
| R-02 | Bad content published to `/terms` or `/privacy` | Low | High | Two-person review rule enforced by process (P-116); backoffice rollback available | Mitigated |
| R-03 | DB volume collision between environments | Low | High | `COMPOSE_PROJECT_NAME` + `MSSQL_DATABASE` isolation (P-114); documented in SECRETS.md | Mitigated |
| R-04 | CORS misconfiguration blocks SPA → CMS calls | Low | High | `CMS_CORS_ORIGINS` is explicit (not wildcard); dev default is `localhost:8080` | Mitigated |
| R-05 | Analytics regression after CMS cutover | Medium | Medium | Consent parity tests (P-111); analytics guardrails planned (P-118) | Partially mitigated |
| R-06 | CMS API contract drift breaks the SPA | Low | High | Contract tests (P-110); E2E validation pipeline planned (P-117) | Partially mitigated |
| R-07 | ContentSeeder overwrites production content | Very low | High | Idempotency guard checks for existing `homePage` root before seeding (P-109) | Mitigated |
| R-08 | Umbraco admin password leaked via `.env` | Low | High | `.env` is gitignored; prod password stored only in Portainer; rotation documented (SECRETS.md) | Mitigated |
| R-09 | Reserved route collision (CMS intercepts code-owned route) | Very low | High | Collision guard tests in `reservedRoutes.test.js` run on every PR (P-115) | Mitigated |
| R-10 | OpenIddict HTTPS enforcement breaks backoffice in HTTP-only setup | Medium | Low | Dev: `DisableTransportSecurityRequirement` in `appsettings.Development.json`; prod: HTTPS required | Mitigated |

### Residual risks (partially mitigated)

**R-05 — Analytics regression:** Contract tests cover event shape; P-118
(snapshot guardrails) will add threshold-based CI failure for missing events.
Until P-118 is complete, run the analytics QA checklist in
[ANALYTICS_PARITY.md](ANALYTICS_PARITY.md) manually before each CMS deploy.

**R-06 — API contract drift:** Contract tests (P-110) validate DTO shapes.
P-117 will add route-level E2E smoke tests to the PR pipeline. Until then,
run `npm test` locally and verify key API responses manually after any CMS
schema change.

---

## Monitoring and Ownership

| Concern | Signal | Where to look | Owner |
|---------|--------|---------------|-------|
| CMS container health | Container status `healthy` / `unhealthy` | Portainer → stack → containers | Ops |
| CMS application errors | `[ERR]` log lines | Portainer → `shop404-cms` → Logs | Dev |
| SQL Server health | healthcheck passes | Portainer → `shop404-sql` → Logs | Ops |
| SPA serving CMS content | `/about` loads non-placeholder copy | Manual browser check | Publisher |
| Analytics events firing | `page_view` with `cms_content_type` in dataLayer/MTM | Browser console / tag debug | Dev |
| CORS errors | `Access-Control-Allow-Origin` in browser console | Browser DevTools → Console | Dev |

There is no automated uptime monitoring configured in phase 1. Add an external
health-check probe (e.g. UptimeRobot, Betterstack) as a follow-up.
