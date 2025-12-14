
## Steps 1: Create a namespace for your app
Namespace dev will host your Gateway, HTTPRoute, and Nginx app.
```yaml
kubectl create namespace dev
```


## Steps 2: Create Traefik values file
This file configures Traefik via Helm. Gateway API is enabled, Ingress is disabled, and routes from all namespaces are allowed.
```yaml
vim traefik-values.yaml
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
  --version 37.1.1 \
  -n traefik --create-namespace \
  -f traefik-values.yaml
```

```
helm list -n traefik
helm status traefik -n traefik
```

## Steps 4: Create a Manual Traefik GatewayClass

```bash
vim gatewayclass.yaml
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
kubectl apply -f gatewayclass.yaml
```

## Steps 5: Gateway definition in 'dev' namespace
The Gateway listens on port 8000 for HTTP and accepts HTTPRoutes from all namespaces.
```bash
kubectl get gatewayclass
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
kubectl apply -f traefik-gateway.yaml
```

## Steps 6: Nginx Deployment + Service in 'dev' namespace
This deploys Nginx with 2 replicas and exposes it via a ClusterIP service.
```bash
vim nginx-deployment.yaml
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
  namespace: dev
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
        - name: nginx
          image: nginx:stable
          ports:
            - containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: nginx-svc
  namespace: dev
spec:
  selector:
    app: nginx
  ports:
    - port: 80
      targetPort: 80
```
```bash
kubectl apply -f nginx-deployment.yaml
```


## Steps 7: Create HTTPRoute to connect Gateway to Nginx
The HTTPRoute points to the Nginx service. No hostname is required if you don’t have a domain.
```bash
vim http-route.yaml
```

```bash
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: nginx-route
  namespace: dev
spec:
  parentRefs:
    - name: traefik-gateway   # Must match the Gateway name
      namespace: dev          # Must match Gateway namespace
  # hostnames:
  #   - nginx.dev.nasirtechtalks.com
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /           # Catch all paths
      backendRefs:
        - name: nginx-svc      # Service to route to
          port: 80
```

```bash
kubectl apply -f http-route.yaml
```

## Notes
- Ensure the Gateway listener port matches the port configured in Traefik Helm values.
- namespacePolicy: All allows HTTPRoutes from any namespace.

For debugging, use:
```bash
kubectl get gateway -n dev
kubectl describe gateway dev-gateway -n dev
kubectl describe httproute nginx-route -n dev
kubectl get pods -n dev
```


[References-Values](https://github.com/traefik/traefik-helm-chart/blob/master/traefik/values.yaml)
