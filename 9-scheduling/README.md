
## nodeSelector

`kubectl get node k8-worker1 --show-labels `

`kubectl label nodes k8-worker1 environment=production`

To schedule a pod only on nodes with disktype=ssd, you would use a nodeSelector in your pod's YAML specification. *Yaml file 1-assign-pod-node-depl.yaml*

`kubectl get node k8-worker1 --show-labels`

If you want to remove the environment=production label from k8-worker1, you would execute.\
`kubectl label nodes k8-worker1 environment-`

After removing the labels, you can verify that the labels have been successfully removed by running.\
`kubectl get node k8-worker1 --show-labels`

## Affinity and anti-affinity
[References](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#operators)

1. In Operator:
Behavior: The label value is present in the supplied set of strings.
Example: Suppose you have pods labeled with app: frontend, app: backend, and app: database, and you want to schedule a new pod next to the ones labeled frontend or backend.
```yaml
affinity:
  podAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
        matchExpressions:
        - key: app
          operator: In
          values:
          - frontend
          - backend
    topologyKey: kubernetes.io/hostname
```
Explanation: This affinity rule ensures that the new pod will be scheduled onto a node that already has pods labeled either app: frontend or app: backend

2. NotIn Operator:
Behavior: The label value is not contained in the supplied set of strings.
Example: Suppose you have pods labeled with tier: frontend, tier: backend, and tier: cache, and you want to ensure that a new pod is not scheduled next to the ones labeled cache.
```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: tier
            operator: NotIn
            values:
            - cache
        topologyKey: kubernetes.io/hostname
```
Explanation: This anti-affinity rule prefers scheduling the new pod away from nodes with pods labeled tier: cache.

3. Exists Operator:
Behavior: A label with this key exists on the object.
Example: Suppose you want to schedule a new pod only on nodes that have a specific label, say environment: production.
```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchExpressions:
          - key: environment
            operator: Exists
        topologyKey: kubernetes.io/hostname
```
4. DoesNotExist Operator:
Behavior: The DoesNotExist operator is used in label selectors to specify that no label with the specified key exists on the object.
Example: This configuration ensures that pods scheduled by the Deployment will preferably be placed on nodes where other pods do not have the environment label, thereby enforcing anti-affinity based on the absence of the environment label.
```yaml
affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: environment
                operator: DoesNotExist
            topologyKey: kubernetes.io/hostname
```

### DoesNotExist Operator:
- **Purpose**: Specifies that no label with the specified key exists on the object.
- **Example Use Case**: You might use `DoesNotExist` to avoid scheduling pods on nodes that do not have a certain label, such as avoiding scheduling pods on nodes without the label `environment`.
- **Behavior**: Ensures that the absence of the specified label key is a requirement for pod scheduling.

### NotIn Operator:
- **Purpose**: Specifies that the label value is not contained in the supplied set of strings.
- **Example Use Case**: You might use `NotIn` to avoid scheduling pods next to nodes labeled with certain values, such as avoiding scheduling pods next to nodes labeled `cache`.
- **Behavior**: Checks for the absence of specific label values within the supplied set of strings. It does not specifically check for the absence of the label itself but rather for specific values.

## Taints and Tolerations

### Taints
Taints and tolerations work together to ensure that pods are not scheduled onto inappropriate nodes. One or more taints are applied to a node; this marks that the node should not accept any pods that do not tolerate the taints.

Effects explained:
**- NoSchedule:** Pods cannot be scheduled on this node unless they tolerate the taint.
**- PreferNoSchedule:** Kubernetes tries to avoid scheduling pods without toleration, but it may schedule them if necessary.
**- NoExecute:** Pods without toleration are evicted immediately if running, and new pods cannot schedule.

### Tolerations
Tolerations are applied to pods. Tolerations allow the scheduler to schedule pods with matching taints. Tolerations allow scheduling but don't guarantee scheduling: the scheduler also evaluates other parameters as part of its function.

- Applied to: Pods
- Purpose: Tolerations allow a pod to be scheduled on nodes with matching taints.


**Operator:** The operator in a toleration defines how the toleration matches a node’s taint.

**1. Equal**
- The pod tolerates a taint only if both the key AND value match exactly.
- Use when you want the pod to tolerate a specific taint on a node.

**2. Exists**
- The pod tolerates a taint if the key exists, ignoring the value.
- Use when you want the pod to tolerate any value for a given key, or all taints if the key is empty.
- flexible matching (key only or all keys if key is empty)


**NoSchedule Example: Dedicated nodes for certain workloads (e.g., GPU nodes)**

`kubectl taint nodes worker-2 dedicated=backend:NoSchedule`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
  labels:
    app: nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:alpine-perl
        ports:
        - containerPort: 80
      tolerations:
      - key: "dedicated"
        operator: "Equal"
        value: "backend"
        effect: "NoSchedule"
```
Check nginx-deployment pods tolerations.\
`kubectl describe pod nginx-deployment | grep -A5 Tolerations`

`kubectl drain worker-1 --ignore-daemonsets --delete-emptydir-data`

`kubectl run nginx-pod --image=nginx --restart=Never`

To remove a taint from a node and check nginx-pod is schedule to worker-2.\
`kubectl taint nodes worker-2 dedicated=backend:NoSchedule-`

Schedule pods on worker-1 again need to uncordon.\
`kubectl uncordon worker-1`

**PreferNoSchedule Example: Scheduler tries to avoid placing pods on this node.**

`kubectl taint nodes worker-1 optimized=high:PreferNoSchedule`

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-prefer
  labels:
    app: nginx
spec:
  replicas: 1
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:alpine-perl
        ports:
        - containerPort: 80
      tolerations:
      - key: "optimized"
        operator: "Exists"
        effect: "PreferNoSchedule"
```
If no other nodes are available or resources require it, the pod may still schedule here.

To remove a taint from a node.\
`kubectl taint nodes worker-1 optimized:PreferNoSchedule-`


**NoExecute Example**

`kubectl create deployment my-app --image=nginx --replicas=2`


`kubectl taint nodes worker-2 maintenance=true:NoExecute`

``


[Reference](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)