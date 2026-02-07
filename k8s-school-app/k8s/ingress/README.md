
<H2>Deploying Traefik Gateway API</h2>


## Steps 1: Create a namespace for your app
Namespace dev will host your Gateway, HTTPRoute, and Nginx app.
```yaml
kubectl create namespace dev
```


## Steps 2: Create Traefik values file
This file configures Traefik via Helm. Gateway API is enabled, Ingress is disabled, and routes from all namespaces are allowed.
```yaml
vim 0-traefik-values.yaml
```
```yaml
providers:
  kubernetesIngress:
    enabled: false
  kubernetesGateway:
    enabled: true

gateway:
  namespacePolicy: All

gatewayClass:
  enabled: false
```

## Steps 3: Install or upgrade Traefik via Helm
This installs Traefik in the 'traefik' namespace, with Gateway API enabled and no Ingress support

```bash
helm repo add traefik https://traefik.github.io/charts
helm repo update
helm search repo traefik/traefik --versions | head
helm list -n traefik
```

```bash
helm upgrade --install traefik traefik/traefik \
  --version 38.0.2 \
  -n traefik --create-namespace \
  -f 0-traefik-values.yaml
```

```bash
helm list -n traefik
helm status traefik -n traefik
```

## Steps 4: Create a Manual Traefik GatewayClass

```bash
vim 1-gatewayclass.yaml
```

```bash
apiVersion: gateway.networking.k8s.io/v1
kind: GatewayClass
metadata:
  name: traefik
spec:
  controllerName: traefik.io/gateway-controller
  description: "Manual Traefik GatewayClass"
```

```bash
kubectl apply -f 1-gatewayclass.yaml
```
```bash
kubectl get gatewayclass
```

## Steps 5: Gateway definition in 'dev' namespace
The Gateway listens on port 8000 for HTTP and accepts HTTPRoutes from all namespaces.

```bash
vim 2-traefik-gateway.yaml
```

```bash
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: traefik-gateway
  namespace: dev
spec:
  gatewayClassName: traefik
  listeners:
    - name: web
      protocol: HTTP
      port: 8000
      allowedRoutes:
        namespaces:
          from: All
```

**Apply the Gateway**
```bash
kubectl apply -f 2-traefik-gateway.yaml
```

## Steps 6: Application Deployment + Service in 'dev' namespace

```bash
├── employee-svc
│   ├── deploymeny.yaml
│   └── svc.yaml
├── frontend
│   ├── deploymeny.yaml
│   └── svc.yaml
├── ingress
│   ├── 0-traefik-values.yaml
│   ├── 1-gatewayclass.yaml
│   ├── 2-gateway.yaml
│   ├── 3-http-route.yaml
│   └── README.md
├── mongo-db
│   ├── README.md
│   ├── mongo-uri.yaml
│   ├── mongodb-sts.yaml
│   ├── secret.yaml
│   └── service.yaml
├── student-svc
│   ├── deploymeny.yaml
│   └── svc.yaml
└── teacher-svc
    ├── deploymeny.yaml
    └── svc.yam
```

## Steps 7: Apply Application HTTP Route

```bash
vim 3-http-route.yaml
```

```bash
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: frontend-route
  namespace: dev
spec:
  parentRefs:
    - name: traefik-gateway   # Must match your Gateway
      namespace: dev
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /
      backendRefs:
        - name: schoolmnmfe
          port: 80
    - matches:
        - path:
            type: PathPrefix
            value: /std
      backendRefs:
        - name: studentservice
          port: 80
    - matches:
        - path:
            type: PathPrefix
            value: /tech
      backendRefs:
        - name: teachersservice
          port: 80
    - matches:
        - path:
            type: PathPrefix
            value: /emp
      backendRefs:
        - name: employeeservice
          port: 80
```
```bash
kubectl apply -f 3-http-route.yaml
```