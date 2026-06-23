# E-commerce — Frontend + Product Service

Phase 1 scope of this README: the **React/Vite SPA** and the **product-service** Go backend.
All other services are out of scope here.

> Heads-up: do not paste real DB passwords into this file. Use `<placeholder>` syntax
> everywhere. Real values belong in environment variables or your secret manager only.

---

## Architecture at a glance

```
            Browser
               |
               |  HTTP(S)
               v
        +-----------------+
        |     Ingress     |   host: gotechnonext.com
        +-----------------+
         /              \
        v                v
  /api/products/*       /  (SPA)
       |                |
       v                v
  +-----------+    +----------+
  | product   |    | frontend |
  |  service  |    |  (nginx) |
  +-----------+    +----------+
        |
        v
  +-----------------------------------------+
  |     PostgreSQL (database = ecommerce)   |
  |  schema product_svc   role product_user |
  +-----------------------------------------+
```

The SPA never knows backend IPs. It calls relative `/api/*` paths; the ingress fans
them out to product-service.

---

## Stack

- **Backend**: Go 1.22, `chi` router, `pgx` driver
- **Frontend**: React + Vite + TypeScript, served by nginx
- **DB**: PostgreSQL (database `ecommerce`, schema `product_svc`)

---

## Services

| Service | Port | Schema | DB role | Public route |
|---|---|---|---|---|
| product-service | 8080 | `product_svc` | `product_user` | `/api/products/*` |
| frontend | 80 | — | — | `/` |

---

## Frontend ↔ Backend communication

`frontend/src/api/client.ts`:

```ts
const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});
```

product-service has **no auth in this build** — its endpoints are open. Treat write
endpoints as internal-only; do not expose them to the public internet without putting
another auth layer in front.

---

## Database setup

### 1. Create the database

```sql
-- as Postgres admin
CREATE DATABASE ecommerce;
```

### 2. Run the migration

```bash
PGPASSWORD='<admin-pw>' psql -h <db-host> -U <admin> -d ecommerce \
  -f services/product-service/migrations/001_init.up.sql
```

Migrations are idempotent (`CREATE SCHEMA IF NOT EXISTS`, `CREATE TABLE IF NOT EXISTS`).

### 3. Create the product-service Postgres role

Generate a fresh password with `openssl rand -base64 24`, then:

```sql
CREATE ROLE product_user LOGIN PASSWORD '<strong-random-password>';

GRANT CONNECT ON DATABASE ecommerce TO product_user;
GRANT USAGE ON SCHEMA product_svc TO product_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES   IN SCHEMA product_svc TO product_user;
GRANT USAGE, SELECT, UPDATE         ON ALL SEQUENCES IN SCHEMA product_svc TO product_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA product_svc
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES    TO product_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA product_svc
  GRANT USAGE, SELECT, UPDATE         ON SEQUENCES TO product_user;
```

### 4. Table created by the migration

```
product_svc.products   sku (unique), name, description, price_cents, stock
```

---

## Environment variables (product-service)

| Variable | Required | Default | Notes |
|---|---|---|---|
| `PORT` | no | `8080` | HTTP listen port |
| `DB_HOST` | **yes** | — | Postgres host |
| `DB_PORT` | no | `5432` | |
| `DB_USER` | **yes** | — | `product_user` |
| `DB_PASSWORD` | **yes** | — | Role password |
| `DB_NAME` | **yes** | — | Always `ecommerce` |
| `DB_SCHEMA` | no | `product_svc` | |
| `DB_SSLMODE` | no | `disable` | |

---

## Kubernetes secret (product-service DB credentials)

Create a `Secret` so the product-service Deployment can mount DB credentials as env vars
instead of hard-coding them.

### Option A — `kubectl` CLI

```bash
kubectl create secret generic product-db-credentials \
  --namespace=<namespace> \
  --from-literal=DB_HOST='<db-host>' \
  --from-literal=DB_PORT='5432' \
  --from-literal=DB_USER='product_user' \
  --from-literal=DB_PASSWORD='<strong-random-password>' \
  --from-literal=DB_NAME='ecommerce' \
  --from-literal=DB_SCHEMA='product_svc'
```

### Option B — YAML manifest

Values under `stringData` are stored as plain strings; Kubernetes base64-encodes them
on write. Do **not** commit this file with real values — generate it from a template
or use a secret manager (Sealed Secrets, External Secrets Operator, Vault).

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: product-db-credentials
  namespace: <namespace>
type: Opaque
stringData:
  DB_HOST: "<db-host>"
  DB_PORT: "5432"
  DB_USER: "product_user"
  DB_PASSWORD: "<strong-random-password>"
  DB_NAME: "ecommerce"
  DB_SCHEMA: "product_svc"
```

Apply:

```bash
kubectl apply -f product-db-credentials.yaml
```

### Consuming the secret in the Deployment

```yaml
spec:
  containers:
    - name: product-service
      image: <registry>/product-service:<tag>
      envFrom:
        - secretRef:
            name: product-db-credentials
      ports:
        - containerPort: 8080
```

### Rotating the password

```bash
kubectl create secret generic product-db-credentials \
  --namespace=<namespace> \
  --from-literal=DB_PASSWORD='<new-password>' \
  ... \
  --dry-run=client -o yaml | kubectl apply -f -

kubectl rollout restart deployment/product-service -n <namespace>
```

Update the Postgres role password (`ALTER ROLE product_user WITH PASSWORD '<new>';`)
**before** restarting the pods.

---

## Running product-service locally

```bash
cd services/product-service

export DB_HOST=localhost
export DB_USER=product_user
export DB_PASSWORD='<strong-random-password>'
export DB_NAME=ecommerce

go run ./cmd/server
# product-service listening on :8080
```

---

## Running the frontend locally

```bash
cd frontend
npm install
npm run dev     # Vite at http://localhost:5173, proxies /api -> http://localhost:8080
```

`vite.config.ts` proxies `/api` to product-service during development.

Production build:

```bash
npm run build   # outputs dist/
```

The Dockerfile bakes `dist/` into nginx with `frontend/nginx.conf` (SPA fallback to
`index.html`, 7-day caching for static assets).

---

## API quick reference

Replace `<host>` with your gateway address.

```bash
# List products -> { count, items: [...] }
curl http://<host>/api/products

# Single product
curl http://<host>/api/products/1
```

---

## Project layout

```
.
├── frontend/                       # React + Vite SPA
│   ├── src/
│   │   ├── api/                    # axios client, types
│   │   ├── pages/                  # Products, ...
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── Dockerfile                  # multi-stage: node build -> nginx
│   ├── nginx.conf
│   └── vite.config.ts
│
└── services/
    └── product-service/
        ├── cmd/server/             # main entrypoint
        ├── internal/
        │   ├── config/             # env loader
        │   ├── handler/            # HTTP handlers
        │   ├── service/            # business logic
        │   ├── repository/         # pgx queries
        │   └── model/
        ├── migrations/             # *.up.sql, *.down.sql
        ├── Dockerfile              # distroless static build
        └── go.mod
```

---

## Security notes

- Never commit real DB passwords or admin credentials.
- product-service uses a dedicated Postgres role (`product_user`) with grants only on
  the `product_svc` schema.
- product-service has no auth in this build — keep its write endpoints internal.
