

## Step 1: Install Gateway API CRDs
Gateway API is not native, so first install CRDs:
```bash
kubectl kustomize "https://github.com/nginx/nginx-gateway-fabric/config/crd/gateway-api/standard?ref=v2.2.1" | kubectl apply -f -
```

```bash
kubectl get crds | grep gateway
```

## Step 2: Install NGINX Gateway Fabric (Controller)
Use Helm to install NGINX Gateway Fabric:
```bash
helm install ngf oci://ghcr.io/nginx/charts/nginx-gateway-fabric --create-namespace -n nginx-gateway
```

```bash
kubectl get deploy -n nginx-gateway
kubectl get gatewayclass
```

## Step 3: Create a Gateway


```bash
kubectl get gateway -n nginx-gateway
kubectl get svc -n nginx-gateway
```

## Step 4: Create a Sample Application

```bash
# todo-api-deployment.yaml
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
            - containerPort: 8000
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
      port: 8000
      targetPort: 8000
```

## Step 5: Create HTTPRoute
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
          port: 8000
```

## Step 6: Test HTTP Access

```bash
curl http://192.168.61.72/api/todos
```