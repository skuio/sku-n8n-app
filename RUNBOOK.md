# RUNBOOK — n8n-nodes-sku-io

Operational runbook for building, verifying, and releasing the SKU.io n8n community node. The README covers users/developers; this file covers ops.

## Ownership

- **Platform account:** `dev@sku.io` (n8n, npm, GitHub org contexts as applicable).
- **Credentials:** stored in the 1Password `sku` vault. Never in this repo, never in `.env` committed anywhere (`.secrets/` and `.env` are gitignored).
- **npm publisher:** TBD — creation of the npm account/token is gated by Kalvin.

## STOP-gates (explicit go-ahead from Kalvin required)

Do NOT do any of the following without an explicit go-ahead:

1. Creating the GitHub repository (`skuio/sku-n8n-app`).
2. **Every** npm publish — no exceptions, including patch releases.
3. Making the repository public.
4. Submitting the package for n8n verified-node review via the Creator Portal.
5. Running tests or live verification against **production** tenants.

## Release path

- **v1 — community node on npm.** Works on self-hosted n8n via Settings → Community Nodes. This is the initial release target.
- **Fast-follow — verified node** (required to reach n8n Cloud users). Requirements:
  - PUBLIC GitHub repository
  - MIT license
  - Publish via GitHub Actions with **npm provenance + trusted publishers** (OIDC — no long-lived npm tokens)
  - **Zero runtime dependencies** (enforced by `test/package-invariants.test.mjs`)
  - `npm run lint` clean (eslint-plugin-n8n-nodes-base community/credentials/nodes rulesets)
  - Submit via the [n8n Creator Portal](https://creators.n8n.io)

Note: CI (`.github/workflows/ci.yml`) intentionally has **no publish job** — publishing is a gated manual action per the STOP-gates above.

## Backend contract verification log

| Date | Check | Result |
|---|---|---|
| 2026-07-09 | OAuth token endpoint RFC 6749 error contract | Verified local |
| 2026-07-09 | 10 registry events + invariants tests | Verified green (77 tests) |
| 2026-07-09 | `/v2/stores` scope gate (`settings:read`) | Added on sku branch SKU-8142, pending deploy |

Append a row every time a backend contract assumption is (re-)verified or a backend change lands that this package depends on.

## Live-verification checklist

Run before any release:

1. **Tunnel/dev OAuth first** — confirm the backend release is deployed (check the contract log above; anything "pending deploy" blocks live verification), then complete a full OAuth connect against a dev/tunnel tenant.
2. **One real connection** — n8n Cloud or a publicly reachable self-hosted instance, full connect → trigger activation → action round-trip.
3. **Self-bootstrap demo data** — run the node's own create operations (customer, product, sales order, purchase order) BEFORE testing triggers, so the trigger events have real payloads to fire on.

## Local dev

- Node **>= 22.16** required (`engines.node`).
- `npm ci && npm run build`, then `n8n-node dev` (`npm run dev`) runs a local n8n instance with this node loaded for iterative development.
- Tests are offline: `npm run build && npm test`.

## Gap protocol

When the SKU.io backend is missing something the node needs (endpoint, field, scope, webhook event):

1. Write it up as a **contract doc** in `docs/` on the `skuio/sku` repo.
2. Open a **PR on `skuio/sku`** implementing the backend change.
3. **Never** paper over the gap with a client-side workaround in this package.
