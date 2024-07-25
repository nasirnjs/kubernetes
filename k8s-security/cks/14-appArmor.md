- On the cluster's worker node node02, implement the existing APPArmor profile located at /etc/apparmor.d/nginx_apparmor.

- Edit the existing manifest file located at /cks/KSSH00401/nginx-deploy.yaml to apply the AppArmor configuration file.

- Finally, apply the manifest file and create the Pod specified in it.

---
`ssh node02`

`cat /etc/apparmor.d/nginx_apparmor`

`apparmor_parser /etc/apparmor.d/nginx_apparmor`

`vim /cks/KSSH00401/nginx-deploy.yaml`

```yaml
apiVersion: v1
kind: Pod
metadata:
  annotations:
    container.apparmor.security.beta.kubernetes.io/web-server: localhost/nginx-profile
  labels:
    run: web-server
  name: web-server
spec:
  containers:
  - image: nginx
    name: web-server
```
