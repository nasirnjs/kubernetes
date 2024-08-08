

Create a new ServiceAccount named backend-sa in the namespace qa, this ServiceAccount does not automatically mount API credentials.

`kubectl create namespace qa`

`kubectl create serviceaccount backend-sa -n qa --dry-run=client -o yaml`

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  creationTimestamp: null
  name: backend-sa
  namespace: qa
automountServiceAccountToken: false
```

Use the manifest file in /cks/sa/pod1.yaml to create a Pod.\
`vim /cks/sa/pod1.yaml`
```yaml
apiVersion: v1
kind: Pod
metadata:
  labels:
    run: web-server
  name: web-server
  namespace: qa
spec:
  serviceAccountName: backend-sa
  containers:
  - image: nginx
    name: web-server
```