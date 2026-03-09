# Test Runbook — CMS Validation Pipeline

Defines the test scope, gating behaviour, and operating procedures for
Shop404's CMS validation pipeline.

---

## Test tiers

| Tier | Files | Trigger | Blocks merge? | Needs live CMS? |
|------|-------|---------|--------------|----------------|
| **Unit + contract** | `src/**/*.test.js` (excl. E2E) | Every PR + push to `main` | Yes | No |
| **Smoke E2E** | `cmsSmokeE2e.test.js` | Every PR + push to `main` | Yes (if `CMS_API_URL` set) | Yes |
| **Extended E2E** | `cmsExtendedE2e.test.js` | Nightly + release tags | Yes (nightly job) | Yes |

### Unit + contract tests (173 tests, no CMS required)

Run with `npm test`. Always fast (<1 s). These must pass on every PR.

| File | What it covers |
|------|---------------|
| `cmsContract.test.js` | DTO shapes for all `/api/content/*` responses; block alias cross-check vs BlockRegistry |
| `cmsService.test.js` | In-process cache behaviour; stale-on-error serving; static fallback payloads (P-113) |
| `reservedRoutes.test.js` | Reserved route set; phase-1 CMS route set; disjointness collision guard |
| `analytics.test.js` | `page_view` event shape on CMS pages; consent gating; Matomo parity |
| `BlockRegistry.test.js` | All registered block aliases resolve to a component |

### Smoke E2E tests (10 tests, live CMS required)

Run with `npm run test:cms-smoke`. Skipped automatically if `CMS_API_URL` is not set.

Covers:
- `GET /api/content/navigation` → 200, `{ items: [] }`
- `GET /api/content/settings` → 200, all four fields present
- `GET /api/content/page?route=X` → 200 for each phase-1 route (`/about`, `/faq`, `/terms`, `/privacy`)
- `GET /api/content/blog` → 200; `?limit=2` respects the cap
- Unknown route → 404; missing route param → 400

### Extended E2E tests (16 tests, live CMS required)

Run with `npm run test:cms-e2e`. Skipped automatically if `CMS_API_URL` is not set.

Covers everything in smoke, plus:
- **Collision guard**: each transactional reserved route (`/products`, `/cart`, `/checkout`, `/order-confirmation`, `/donate`, `/learn`, `/ab-test-lab`) returns 404 from the CMS API (no accidental content node)
- **Phase-1 page property validation**: full property set check per content type (`standardPage`, `blogOverview`)
- **Blog summary shape**: validates all fields on each item when posts exist
- **Blog slug 404**: unknown slug returns 404
- **Settings completeness**: all four settings fields are correctly typed; `footerLinks` items have `title` and `url`

---

## Running tests locally

```bash
# Unit + contract (no CMS needed)
npm test

# Smoke E2E against local CMS
CMS_API_URL=http://localhost:13802 npm run test:cms-smoke

# Extended E2E against local CMS
CMS_API_URL=http://localhost:13802 npm run test:cms-e2e

# Watch mode for unit tests during development
npm run test:watch
```

---

## CI configuration

### PR gate (`ci.yml`)

Triggers on: pull requests and pushes to `main`.

| Job | Condition | Failure blocks merge |
|-----|-----------|---------------------|
| `test` (unit + contract) | Always | Yes |
| `cms-smoke` | Only if `CMS_API_URL` Actions variable is set | Yes |

To enable CMS smoke tests on PRs: add `CMS_API_URL` as a **repository variable**
(not a secret — it's a non-sensitive staging URL):
- GitHub repo → Settings → Secrets and variables → Variables → New repository variable
- Name: `CMS_API_URL`
- Value: `https://your-staging-cms.example.com` (or `http://HOST:13802`)

### Nightly / release (`ci-nightly.yml`)

Triggers on: daily at 01:00 UTC, release tag pushes (`v*`), manual `workflow_dispatch`.

Runs `npm test` (unit + contract) followed by `npm run test:cms-e2e` (extended E2E).
Uses the same `CMS_API_URL` variable. If absent, the extended suite is skipped — the
nightly job still passes (unit tests ran cleanly).

---

## Updating the test baseline

### Adding a new CMS content type

1. Add the new content type to `ContentApiController.cs` (map its fields).
2. Add a fixture and shape tests to `cmsContract.test.js`.
3. If the type is a block, register it in `BlockRegistry.js` — the block alias
   cross-check in `cmsContract.test.js` will catch omissions.
4. Run `npm test` to verify.

### Adding a new phase-1 route

1. Add the route to `CMS_PHASE_1_ROUTES` in `reservedRoutes.js`.
2. Add it to the smoke E2E route list in `cmsSmokeE2e.test.js` (the `routes` array in the phase-1 pages suite).
3. Add a property shape assertion in `cmsExtendedE2e.test.js`.
4. Seed the content node in `ContentSeeder.cs` (or add it manually in staging).

### Changing a DTO field name or type

1. Update `ContentApiController.cs`.
2. Update the corresponding fixture in `cmsContract.test.js`.
3. Update any consumer logic tests (`cmsService.test.js`, `analytics.test.js`).
4. Run `npm test` — failures here indicate the SPA needs updating too.

### Adding a reserved route

1. Add to `RESERVED_ROUTES` or `RESERVED_PREFIXES` in `reservedRoutes.js`.
2. The collision guard tests in `reservedRoutes.test.js` will verify it automatically.
3. Add the transactional route to the collision list in `cmsExtendedE2e.test.js`
   (the `transactionalRoutes` filter) so the extended E2E verifies no CMS node exists.

---

## Gating rules summary

| Situation | Result |
|-----------|--------|
| Unit or contract test fails | PR blocked, merge prevented |
| Smoke E2E fails (`CMS_API_URL` set) | PR blocked, merge prevented |
| Smoke E2E skipped (`CMS_API_URL` absent) | PR proceeds; no block |
| Nightly extended E2E fails | Nightly job fails; team notified via GitHub Actions email; does not block PRs |
| New content type added without contract test | Fails in `cmsContract.test.js` if block alias is unregistered; otherwise no automatic failure — rely on PR review |
| Reserved route collision introduced | Fails in `reservedRoutes.test.js` — PR blocked |
