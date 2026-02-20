# ADR-008: Container Topology for Frontend + Umbraco + SQL Server

**Status**: Accepted  
**Date**: 2026-02-20  
**Deciders**: Project team  
**Tags**: deployment, docker, infra, sqlserver

---

## Context

The new architecture introduces stateful CMS services that require database and media persistence alongside the existing frontend container.

---

## Decision

Adopt a three-service container topology:
- `shop404-frontend`
- `umbraco-cms`
- `sql-server`

With persistent volumes for Umbraco data/logs/media and environment-driven configuration for local/dev/prod.

Environment and secret rules:
- Separate DB instances/schemas per environment (`dev`, `staging`, `prod`).
- Separate media/storage volumes per environment (no shared volume across envs).
- Sensitive values (SQL connection strings, Umbraco bootstrap/admin credentials) are stored in secrets systems, not committed files.
- Local development may use `.env.local` (gitignored) for developer-scoped secrets only.

---

## Alternatives Considered

1. Keep single-container frontend only.
2. External managed DB/CMS with frontend-only repo changes.
3. Three-service topology in project deployment stack.

---

## Consequences

### Positive
- Architecture matches integration target and deployment expectations.
- Improves parity across local, CI, and Portainer stacks.

### Negative
- Higher operational and CI complexity.
- Requires secret handling and backup/recovery procedures.

### Neutral
- Frontend build/deploy remains independently releasable.

---

## Related

- `.assistant/backlog.md` (P-107, P-108)
- `.assistant/trd/shop404_Umbraco_Integration_TRD.md`
