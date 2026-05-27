# Kafdrop Web UI — Production Setup

Read-only web UI for the Kafka cluster, fronted by nginx with basic auth, TLS, rate-limiting, and security headers.

```
web-ui/
├── docker-compose.yaml           # kafdrop + nginx stack
├── nginx/
│   ├── kafdrop.conf              # nginx vhost (TLS + auth + rate limit + CSP)
│   ├── kafdrop.htpasswd.example  # template — DO NOT commit real credentials
│   ├── kafdrop.htpasswd          # GENERATED locally (gitignored)
│   └── ssl/                      # GENERATED locally (gitignored)
│       ├── kafdrop.crt
│       └── kafdrop.key
└── .gitignore                    # excludes htpasswd + ssl/*
```

## 1. Create the htpasswd file (DO NOT commit)

The real `kafdrop.htpasswd` is gitignored. Generate it locally with the Apache `htpasswd` tool (uses bcrypt):

```bash
sudo apt install -y apache2-utils                       # provides htpasswd
htpasswd -B -c nginx/kafdrop.htpasswd <username>        # -B = bcrypt, -c = create
# add more users (omit -c)
htpasswd -B nginx/kafdrop.htpasswd <another-user>
```

Verify the file is owned by you (not root) and chmod 600:

```bash
chmod 600 nginx/kafdrop.htpasswd
```

> **Never commit this file.** If credentials leak to git, rotate them immediately and purge history with `git filter-repo` or BFG.

---

## 2. Generate TLS certificates

### Option A — self-signed (internal / lab use)

```bash
mkdir -p nginx/ssl
openssl req -x509 -nodes -newkey rsa:4096 -days 365 \
  -keyout nginx/ssl/kafdrop.key \
  -out    nginx/ssl/kafdrop.crt \
  -subj   "/CN=kafdrop.internal/O=TechnoNext/C=BD" \
  -addext "subjectAltName=DNS:kafdrop.internal,DNS:localhost,IP:127.0.0.1"
chmod 600 nginx/ssl/kafdrop.key
```

Browsers will show a warning — add the cert to your trust store, or use Option B.

### Option B — internal CA / Let's Encrypt (recommended for production)

Place the issued cert chain and private key at:

```
nginx/ssl/kafdrop.crt   # full chain (server cert + intermediates)
nginx/ssl/kafdrop.key   # private key, chmod 600
```

## 3. Start the stack

```bash
docker compose up -d
docker compose ps
docker compose logs -f
```

The stack:
1. Creates a private bridge network `kafdrop-net`
2. Starts kafdrop (no port published — internal only)
3. Starts nginx (publishes 80 + 443)
4. nginx waits for kafdrop's healthcheck before accepting traffic

Verify Kafdrop reaches the brokers:

```bash
docker compose logs kafdrop | grep -i "connected\|broker"
```

Open `https://<host>` in a browser → basic-auth prompt → Kafdrop UI.


---

## 5. Common operations

```bash
docker compose pull kafdrop                 # pull image (only after bumping the pinned tag in compose file)
docker compose up -d                        # apply changes
docker compose restart kafdrop-nginx        # reload nginx config after editing kafdrop.conf
docker compose down                         # stop stack
docker compose down -v                      # stop + remove network
```

Add a user (no restart needed — nginx re-reads htpasswd per request):

```bash
htpasswd -B nginx/kafdrop.htpasswd <new-user>
```

Revoke a user:

```bash
htpasswd -D nginx/kafdrop.htpasswd <user>
```

---

## 6. Production-readiness checklist

- [ ] `kafdrop.htpasswd` and `nginx/ssl/*` are **not** in git (verify with `git status`)
- [ ] Image tag pinned (no `:latest`)
- [ ] TLS cert is from a trusted CA (or internal CA distributed to operators)
- [ ] One basic-auth user **per operator**, not shared
- [ ] `set_real_ip_from` configured in `kafdrop.conf` if behind another proxy / cloud LB
- [ ] DNS A record points to this host
- [ ] Firewall allows only 80/443 inbound from the operator subnet
- [ ] Cert rotation calendar entry set (Let's Encrypt = 60 days; self-signed = before `Not After` date)
