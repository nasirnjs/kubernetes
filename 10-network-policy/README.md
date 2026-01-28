
## What is a Kubernetes NetworkPolicy?
A NetworkPolicy is how you control who can talk to whom inside a Kubernetes cluster — at pod level, using rules for:
- Ingress (incoming traffic)
- Egress (outgoing traffic)
- Think of it as a firewall for pods 🔥🛡️

## Important thing (people miss this 👀)
NetworkPolicy does nothing by itself unless, your cluster uses a NetworkPolicy-aware CNI.
- ✅ Calico
- ✅ Cilium
- ✅ Weave
- ❌ Flannel (default) → no enforcement

## Default Behavior
- By default → ALL pods can talk to ALL pods
- Once you apply a NetworkPolicy to a pod:
- That pod becomes isolated
- Only explicitly allowed traffic is permitted

## Types of Traffic Controls
1️⃣ Ingress (Who can access this pod)
```bash
policyTypes:
- Ingress
```
2️⃣ Egress (Where this pod can go)
```bash
policyTypes:
- Egress
```
3️⃣ Both
```bash
policyTypes:
- Ingress
- Egress
```
## 🧪 Scenario
- Frontend nginx pod
- Backend nginx pod
- Frontend CAN access Backend
- Others CANNOT
- Test with curl (ping is ICMP — note below 👀)

## Frontend Pod Test (❌ SHOULD SUCCESS)

` kubectl exec -it frontend-6bb8d4bbdb-t75t4 -- /bin/bash`

```bsh
apt update && apt install -y iputils-ping curl
curl http://backend-service.default.svc.cluster.local
kubectl exec -it <frontend-pod> -- curl http://backend-service.default.svc.cluster.local
```

## Random Pod Test (❌ SHOULD FAIL)

`kubectl run random-pod --image=nginx --restart=Never -it -- bash`

```bash
apt update
apt install -y curl iputils-ping
```

```bash
curl http://backend-service.default.svc.cluster.local
ping backend-service.default.svc.cluster.local
```


## Multi NameSpace
Add label name=erp to the ERP namespace.\
`kubectl label namespace erp name=erp`

Add label name=un-known to the un-known namespace.\
`kubectl label namespace un-known name=un-known`

Verify the labels on all namespaces.\
`kubectl get namespaces --show-labels`


```bash
apt-get update
apt-get install -y iputils-ping
```


✅ Summary:
- Same namespace: yes, only podSelector is enough.
- Different namespace: you must use namespaceSelector + podSelector