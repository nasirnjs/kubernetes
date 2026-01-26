<h2> Scheduling, Preemption and Eviction</h2>

- [NodeSelector](#nodeselector)
- [Pod Affinity and anti-affinity](#pod-affinity-and-anti-affinity)
  - [Pod Affinity](#pod-affinity)
    - [Definition](#definition)
    - [Use Case](#use-case)
    - [What This Does](#what-this-does)
    - [Pod Affinity (Preferred)](#pod-affinity-preferred)
    - [What This Does](#what-this-does-1)
  - [Pod Anti-Affinity](#pod-anti-affinity)
    - [Definition](#definition-1)
    - [Use Case](#use-case-1)
    - [What This Does](#what-this-does-2)
    - [Pod Anti-Affinity (Preferred)](#pod-anti-affinity-preferred)
    - [What This Does](#what-this-does-3)
  - [Node Affinity](#node-affinity)
    - [Definition](#definition-2)
    - [Use Case](#use-case-2)
    - [Step 1: Label the Node](#step-1-label-the-node)
    - [Step 2: Node Affinity Example](#step-2-node-affinity-example)
    - [What This Does](#what-this-does-4)
  - [Quick Comparison Table](#quick-comparison-table)
  - [Key Takeaway](#key-takeaway)
    - [DoesNotExist Operator:](#doesnotexist-operator)
    - [NotIn Operator:](#notin-operator)
- [Kubernetes Taints \& Tolerations](#kubernetes-taints--tolerations)
  - [NoSchedule Example](#noschedule-example)
    - [Taint Node](#taint-node)
    - [Deployment YAML](#deployment-yaml)
    - [Remove Taint](#remove-taint)
  - [PreferNoSchedule Example](#prefernoschedule-example)
    - [Taint Node](#taint-node-1)
    - [Deployment YAML](#deployment-yaml-1)
    - [Remove Taint](#remove-taint-1)
  - [NoExecute Example](#noexecute-example)
    - [Taint Node](#taint-node-2)
    - [Deployment YAML](#deployment-yaml-2)
    - [Remove Taint](#remove-taint-2)
  - [Key Points](#key-points)



# NodeSelector

`kubectl get node k8-worker1 --show-labels `

`kubectl label nodes k8-worker1 environment=production`

To schedule a pod only on nodes with disktype=ssd, you would use a nodeSelector in your pod's YAML specification. *Yaml file 1-assign-pod-node-depl.yaml*

`kubectl get node k8-worker1 --show-labels`

If you want to remove the environment=production label from k8-worker1, you would execute.\
`kubectl label nodes k8-worker1 environment-`

After removing the labels, you can verify that the labels have been successfully removed by running.\
`kubectl get node k8-worker1 --show-labels`

# Pod Affinity and anti-affinity
[References](https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/#operators)

## Pod Affinity

### Definition
- Pod affinity ensures that a pod is scheduled on a node that already has other pods with specific labels.

### Use Case
- Co-locate services that communicate frequently for low latency.
- Example: A backend pod that should be close to a frontend pod.

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
      topologyKey: kubernetes.io/hostname
```

### What This Does
- Schedules the pod on a node that already has a pod with `app=frontend`.
- If no such node exists, the pod stays **Pending**.
- `topologyKey: kubernetes.io/hostname` ensures co-location on the same node.
- This is a **hard scheduling rule**.
```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: nginx
        ports:
        - containerPort: 80
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      affinity:
        podAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - frontend
            topologyKey: kubernetes.io/hostname
      containers:
      - name: backend
        image: nginx
        ports:
        - containerPort: 8080
```
✅ What This Does:
- The frontend deployment creates 2 pods labeled app=frontend.
- The backend deployment has podAffinity set with requiredDuringSchedulingIgnoredDuringExecution.
- Kubernetes will schedule the backend pod on a node that already has at least one frontend pod.
- If no node has a frontend pod, the backend pod will stay Pending until one becomes available.
- topologyKey: kubernetes.io/hostname ensures this happens on the same node, not just in the same zone or cluster

### Pod Affinity (Preferred)

```yaml
affinity:
  podAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchLabels:
            app: frontend
        topologyKey: kubernetes.io/hostname
```

### What This Does
- Kubernetes **tries** to place the pod near frontend pods.
- If not possible, the pod still schedules.
- This is a **soft scheduling rule**.

## Pod Anti-Affinity

### Definition
- Pod anti-affinity ensures that a pod is scheduled on a node that does **NOT** have other pods with specific labels.

### Use Case
- Spread replicas of a service for high availability.
- Example: Avoid placing multiple frontend replicas on the same node.

```yaml
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
    - labelSelector:
        matchExpressions:
        - key: app
          operator: In
          values:
          - frontend
      topologyKey: kubernetes.io/hostname
```

### What This Does
- Prevents the pod from being scheduled on nodes that already have `app=frontend`.
- Helps avoid single points of failure.
- This is a **hard scheduling rule**.

```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      affinity:
        podAntiAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
          - labelSelector:
              matchExpressions:
              - key: app
                operator: In
                values:
                - frontend
            topologyKey: kubernetes.io/hostname
      containers:
      - name: frontend
        image: nginx
        ports:
        - containerPort: 80
```
✅ What This Does:
- Creates 3 frontend pods with the label app=frontend.
- Pod Anti-Affinity ensures that no two frontend pods will run on the same node (topologyKey: kubernetes.io/hostname).
- If the cluster has fewer nodes than replicas, some pods will remain Pending until a suitable node becomes available.
- This improves high availability and reduces the risk of a single node failure affecting all replicas.
- requiredDuringSchedulingIgnoredDuringExecution is a hard rule — it will not schedule a pod if the rule cannot be satisfied.

### Pod Anti-Affinity (Preferred)

```yaml
affinity:
  podAntiAffinity:
    preferredDuringSchedulingIgnoredDuringExecution:
    - weight: 100
      podAffinityTerm:
        labelSelector:
          matchLabels:
            app: frontend
        topologyKey: kubernetes.io/hostname
```

### What This Does
- Kubernetes tries to avoid nodes with `app=frontend`.
- Pod still schedules if unavoidable.
- This is a **soft scheduling rule**.


## Node Affinity

### Definition
- Node affinity ensures that a pod is scheduled **only on nodes with specific labels**.

### Use Case
- Run workloads on specific hardware or node pools.
- Example: GPU workloads, high-memory nodes.

### Step 1: Label the Node

```bash
kubectl label nodes <node-name> gpu=true
```

### Step 2: Node Affinity Example

```yaml
affinity:
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
      - matchExpressions:
        - key: gpu
          operator: In
          values:
          - "true"
```

### What This Does
- Pod is scheduled only on nodes labeled `gpu=true`.
- If no such node exists, pod remains **Pending**.

```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: test-node-affinity
spec:
  replicas: 2
  selector:
    matchLabels:
      app: test-node-affinity
  template:
    metadata:
      labels:
        app: test-node-affinity
    spec:
      affinity:
        nodeAffinity:
          requiredDuringSchedulingIgnoredDuringExecution:
            nodeSelectorTerms:
            - matchExpressions:
              - key: gpu
                operator: In
                values:
                - "true"
      containers:
      - name: test-container
        image: nginx
        ports:
        - containerPort: 80
```

✅ What This Does:
- Node Labeling: Only nodes with gpu=true can run this pod.
- The deployment requests 2 replicas of gpu-app.
- Node Affinity ensures pods do not schedule on nodes without GPUs.
- If no node has the label gpu=true, pods will remain Pending until a labeled node is available.
- This is useful for workloads that require specific hardware like GPUs, high-memory, or SSD nodes.


## Quick Comparison Table

| Affinity Type       | Looks At | Node Labels Needed? | Effect                                | Example Use Case |
|--------------------|----------|--------------------|---------------------------------------|-----------------|
| Pod Affinity       | Pods     | ❌ No              | Schedule near specific pods           | Backend near frontend |
| Pod Anti-Affinity  | Pods     | ❌ No              | Avoid nodes with specific pods        | Spread frontend replicas |
| Node Affinity      | Nodes    | ✅ Yes             | Schedule only on labeled nodes        | GPU workloads |


## Key Takeaway

- **Pod Affinity** → bring pods together  
- **Pod Anti-Affinity** → keep pods apart  
- **Node Affinity** → choose where pods are allowed to run


### DoesNotExist Operator:
- **Purpose**: Specifies that no label with the specified key exists on the object.
- **Example Use Case**: You might use `DoesNotExist` to avoid scheduling pods on nodes that do not have a certain label, such as avoiding scheduling pods on nodes without the label `environment`.
- **Behavior**: Ensures that the absence of the specified label key is a requirement for pod scheduling.

### NotIn Operator:
- **Purpose**: Specifies that the label value is not contained in the supplied set of strings.
- **Example Use Case**: You might use `NotIn` to avoid scheduling pods next to nodes labeled with certain values, such as avoiding scheduling pods next to nodes labeled `cache`.
- **Behavior**: Checks for the absence of specific label values within the supplied set of strings. It does not specifically check for the absence of the label itself but rather for specific values.


# Kubernetes Taints & Tolerations

Taints and tolerations work together to control pod scheduling in Kubernetes.

- **Taints**: Applied to nodes to repel pods.
- **Tolerations**: Applied to pods to allow scheduling on tainted nodes.

## NoSchedule Example
**Goal:** Prevent pods from scheduling on certain nodes unless they tolerate the taint.

### Taint Node
```bash
kubectl taint nodes tmp-nabil5 dedicated=backend:NoSchedule
```

### Deployment YAML
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
        image: nginx:alpine
        ports:
        - containerPort: 80
      tolerations:
      - key: "dedicated"
        operator: "Equal"
        value: "backend"
        effect: "NoSchedule"
```

### Remove Taint
```bash
kubectl taint nodes tmp-nabil5 dedicated=backend:NoSchedule-
```

## PreferNoSchedule Example
**Goal:** Scheduler tries to avoid node but may place pods if necessary.

### Taint Node
```bash
kubectl taint nodes tmp-nabil4 optimized=high:PreferNoSchedule
```

### Deployment YAML
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
        image: nginx:alpine
        ports:
        - containerPort: 80
      tolerations:
      - key: "optimized"
        operator: "Exists"
        effect: "PreferNoSchedule"
```

### Remove Taint
```bash
kubectl taint nodes tmp-nabil4 optimized:PreferNoSchedule-
```

## NoExecute Example
**Goal:** Evict pods that don’t tolerate the taint and prevent new pods from scheduling.

### Taint Node
```bash
kubectl taint nodes tmp-nabil3 maintenance=true:NoExecute
```

### Deployment YAML
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
  labels:
    app: my-app
spec:
  replicas: 2
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-app-container
        image: nginx:alpine
        ports:
        - containerPort: 80
      tolerations:
      - key: "maintenance"
        operator: "Exists"
        effect: "NoExecute"
```

### Remove Taint
```bash
kubectl taint nodes tmp-nabil3 maintenance:NoExecute-
```

## Key Points

| Effect            | Node Behavior                          | Pod Behavior                                      |
|------------------|----------------------------------------|--------------------------------------------------|
| NoSchedule        | Reject pods without toleration         | Pods with toleration can schedule               |
| PreferNoSchedule  | Avoid scheduling if possible           | Scheduler may still place pods if needed        |
| NoExecute         | Evict pods without toleration          | Pods with toleration can stay or schedule       |



[Reference](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)