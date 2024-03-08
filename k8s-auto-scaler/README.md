 Scalability is one of the core benefits of Kubernetes (K8s). In order to get the most out of this benefit (and use K8s effectively), you need a solid understanding of how Kubernetes autoscaling works.

 ## What is kubernetes autoscaler
 Autoscaling in Kubernetes refers to the automatic adjustment of resources in response to changes in workload demand. Kubernetes provides several mechanisms for autoscaling: 
- Including Horizontal Pod Autoscaling (HPA)
- Cluster Autoscaler, and Vertical Pod Autoscaler (VPA)
- Cluster Autoscaler

## Autoscaling dimensions Kubernetes
**Including Horizontal Pod Autoscaling (HPA):** Horizontal Pod Autoscaling (HPA) adjusts the number of replicas of a Kubernetes Deployment, ReplicaSet, or StatefulSet based on observed CPU or memory utilization. It ensures that your application has enough resources to handle increased traffic or usage and can automatically scale down when demand decreases, optimizing resource utilization and minimizing costs.

**Cluster Autoscaler, and Vertical Pod Autoscaler (VPA):** Vertical Pod Autoscaler (VPA) adjusts the resource requests and limits of individual containers within Pods based on historical resource usage. It optimizes resource allocation within Pods, ensuring that each container has adequate resources to operate efficiently without over-provisioning.

**Cluster Autoscaler:** Cluster Autoscaler, on the other hand, adjusts the number of nodes in a Kubernetes cluster based on resource utilization and pending Pods. It ensures that your cluster has enough capacity to run your workloads efficiently and can automatically scale up by provisioning new nodes or scale down by removing underutilized nodes.

**The different autoscalers work at one of two Kubernetes layers**

- Pod level: The HPA and VPA methods take place at the pod level. Both HPA and VPA will scale the available resources or instances of the container.
- Cluster level: The Cluster Autoscaler falls under the Cluster level, where it scales up or down the number of nodes inside your cluster.


## Horizontal Pod Autoscaling (HPA) Steps
We’ll work through the following steps one-by-one
1. Create a k8s cluster
2. Install the Metrics Server
3. Deploy a sample application
4. Install Horizontal Pod Autoscaler
5. Monitor HPA events
6. Decrease the load

**Steps 1:** Create a k8s cluster.\
If you don't already have a Kubernetes cluster, please follow the instructions provided in the [References](https://github.com/nasirnjs/kubernetes/tree/main/k8s-cluster-setup) to set up one efficiently.

**Steps 2:** Install the Metrics Server.\
Metrics Server can be installed either directly from YAML manifest or via the official [Helm chart](https://artifacthub.io/packages/helm/metrics-server/metrics-server). To install the latest Metrics Server release from the components.yaml manifest, run the following command. [References](https://github.com/kubernetes-sigs/metrics-server?tab=readme-ov-file#readme)

`kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml`

First, get the name of the Metric Server pod.\
`kubectl get pods -n kube-system | grep metrics-server`

If you want to see the top pods based on CPU.\
`kubectl top pods --sort-by cpu -A`

And to see the top pods based on memory usage.\
`kubectl top pods --sort-by memory`



**Steps 3:** Now create a Nginx deployment with Horizontal Pod Autoscaler (HPA) based on CPU usage

To check if your cluster supports autoscaling API version.\
`kubectl api-versions | grep autoscaling`

```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
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
        image: nginx
        resources:
          limits:
            cpu: "200m" # Set CPU resource limit
          requests:
            cpu: "100m" # Set CPU resource request
```

```bash
apiVersion: autoscaling/v1
kind: HorizontalPodAutoscaler
metadata:
  name: nginx-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: nginx-deployment
  minReplicas: 1
  maxReplicas: 5
  targetCPUUtilizationPercentage: 30
```

`kubectl autoscale deployment nginx-deployment --cpu-percent=50 --min=1 --max=10`
