Create a Pod with a seccomp profile for syscall auditing

Default seccom profile location is  `/var/lib/kubelet/seccomp/profiles`

`ls /var/lib/kubelet/seccomp/profiles`

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: audit-pod
  labels:
    app: audit-pod
spec:
  securityContext:
    seccompProfile:
      type: Localhost
      localhostProfile: profiles/audit.json
  containers:
  - name: test-container
    image: hashicorp/http-echo:1.0
    args:
    - "-text=just made some syscalls!"
    securityContext:
      allowPrivilegeEscalation: false
```