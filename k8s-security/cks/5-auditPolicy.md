
Enable audit logging in the cluster. To do this, enable the logging backend and make sure:
- Logs are stored in /var/log/kubernetes/audit-logs.txt
- Log files are retained for10 days
- Up to 2 old audit log files are retained

/etc/kubernetes/logpolicy/sample-policy.yaml provides the basic policy. It specifies only what not to log

Edit and extend the base policy to log:
- Changes to persistentvolume sat the RequestResponse level
- Request bodies for configmaps changes in namespace  front-apps
- Changes to ConfigMap and Secret in all namespaces at the Metadata level.
- In addition, add a catch-all rule to log all other requests at the Metadatalevel.
---

`vim /etc/kubernetes/logpolicy/sample-policy.yaml`
```yaml
apiVersion: audit.k8s.io/v1
kind: Policy
rules:
  - level: RequestResponse
    resources:
    - group: ""
      resources: ["persistentvolume"]
  - level: Metadata
    omitStages:
      - "RequestReceived"
  - level: Request
    resources:
    - group: ""
      resources: ["configmaps"]
    namespaces: ["front-apps"]
  - level: Metadata
    resources:
    - group: ""
      resources: ["secrets", "configmaps"]
```

Update Kube-API Server.\
`vim /etc/kubernetes/manifests/kube-apiserver.yaml`



```yaml
    - --audit-policy-file=/etc/kubernetes/logpolicy/sample-policy.yaml
    - --audit-log-path=/var/log/kubernetes/audit-logs.log
    - --audit-log-maxage=10
    - --audit-log-maxbackup=2
    volumeMounts:
    - mountPath: /etc/kubernetes/logpolicy/sample-policy.yaml
      name: audit
      readOnly: true
    - mountPath: /var/log/kubernetes/audit-logs.log
      name: audit-log
      readOnly: false
  volumes:
  - name: audit
    hostPath:
      path: /etc/kubernetes/logpolicy/sample-policy.yaml
      type: File
  - name: audit-log
    hostPath:
      path: /var/log/kubernetes/audit-logs.log
      type: FileOrCreate
```