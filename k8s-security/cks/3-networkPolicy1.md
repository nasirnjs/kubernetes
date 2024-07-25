Create a NetworkPolicy named pod-restriction to restrict access to the Pod products-service running in namespace dev-team.
Task:
Allow only the following Pods to connect to Pod products-service:
- Pods in namespace qa
- Pods in any namespace with the label environment: testing
---

`kubectl get pod products-service --show-labels`

`vim network-policy1.yaml`

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: pod-restriction
  namespace: dev-team
spec:
  podSelector:
    matchLabels:
      role: db
  policyTypes:
  - Ingress
  ingress:
  - from:
    - namespaceSelector:
        matchLabels:
          kubernetes.io/metadata.name: qa
    - podSelector:
        matchLabels:
          environment: testing
```