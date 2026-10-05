# n8n-nodes-sku-io

An [n8n](https://n8n.io) community node package for [SKU.io](https://sku.io) — inventory and order management for e-commerce.

The package ships two nodes:

- **SKU.io Trigger** — 10 instant (webhook-based) events delivered via SKU.io's REST hooks, covering sales orders, purchase orders, inventory, products, and customers.
- **SKU.io** (action node) — create and find operations for Customers, Inventory, Products, Purchase Orders, Sales Orders, and Suppliers.

Authentication is OAuth2 (authorization code). One connection is bound to exactly one SKU.io tenant.

## Installation

Install through the n8n GUI: **Settings → Community Nodes → Install** and enter the package name:

```
n8n-nodes-sku-io
```

Follow the [community nodes installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) if community nodes are not yet enabled on your instance.

> **Webhook requirement:** the trigger node registers REST hooks that SKU.io calls back over the internet. Your n8n instance must be **publicly reachable over HTTPS** (n8n Cloud is; self-hosted instances need a public HTTPS URL — a reverse proxy or tunnel works for development).

## Credentials

n8n does not ship a shared first-party OAuth client for SKU.io, because every n8n instance has its **own** OAuth callback URL (self-hosted: `https://<your-host>/rest/oauth2-credential/callback`, n8n Cloud: `https://oauth.n8n.cloud/oauth2/callback`). Each user therefore registers their own OAuth client in SKU.io:

1. In n8n, create a new **SKU.io OAuth2 API** credential. The dialog shows an **OAuth Redirect URL** — copy it.
2. In SKU.io, go to **Settings → Developer → OAuth Apps** (requires a tenant admin account) and create a new OAuth App using the copied redirect URL as the **Redirect URI**.
3. SKU.io shows a **Client ID** and **Client Secret** — paste both into the n8n credential.
4. Leave **Base URL** as `https://app.sku.io` unless you are connecting to a non-production environment.
5. Click **Connect my account**. SKU.io's consent screen asks which tenant to authorize — **one connection is bound to one tenant**. To work with multiple tenants, create one credential per tenant.

## Operations

### Triggers (SKU.io Trigger node — instant, via REST hooks)

| Event | Fires when |
|---|---|
| `sales_order.created` | A sales order is created |
| `sales_order.shipped` | A sales order is shipped |
| `sales_order.cancelled` | A sales order is cancelled |
| `purchase_order.created` | A purchase order is created |
| `purchase_order.approved` | A purchase order is approved |
| `purchase_order.submitted` | A purchase order is submitted to the supplier |
| `purchase_order.received` | A purchase order is received |
| `inventory.adjusted` | Inventory is adjusted |
| `product.created` | A product is created |
| `customer.created` | A customer is created |

### Actions & searches (SKU.io node)

| Resource | Operations |
|---|---|
| Customer | Create, Find by Email |
| Inventory | Create Adjustment |
| Product | Create, Find by SKU, Update |
| Purchase Order | Create |
| Sales Order | Create, Find by Number |
| Supplier | Create, Find by Name |

Customer, Product, Store, Supplier and Warehouse fields are dynamic dropdowns loaded from your SKU.io tenant. The action node is also usable as an AI Agent tool.

## Usage examples

**Post new sales orders to a chat channel**

1. Add **SKU.io Trigger**, choose the **New Sales Order** event, and activate the workflow. The node registers a webhook subscription in SKU.io; deactivating the workflow removes it.
2. Each new order arrives as one item containing the order, its lines, customer and store. Connect it to Slack, email, or any other node.

**Create an order from an external form**

1. Start with any trigger (for example a Webhook or Form node).
2. **SKU.io → Customer → Find by Email**; if no customer is found, **SKU.io → Customer → Create**.
3. **SKU.io → Sales Order → Create** with the customer, a store, and one or more lines (product, quantity, price, warehouse).

**Raise a purchase order when stock runs low**

1. **SKU.io Trigger → Inventory Adjusted**, followed by an **If** node on the quantity.
2. **SKU.io → Purchase Order → Create** for the product's supplier and destination warehouse. SKU.io only accepts lines for products that are linked to the chosen supplier.

Errors from SKU.io (for example validation messages) are shown on the failing item. Enable **Continue On Fail** to route them as data instead of stopping the workflow.

## Compatibility

- n8n `>= 1.x`
- Node.js 22 runtime (`engines.node >= 22.16`)

## Development

```bash
npm ci            # install dependencies
npm run build     # tsc + copy SVG/codex assets into dist/
npm test          # node --test test/ (run after build)
npm run lint      # n8n community-node linter (eslint-plugin-n8n-nodes-base)
npm run dev       # n8n-node dev — local n8n with this node loaded
```

Tests are offline (no network, no live tenant) and cover the request helper's pod-routing invariants, error shaping, input hygiene, and the package/catalog contracts.

## Resources

- [SKU.io API documentation](https://developer.sku.io)
- [n8n community nodes documentation](https://docs.n8n.io/integrations/community-nodes/)

## License

[MIT](https://opensource.org/licenses/MIT)
