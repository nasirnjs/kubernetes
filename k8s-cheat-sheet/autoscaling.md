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

**Horizontal Pod Autoscaling (HPA) Steps**