# Secret Topology — Shop404

This document defines the secret inventory, per-environment boundaries, volume
isolation strategy, and rotation procedures for all Shop404 deployments.

---

## Secret inventory

| Secret | Required | Description | Owner |
|--------|----------|-------------|-------|
| `MSSQL_SA_PASSWORD` | Yes | SQL Server SA account password | Deployment host |
| `MSSQL_DATABASE` | No | Database name (default: `Shop404Cms`) | Deployment host |
| `UMBRACO_ADMIN_PASSWORD` | Yes | Umbraco backoffice admin password (first install only) | Deployment host |
| `UMBRACO_ADMIN_EMAIL` | No | Umbraco admin email (default: `admin@shop404.local`) | Deployment host |
| `UMBRACO_ADMIN_NAME` | No | Umbraco admin display name | Deployment host |
| `PORTAINER_WEBHOOK_URL` | No | Portainer stack redeploy webhook (CI trigger) | GitHub repository secrets |
| `GITHUB_TOKEN` | Auto | Auto-provisioned by GitHub Actions for GHCR push | GitHub Actions |

Analytics vars (`GTM_ID`, `GA4_ID`, `MATOMO_TAG_MANAGER_CONTAINER_URL`, etc.) are not
secrets — they are non-sensitive configuration values set in Portainer stack env vars or
the local `.env` file.

---

## Environment isolation model

Each environment (dev / staging / prod) must be **fully isolated** at three levels:

### 1. Docker volume isolation — `COMPOSE_PROJECT_NAME`

Docker Compose prefixes all volume and network names with the project name.
Setting a distinct `COMPOSE_PROJECT_NAME` per environment ensures volumes never overlap.

| Environment | `COMPOSE_PROJECT_NAME` | Resulting volume names |
|-------------|------------------------|------------------------|
| Dev (local) | `shop404-dev` (or unset) | `shop404-dev_sql_data`, `shop404-dev_cms_media`, … |
| Staging | `shop404-staging` | `shop404-staging_sql_data`, `shop404-staging_cms_media`, … |
| Prod | `shop404-prod` | `shop404-prod_sql_data`, `shop404-prod_cms_media`, … |

Set `COMPOSE_PROJECT_NAME` in the environment-specific `.env` file or as a Portainer
stack env var before the first `docker compose up`.

### 2. Database isolation — `MSSQL_DATABASE`

If multiple environments share a single SQL Server host (not recommended for prod), use
distinct database names so each environment's Umbraco schema is independent.

| Environment | `MSSQL_DATABASE` |
|-------------|------------------|
| Dev | `Shop404Cms` (default) |
| Staging | `Shop404CmsStaging` |
| Prod | `Shop404CmsProd` |

### 3. Network isolation

Each Compose stack creates its own bridge network (`shop404-net` prefixed by project
name). Services in different stacks cannot reach each other by service name.

---

## Per-environment secret storage

### Local dev

Secrets live in a gitignored `.env` file at the repo root:

```bash
cp .env.example .env
# Edit .env and set MSSQL_SA_PASSWORD, UMBRACO_ADMIN_PASSWORD, COMPOSE_PROJECT_NAME
```

`.env` and `.env.*` are listed in `.gitignore` and must **never be committed**.

### Staging / Prod on Portainer

Set secrets as Portainer Stack environment variables (not in the compose file).
Portainer encrypts these at rest in its database.

Required stack env vars for the full-stack compose:

```
COMPOSE_PROJECT_NAME=shop404-staging   # or shop404-prod
MSSQL_SA_PASSWORD=<strong-password>
MSSQL_DATABASE=Shop404CmsStaging       # or Shop404CmsProd
UMBRACO_ADMIN_PASSWORD=<strong-password>
UMBRACO_ADMIN_EMAIL=admin@yourdomain.com
CMS_API_URL=https://cms.yourdomain.com  # or reverse-proxy path
PUBLISH_PORT=8080
CMS_PUBLISH_PORT=13802
```

Do not set analytics vars in Portainer unless you want them active in that environment.

### GitHub Actions (CI)

| Secret name | Where to set | Purpose |
|-------------|--------------|---------|
| `PORTAINER_WEBHOOK_URL` | Repo → Settings → Secrets → Actions | Trigger stack redeploy after image push |
| `GITHUB_TOKEN` | Auto-provisioned | GHCR login — no manual setup required |

`MSSQL_SA_PASSWORD` and `UMBRACO_ADMIN_PASSWORD` are **not** needed in GitHub Actions.
The CI pipeline only builds and pushes images; it does not run the database.

---

## Secret quality requirements

| Secret | Minimum requirements |
|--------|---------------------|
| `MSSQL_SA_PASSWORD` | ≥ 8 chars, uppercase + lowercase + digit + symbol (SQL Server policy) |
| `UMBRACO_ADMIN_PASSWORD` | ≥ 10 chars, mixed case + digit + symbol |

Use a password manager or `openssl rand -base64 32` to generate values. Never reuse
passwords between environments.

---

## Rotation procedures

### Rotating `MSSQL_SA_PASSWORD`

> The SA password controls all database access. Rotate it if a host is compromised
> or a team member with access leaves.

1. Connect to the running SQL Server container:
   ```bash
   docker exec -it <project>-shop404-sql-1 \
     /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$OLD_PASSWORD" -C
   ```
2. Run the password change:
   ```sql
   ALTER LOGIN sa WITH PASSWORD = 'NewStrongPassword1!';
   GO
   ```
3. Update `.env` (dev) or Portainer stack env var (staging/prod) with the new password.
4. Restart all services so the new connection string takes effect:
   ```bash
   docker compose -f docker-compose.full.yml restart shop404-cms
   ```
5. Verify Umbraco connects successfully by checking container logs.

### Rotating `UMBRACO_ADMIN_PASSWORD`

> The `UMBRACO_ADMIN_PASSWORD` env var only applies during the **first unattended
> install**. Once Umbraco has initialised, changing this env var has no effect.

To change the admin password after first install:
1. Log in to the Umbraco backoffice (`/umbraco`) with the current credentials.
2. Go to **Users** → your admin user → **Change password**.
3. Set a new strong password and save.

If admin access is lost (password forgotten, lockout):
1. Stop the CMS container.
2. Delete the Umbraco NuCache data volume or reset via SQL:
   ```sql
   -- Reset password hash in Umbraco user table (Umbraco 14+ schema)
   -- Preferred: use Umbraco's built-in password reset flow or recreate the install.
   ```
3. Or: remove the `shop404_cms_data` volume and re-run with `InstallUnattended=true`
   and a known `UMBRACO_ADMIN_PASSWORD`. **This discards all NuCache data** — media
   and content in SQL Server are preserved.

### Rotating `PORTAINER_WEBHOOK_URL`

1. In Portainer: Stacks → your stack → Webhooks → Delete existing → Create new.
2. Copy the new webhook URL.
3. Update the `PORTAINER_WEBHOOK_URL` GitHub secret:
   Repo → Settings → Secrets → Actions → `PORTAINER_WEBHOOK_URL` → Update.

---

## CI / deployment boundary summary

```
┌─────────────────────────────────────────────────────────────┐
│ GitHub Actions (CI)                                         │
│   Secrets: GITHUB_TOKEN (auto), PORTAINER_WEBHOOK_URL       │
│   Does: build images, push to GHCR, trigger Portainer       │
│   Does NOT have: DB passwords, Umbraco credentials          │
└──────────────────────────┬──────────────────────────────────┘
                           │ webhook POST
┌──────────────────────────▼──────────────────────────────────┐
│ Portainer (deployment host)                                 │
│   Stack env vars: MSSQL_SA_PASSWORD, UMBRACO_ADMIN_PASSWORD │
│                   COMPOSE_PROJECT_NAME, MSSQL_DATABASE      │
│                   CMS_API_URL, analytics vars               │
│   Pulls images from GHCR, runs docker-compose.full.yml      │
│   Volumes isolated by COMPOSE_PROJECT_NAME per environment  │
└─────────────────────────────────────────────────────────────┘
```

---

## Checklist — new environment setup

- [ ] Choose a unique `COMPOSE_PROJECT_NAME` for this environment
- [ ] Set a unique `MSSQL_DATABASE` name
- [ ] Generate strong passwords for `MSSQL_SA_PASSWORD` and `UMBRACO_ADMIN_PASSWORD`
- [ ] Store secrets in Portainer stack env vars (never in compose files or git)
- [ ] Set `CMS_API_URL` to the public hostname/path reachable by the browser
- [ ] Set `CMS_PUBLISH_PORT` and `PUBLISH_PORT` to avoid conflicts with other stacks on the same host
- [ ] Verify `docker compose -f docker-compose.full.yml up` starts cleanly and Umbraco backoffice is reachable
- [ ] Confirm `/config.json` reflects the correct `CMS_API_URL`
- [ ] Record the admin credentials in your team password manager
