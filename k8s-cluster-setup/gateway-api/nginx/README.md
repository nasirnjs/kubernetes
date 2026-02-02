
<h2> Deploying NGINX Gateway Fabric with HTTPRoute in Kubernetes </h2>

✅ Summary of Workflow
- Install CRDs → define Gateway API resources in cluster.
- Install controller → watches and implements routing.
- Create Gateway → define listener and entrypoint.
- Deploy backend app → service to route traffic to.
- Create HTTPRoute → connect Gateway → Service with rules.
- Test → verify HTTP requests reach the backend.


## Step 1: Install Gateway API CRDs
**Purpose:** Gateway API is not part of Kubernetes by default, so we need to install the CustomResourceDefinitions (CRDs) that define GatewayClass, Gateway, HTTPRoute, and other Gateway API resources.
```bash
kubectl kustomize "https://github.com/nginx/nginx-gateway-fabric/config/crd/gateway-api/standard?ref=v2.2.1" | kubectl apply -f -
```

Verify
```bash
kubectl get crds | grep gateway
```

## Step 2: Install NGINX Gateway Fabric (Controller)
**Purpose:** The controller watches Gateway API resources and actually implements routing in the cluster. Without it, Gateways and HTTPRoutes won’t function.
```bash
helm install ngf oci://ghcr.io/nginx/charts/nginx-gateway-fabric --create-namespace -n nginx-gateway
```
This installs the NGINX Gateway Fabric controller in the nginx-gateway namespace.

Verify
```bash
kubectl get deploy -n nginx-gateway
kubectl get gatewayclass
```

## Step 3: Create a Gateway
**Purpose:** A Gateway is the entrypoint for traffic into your cluster. It defines:
- Which controller manages it (gatewayClassName)
- Which ports/protocols it listens on
- Which namespaces’ HTTPRoutes are allowed to attach

Example: Listens on port 80 HTTP and allows routes from all namespaces.
```bash
apiVersion: gateway.networking.k8s.io/v1
kind: Gateway
metadata:
  name: dev-gateway
  namespace: nginx-gateway
spec:
  gatewayClassName: nginx
  listeners:
    - name: http
      protocol: HTTP
      port: 80
      allowedRoutes:
        namespaces:
          from: All
```


```bash
kubectl get gateway -n nginx-gateway
kubectl get svc -n nginx-gateway
```

## Step 4: Create a Sample Application and Namespace

```bash
kubectl create namespace development
```

```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-api
  namespace: development
spec:
  replicas: 1
  selector:
    matchLabels:
      app: todo-api
  template:
    metadata:
      labels:
        app: todo-api
    spec:
      containers:
        - name: todo-api
          image: hashicorp/http-echo
          args:
            - "-text=UP"
          ports:
            - containerPort: 5678
---
apiVersion: v1
kind: Service
metadata:
  name: todo-api-svc
  namespace: development
spec:
  selector:
    app: todo-api
  ports:
    - protocol: TCP
      port: 5678
      targetPort: 5678
```

## Step 5: Create HTTPRoute

**Purpose:** HTTPRoute defines how traffic from the Gateway is routed to backend services.

Key Points:
- parentRefs points to the Gateway that will handle the traffic (dev-gateway in nginx-gateway namespace).
- rules define path-based routing, e.g., /api/todos goes to todo-api-svc on port 5678.

```bash
apiVersion: gateway.networking.k8s.io/v1
kind: HTTPRoute
metadata:
  name: todo-api-route
  namespace: development
spec:
  parentRefs:
    - name: dev-gateway
      namespace: nginx-gateway
  rules:
    - matches:
        - path:
            type: PathPrefix
            value: /api/todos
      backendRefs:
        - name: todo-api-svc
          port: 5678
```

## Step 6: Test HTTP Access

```bash
curl http://192.168.61.72/api/todos
```

```bash
http://172.17.18.230/api/todos
```