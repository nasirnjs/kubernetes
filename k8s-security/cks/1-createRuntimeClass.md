


`vim runtimeclass.yaml`
```yaml
apiVersion: node.k8s.io/v1
kind: RuntimeClass
metadata:
  name: untrusted 
handler: runc
```

`vim /cks/gVisor/rc.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: web-server
  name: web-server
spec:
  runtimeClassName: untrusted
  containers:
  - image: nginx
    name: web-server
```

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      runtimeClassName: untrusted
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
```
