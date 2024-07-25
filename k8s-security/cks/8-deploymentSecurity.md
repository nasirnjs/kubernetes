Modify Deployment secdein the sec-ns namespace as follows:

- Start the container with a user ID of 30000 (set user ID to 30000).
- Do not allow processes to gain privileges beyond those of their parents (disable allowPrivilegeEscalation).
- Load the container's root filesystem as read-only (read-only permissions to the root file)


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
