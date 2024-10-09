
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
Taints and tolerations work together to ensure that pods are not scheduled onto inappropriate nodes. One or more taints are applied to a node; this marks that the node should not accept any pods that do not tolerate the taints.

Tolerations are applied to pods. Tolerations allow the scheduler to schedule pods with matching taints. Tolerations allow scheduling but don't guarantee scheduling: the scheduler also evaluates other parameters as part of its function.

You add a taint to a node using kubectl tain.\
`kubectl taint nodes node1 key1=value1:NoSchedule`

To remove the taint added by the command above, you can run.\
`kubectl taint nodes node1 key1=value1:NoSchedule-`

[Reference](https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/)