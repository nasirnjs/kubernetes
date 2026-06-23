# Kubernetes Deployment Guide

This document covers running the e-commerce stack on Kubernetes: image builds, manifests,
secrets, ingress, and the most common failure modes.

> **Internal doc.** It references LAN IPs and host names of the current cluster
> (`10.70.57.x`, `gotechnonext.com`). Do not publish externally. Never commit real
> credentials — use placeholders.

---

## 1. Prerequisites

- A working Kubernetes cluster (kubeadm or similar) with **Traefik** as ingress.
- `kubectl` configured for the target cluster.
- An external PostgreSQL reachable from the cluster nodes (this guide assumes
  `10.70.57.144:5432`, database `ecommerce`).
- Docker Hub credentials for the `nasirnjs/*` repos.
- `docker buildx` available (multi-platform builder). The dev workstation is on
  Apple Silicon (`arm64`) but the cluster nodes are `linux/amd64`, so **every image must
  be built for `linux/amd64`** — see §6.

Confirm what you're connected to:

```bash
kubectl config current-context
# kubernetes-admin@kubernetes

kubectl cluster-info | head -2
# Kubernetes control plane is running at https://10.70.57.140:6443

kubectl get nodes -o jsonpath='{.items[*].status.nodeInfo.architecture}{"\n"}'
# amd64 amd64 amd64 amd64
```

---

## 2. Cluster topology

```
+--------------------------+
|   Traefik (LoadBalancer) |  10.70.57.173
+--------------------------+
              |
              v   host: gotechnonext.com
+--------------------------+
|  ingress/ecommerce-ingress
|  /                  -> frontend
|  /api/products      -> product-service
|  /api/users         -> user-service
|  /api/orders        -> order-service
|  /api/payments      -> payment-service
|  /api/shipments     -> shipping-service
|  /api/notifications -> notification-service
+--------------------------+
```

All workloads live in namespace `ecommerce`. Each backend is `2` replicas, `RollingUpdate`
(`maxUnavailable: 0`, `maxSurge: 1`).

To reach the cluster from a workstation, add a hosts override (the public DNS for
`gotechnonext.com` points at Cloudflare, not at the cluster):

```bash
echo "10.70.57.173 gotechnonext.com" | sudo tee -a /etc/hosts
```

---

## 3. Manifest layout (`k8s/`)

```
k8s/
├── namespace.yaml
├── ingress.yaml
├── frontend-deployment.yaml
├── frontend-service.yaml
├── user-configmap.yaml
├── user-deployment.yaml
├── user-secret.yaml              # template only — real values created out-of-band
├── user-service.yaml
├── product-configmap.yaml
├── product-deployment.yaml
├── product-secret.yaml           # template
├── product-service.yaml
├── order-configmap.yaml
├── order-deployment.yaml
├── order-service.yaml            # (no order-secret.yaml — Secret created via kubectl)
├── payment-configmap.yaml
├── payment-deployment.yaml
├── payment-secret.yaml           # template
├── payment-service.yaml
├── shipping-configmap.yaml
├── shipping-deployment.yaml
├── shipping-service.yaml
├── notification-configmap.yaml
├── notification-deployment.yaml
└── notification-service.yaml
```

`*-secret.yaml` files are **templates** with `REPLACE_ME` placeholders. The real Secret
objects are created with `kubectl create secret generic ... --from-literal=...` so real
credentials never enter git.

---

## 4. Database bootstrap (one-time)

Each service has its own dedicated Postgres role with grants only on its own schema. This
must be done **before** the deployments roll out, otherwise pods enter
`CreateContainerConfigError` because `envFrom: secretRef` resolves a missing Secret.

Run as the Postgres admin against `10.70.57.144`:

```bash
PG_ADMIN_PASSWORD='<admin-pw>'
PG_HOST=10.70.57.144

# 1. Migrate every schema
for svc in user product order payment shipping notification; do
  PGPASSWORD="$PG_ADMIN_PASSWORD" psql -h "$PG_HOST" -U admin -d ecommerce \
    -f services/${svc}-service/migrations/001_init.up.sql
done
```

Then create one role per service. Repeat with `<role>` and `<schema>` substituted:

```sql
CREATE ROLE <role> LOGIN PASSWORD '<strong-random-password>';

GRANT CONNECT ON DATABASE ecommerce TO <role>;
GRANT USAGE ON SCHEMA <schema> TO <role>;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES   IN SCHEMA <schema> TO <role>;
GRANT USAGE, SELECT, UPDATE         ON ALL SEQUENCES IN SCHEMA <schema> TO <role>;
ALTER DEFAULT PRIVILEGES IN SCHEMA <schema>
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES    TO <role>;
ALTER DEFAULT PRIVILEGES IN SCHEMA <schema>
  GRANT USAGE, SELECT, UPDATE         ON SEQUENCES TO <role>;
```

Service → role → schema:

| service | role | schema |
|---|---|---|
| user-service | `user_app` | `user_svc` |
| product-service | `product_user` | `product_svc` |
| order-service | `order_app` | `order_svc` |
| payment-service | `payment_app` | `payment_svc` |
| shipping-service | `shipping_app` | `shipping_svc` |
| notification-service | `notification_app` | `notification_svc` |

Generate passwords once with `openssl rand -base64 24`. Save them to a `chmod 600` file
**outside** the repo — never paste real values into chat or commits.

---

## 5. Secrets (created out-of-band)

Generate one `JWT_SECRET` and reuse it across **user**, **order**, **payment**, **shipping**,
**notification**. Tokens issued by user-service must validate everywhere.

```bash
JWT_SECRET=$(openssl rand -base64 48 | tr -d '/+=' | head -c 48)
echo "$JWT_SECRET" > ~/db/jwt-secret.local        # chmod 600
```

### Per-service Secret commands

```bash
# user-service (needs JWT)
kubectl -n ecommerce create secret generic user-service-secret \
  --from-literal=DB_HOST=10.70.57.144 \
  --from-literal=DB_USER=user_app \
  --from-literal=DB_PASSWORD='<user_app-pw>' \
  --from-literal=JWT_SECRET="$JWT_SECRET"

# product-service (no JWT in this build)
kubectl -n ecommerce create secret generic product-service-secret \
  --from-literal=DB_HOST=10.70.57.144 \
  --from-literal=DB_USER=product_user \
  --from-literal=DB_PASSWORD='<product_user-pw>'

# order-service
kubectl -n ecommerce create secret generic order-service-secret \
  --from-literal=DB_HOST=10.70.57.144 \
  --from-literal=DB_USER=order_app \
  --from-literal=DB_PASSWORD='<order_app-pw>' \
  --from-literal=JWT_SECRET="$JWT_SECRET"

# payment-service
kubectl -n ecommerce create secret generic payment-service-secret \
  --from-literal=DB_HOST=10.70.57.144 \
  --from-literal=DB_USER=payment_app \
  --from-literal=DB_PASSWORD='<payment_app-pw>' \
  --from-literal=JWT_SECRET="$JWT_SECRET"

# shipping-service
kubectl -n ecommerce create secret generic shipping-service-secret \
  --from-literal=DB_HOST=10.70.57.144 \
  --from-literal=DB_USER=shipping_app \
  --from-literal=DB_PASSWORD='<shipping_app-pw>' \
  --from-literal=JWT_SECRET="$JWT_SECRET"

# notification-service
kubectl -n ecommerce create secret generic notification-service-secret \
  --from-literal=DB_HOST=10.70.57.144 \
  --from-literal=DB_USER=notification_app \
  --from-literal=DB_PASSWORD='<notification_app-pw>' \
  --from-literal=JWT_SECRET="$JWT_SECRET"
```

### Rotating a credential

```bash
# 1. Change in Postgres
ALTER ROLE order_app WITH PASSWORD '<new-pw>';

# 2. Replace the Secret
kubectl -n ecommerce delete secret order-service-secret
kubectl -n ecommerce create secret generic order-service-secret \
  --from-literal=DB_HOST=10.70.57.144 \
  --from-literal=DB_USER=order_app \
  --from-literal=DB_PASSWORD='<new-pw>' \
  --from-literal=JWT_SECRET="$(cat ~/db/jwt-secret.local)"

# 3. Force pods to pick up the new env
kubectl -n ecommerce rollout restart deploy/order-service
```

---

## 6. Building images (linux/amd64)

The dev workstation is `arm64` (Apple Silicon). The cluster nodes are `amd64`. A plain
`docker build` produces an arm64 image that the kubelet rejects with
`no match for platform in manifest`. **Always use buildx with `--platform linux/amd64`.**

```bash
# Per service
cd services/<svc>-service
go mod tidy
docker buildx build --platform linux/amd64 -t nasirnjs/<svc>-service:0.0.1 --push .

# Frontend
cd frontend
docker buildx build --platform linux/amd64 -t nasirnjs/ecommerce-fronten:0.0.3 --push .
```

> The frontend image name is `nasirnjs/ecommerce-fronten` (missing the trailing "d") —
> a typo that is now baked into the published tag. Either keep using it or push under
> the correct `ecommerce-frontend` name and update `k8s/frontend-deployment.yaml`.

### Current image tags

| service | image |
|---|---|
| frontend | `nasirnjs/ecommerce-fronten:0.0.3` |
| product-service | `nasirnjs/product-service:0.0.3` |
| user-service | `nasirnjs/user-service:0.0.1` |
| order-service | `nasirnjs/order-service:0.0.1` |
| payment-service | `nasirnjs/payment-service:0.0.1` |
| shipping-service | `nasirnjs/shipping-service:0.0.1` |
| notification-service | `nasirnjs/notification-service:0.0.1` |

---

## 7. Deploy order

```bash
# 1. Namespace
kubectl apply -f k8s/namespace.yaml

# 2. (out-of-band) Migrations + roles + Secrets per §4–§5

# 3. ConfigMaps + Services + Deployments per service
kubectl apply -f k8s/product-configmap.yaml \
              -f k8s/product-service.yaml \
              -f k8s/product-deployment.yaml

kubectl apply -f k8s/user-configmap.yaml \
              -f k8s/user-service.yaml \
              -f k8s/user-deployment.yaml

kubectl apply -f k8s/order-configmap.yaml \
              -f k8s/order-service.yaml \
              -f k8s/order-deployment.yaml

kubectl apply -f k8s/payment-configmap.yaml \
              -f k8s/payment-service.yaml \
              -f k8s/payment-deployment.yaml

kubectl apply -f k8s/shipping-configmap.yaml \
              -f k8s/shipping-service.yaml \
              -f k8s/shipping-deployment.yaml

kubectl apply -f k8s/notification-configmap.yaml \
              -f k8s/notification-service.yaml \
              -f k8s/notification-deployment.yaml

# 4. Frontend
kubectl apply -f k8s/frontend-service.yaml \
              -f k8s/frontend-deployment.yaml

# 5. Ingress (must come last so all backend Services exist)
kubectl apply -f k8s/ingress.yaml

# 6. Verify
kubectl -n ecommerce get pods,svc,ingress
kubectl -n ecommerce rollout status deploy/product-service
# ...repeat per deploy
```

To deploy a single service end-to-end in one command, the four files are
`<svc>-configmap.yaml`, `<svc>-service.yaml`, `<svc>-deployment.yaml`, and the Secret
created via `kubectl create secret`.

---

## 8. Verifying a deploy

```bash
kubectl -n ecommerce get deploy
# NAME                   READY   UP-TO-DATE   AVAILABLE
# frontend               2/2     2            2
# product-service        2/2     2            2
# user-service           2/2     2            2
# order-service          2/2     2            2
# payment-service        2/2     2            2
# shipping-service       2/2     2            2
# notification-service   2/2     2            2

# Smoke test the public API
curl -H "Host: gotechnonext.com" http://10.70.57.173/api/products
curl -X POST -H "Host: gotechnonext.com" -H "Content-Type: application/json" \
  http://10.70.57.173/api/users/login \
  -d '{"email":"demo@example.com","password":"DemoPass123"}'
```

---

## 9. Common operations

```bash
# Logs
kubectl -n ecommerce logs deploy/order-service --tail=200 -f

# Restart pods (e.g. after secret rotation)
kubectl -n ecommerce rollout restart deploy/<name>

# Roll back to previous revision
kubectl -n ecommerce rollout undo deploy/<name>

# Scale
kubectl -n ecommerce scale deploy/product-service --replicas=4

# Exec (note: distroless images have no shell, no wget, no curl)
kubectl -n ecommerce exec -it <pod> -- /app/product-service --help   # only the binary is present
```

---

## 10. Security context (distroless nonroot fix)

Every backend Dockerfile uses `gcr.io/distroless/static-debian12:nonroot`, which sets
the container user **by name** (`nonroot`) rather than by UID. Kubernetes refuses to
verify a non-numeric user against `runAsNonRoot: true`:

```
container has runAsNonRoot and image has non-numeric user (nonroot),
cannot verify user is non-root
```

Fix: pin the numeric UID (distroless `nonroot` is `65532`):

```yaml
securityContext:
  allowPrivilegeEscalation: false
  readOnlyRootFilesystem: true
  runAsNonRoot: true
  runAsUser: 65532          # required
  runAsGroup: 65532         # required
  capabilities:
    drop: ["ALL"]
```

All current Deployments already have this. If you author a new backend Deployment from
scratch, do not omit `runAsUser`/`runAsGroup`.

---

## 11. Troubleshooting

### `CreateContainerConfigError` — `secret "X" not found`

The Secret was not created before the Deployment was applied. Create it (§5) and the
kubelet retries automatically. To force an immediate retry:

```bash
kubectl -n ecommerce rollout restart deploy/<name>
```

### `ImagePullBackOff` — `no match for platform in manifest`

You built an image on `arm64` (Apple Silicon) but the nodes are `amd64`. Rebuild with
buildx (§6) and re-roll the deployment.

### `ImagePullBackOff` — `pull access denied`

Either the repo is private (need an `imagePullSecret`) or the tag does not exist on
Docker Hub. Verify locally:

```bash
docker pull nasirnjs/<svc>-service:<tag>
```

### Pod stuck in `Pending` — `container has runAsNonRoot and image has non-numeric user`

Add `runAsUser: 65532` + `runAsGroup: 65532` to the Deployment's `securityContext`
(§10).

### `ErrImagePull` for a brand-new tag

`imagePullPolicy: IfNotPresent` only re-uses cached images. If you pushed a fresh tag
but the node has a stale entry for the same digest, the pull happens normally — this
shouldn't trigger `ErrImagePull` unless the digest is genuinely missing. Confirm with:

```bash
docker manifest inspect docker.io/nasirnjs/<svc>-service:<tag>
```

### Browser still hits Cloudflare instead of the cluster

`gotechnonext.com` resolves publicly. Add `10.70.57.173 gotechnonext.com` to
`/etc/hosts` and flush cache:

```bash
sudo dscacheutil -flushcache       # macOS
ping gotechnonext.com               # should print 10.70.57.173
```

### Frontend shows "No products available" but `/api/products` returns data

You're running an old frontend image. Hard-refresh (Cmd-Shift-R) to bust the cached JS
bundle. The current build is `0.0.3`.

### `db ping` fails on startup

Check `DB_HOST` reachability from the cluster:

```bash
kubectl -n ecommerce run pgcheck --rm -it --image=postgres:16-alpine --restart=Never \
  -- psql -h 10.70.57.144 -U user_app -d ecommerce -c "SELECT 1;"
```

If this fails, the cluster node firewall or the Postgres `pg_hba.conf` is blocking
the connection — not a k8s problem.

---

## 12. Frontend image naming caveat

The on-disk image name is `nasirnjs/ecommerce-fronten` (missing "d"). Two options:

1. **Keep the typo** — leave manifests as-is, build/push to that name.
2. **Fix it** — push under `nasirnjs/ecommerce-frontend:<tag>` and update
   `k8s/frontend-deployment.yaml` accordingly. Old image can be left on Docker Hub
   for cluster rollback.

---

## 13. Phase 2 readiness checklist (Kafka + Redis)

Not yet wired up. When you start Phase 2:

- [ ] Decide deployment shape for Kafka: in-cluster (e.g. Strimzi operator or a KRaft
      StatefulSet) **or** reuse the standalone setup in `../kafka-cluster/`.
- [ ] Decide Redis shape (in-cluster StatefulSet vs. managed).
- [ ] Add Kafka client library (e.g. `github.com/segmentio/kafka-go`) per service.
- [ ] Add producer code in order-service / payment-service / shipping-service.
- [ ] Add consumer code in shipping-service / notification-service.
- [ ] Add `KAFKA_BROKERS`, `REDIS_ADDR` to ConfigMaps / Secrets.
- [ ] Update `k8s/ingress.yaml` only if any new admin endpoints are exposed
      (event flow is internal — no new public routes).

---

## 14. Cleanup

To tear down everything in the cluster (does **not** drop the database or its data):

```bash
kubectl delete namespace ecommerce
```

To also drop the schemas (destructive — all data lost):

```sql
-- as Postgres admin
DROP SCHEMA user_svc, product_svc, order_svc, payment_svc, shipping_svc, notification_svc CASCADE;
DROP ROLE user_app, product_user, order_app, payment_app, shipping_app, notification_app;
```
