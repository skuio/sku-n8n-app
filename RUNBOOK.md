# RUNBOOK — n8n-nodes-sku-io

Operational runbook for building, verifying, and releasing the SKU.io n8n community node. The README covers users/developers; this file covers ops.

## Ownership

- **Platform account:** `dev@sku.io` (n8n, npm, GitHub org contexts as applicable).
- **Credentials:** stored in the 1Password `sku` vault. Never in this repo, never in `.env` committed anywhere (`.secrets/` and `.env` are gitignored).
- **npm publisher:** the `dev@sku.io` npm account (1Password `sku` vault → *Npmjs*). After the first manual publish, releases run through GitHub Actions over OIDC — there is **no** npm token stored in this repo or in GitHub secrets, by design.

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

### How a release actually runs

`.github/workflows/release.yml` is the only thing that may publish. It is
`workflow_dispatch`-only and **defaults to a dry run**, so a release is always a
deliberate human act — which is what the STOP-gate asks for. Run it from the
Actions tab, leave *Dry run* ticked to rehearse, untick it to publish.

`_removed:` CI used to carry a note saying this repo intentionally has **no**
publish workflow at all. That was the right call while no publishing path had
been agreed, but it was read as "never automate publishing", which points away
from the trusted-publisher requirement above. The gate was never "no workflow";
it was "no unattended publish". `release.yml` keeps that gate (manual dispatch,
dry-run default) while satisfying the verified-node requirement. Do **not**
re-add a `push:`/tag trigger to it, and do **not** add an `NPM_TOKEN` secret —
auth is OIDC, and a stored token would reintroduce exactly the long-lived
credential the verified-node rules exist to remove.

### npm trusted publisher — one-time setup

On npmjs.com, as the `dev@sku.io` npm account: **Package → Settings → Trusted
publisher → GitHub Actions**, and enter

| Field | Value |
|---|---|
| Organization or user | `skuio` |
| Repository | `sku-n8n-app` |
| Workflow filename | `release.yml` (filename only — not a path) |
| Environment | *(leave blank)* |

**npm cannot publish a package's first version over OIDC** — the npmjs.com UI
only exposes package settings once the package exists
([npm/cli#8544](https://github.com/npm/cli/issues/8544)). So `0.1.0` had to be
published manually from an authenticated CLI; the trusted publisher is
configured immediately afterwards and every later release goes through
`release.yml`. Do not treat that first manual publish as the normal path.

## Backend contract verification log

| Date | Check | Result |
|---|---|---|
| 2026-07-09 | OAuth token endpoint RFC 6749 error contract | Verified local |
| 2026-07-09 | 10 registry events + invariants tests | Verified green (77 tests) |
| 2026-07-09 | `/v2/stores` scope gate (`settings:read`) | Added on sku branch SKU-8142, pending deploy |
| 2026-09-07 | `/v2/stores` scope gate (`settings:read`) | **Live** — merged to `skuio/sku` master (PR #1637, commit `05882c2935`) and deployed. This credential requests `settings:read`, so the Store dropdown clears the gate. |
| 2026-09-07 | Merge-caveat follow-up: does gating `/v2/stores` break the live Zapier app? | **No** — the Zapier app never calls `/v2/stores`. Separately discovered: its `store_list` dropdown calls `GET /api/stores`, an index route deleted from `skuio/sku` on 2026-06-17 (commit `c2e2149b14`), so that dropdown is broken independently of this gate. Tracked outside this repo. |

Append a row every time a backend contract assumption is (re-)verified or a backend change lands that this package depends on.

## Live-verification checklist

Run before any release:

1. **Tunnel/dev OAuth first** — confirm the backend release is deployed (check the contract log above; anything "pending deploy" blocks live verification), then complete a full OAuth connect against a dev/tunnel tenant.
2. **One real connection** — n8n Cloud or a publicly reachable self-hosted instance, full connect → trigger activation → action round-trip.
3. **Self-bootstrap demo data** — run the node's own create operations (customer, product, sales order, purchase order) BEFORE testing triggers, so the trigger events have real payloads to fire on.

## Local dev

- Node **>= 22.16** required (`engines.node`).
- `npm ci && npm run build`, then `npm run dev` runs a local n8n instance with this node hot-loaded for iterative development. `dev` invokes `@n8n/node-cli` via **`npx --yes`** (fetched + cached on demand) rather than as a committed devDependency — the CLI drags in the entire n8n + LangChain + Playwright tree, which CI (`npm ci`/`lint`/`build`/`test`, none of which use it) must never install. First `npm run dev` installs the n8n runtime on-demand (~5 min); run it with `NODE_TLS_REJECT_UNAUTHORIZED=0` when OAuth-testing against a local valet (self-signed) SKU.io URL.
- Tests are offline: `npm run build && npm test`.

## Gap protocol

When the SKU.io backend is missing something the node needs (endpoint, field, scope, webhook event):

1. Write it up as a **contract doc** in `docs/` on the `skuio/sku` repo.
2. Open a **PR on `skuio/sku`** implementing the backend change.
3. **Never** paper over the gap with a client-side workaround in this package.
