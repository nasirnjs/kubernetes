- To retrieve the contents of an existing secret in namespace istio-system named db1-test
- Store the username field in a file named /cks/sec/user.txt and store the password field in a file named /cks/sec/pass.txt.

Create a new secret named db2-test in istio-system namespace with the following contents:
- username : production-instance
- password : KvLftKgs4aVH

create a new Pod that can access the secret db2-test via a volume:

- Pod namesecret-pod
- Namespac eistio-system
- container namedev-container
- mirror image nginx
- volume namesecret-volume
- mount path/etc/secret
---


`kubectl create secret generic db2-test --from-literal=username=production-instance --from-literal=password=KvLftKgs4aVH -n istio-system`

`kubectl run namesecret-pod --image nginx -n eistio-system --dry-run=client -o yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  creationTimestamp: null
  labels:
    run: namesecret-pod
  name: namesecret-pod
  namespace: eistio-system
spec:
  volumes:
    - name: secret-volume
      secret:
        secretName: db2-test
  containers:
  - image: nginx
    name: namedev-container
    volumeMounts:
        - name: secret-volume
          readOnly: true
          mountPath: "/etc/secret"
```