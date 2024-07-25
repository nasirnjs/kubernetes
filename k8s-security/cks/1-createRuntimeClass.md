


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