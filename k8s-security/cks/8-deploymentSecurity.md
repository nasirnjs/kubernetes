

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  creationTimestamp: null
  labels:
    app: secdep2
  name: secdep2
spec:
  replicas: 2
  selector:
    matchLabels:
      app: secdep2
  strategy: {}
  template:
    metadata:
      creationTimestamp: null
      labels:
        app: secdep2
    spec:
      containers:
      - image: nginx
        name: nginx
        securityContext:
            runAsUser: 3000
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false
      - image: mysql
        name: nginx
        securityContext:
            runAsUser: 3000
            readOnlyRootFilesystem: true
            allowPrivilegeEscalation: false

```
