# Installing MetalLB Load Balancer on Kubernetes

This tutorial guides you through the installation of the MetalLB load balancer on your Kubernetes cluster. MetalLB provides a robust solution for LoadBalancer-type services in Kubernetes, offering a single IP address to route external requests to your applications.

**Load Balancers**

Load balancers are essential for exposing applications to the external network, providing a unified entry point for incoming requests. To enable Kubernetes services of type LoadBalancer, you must have a suitable load balancer implementation available for Kubernetes.

Load balancers can be implemented by a cloud provider as an external service (often incurring additional costs) or internally within the Kubernetes cluster using a software-based solution like MetalLB.

**MetalLB**  [Reference](https://metallb.universe.tf/concepts/)

MetalLB is a Kubernetes service implementation for LoadBalancer-type services. When a LoadBalancer service is requested, MetalLB dynamically allocates an IP address from the configured range and informs the network that the IP "lives" within the cluster.

MetalLB simplifies the process of providing external access to services running within your Kubernetes cluster. Follow the steps outlined in this tutorial to install MetalLB and enhance your Kubernetes cluster with efficient load balancing.

**MetalLB Installation Steps Here**

*If you’re using kube-proxy in IPVS mode, since Kubernetes v1.14.2 you have to enable strict ARP mode.*
You can achieve this by editing kube-proxy config in current cluster and Set ARP mode **true**. Find out this KubeProxyConfiguratuon block and change only **strictARP: true**

**Steps 1: Enable strict ARP mode**

`kubectl edit configmap -n kube-system kube-proxy`

```bash
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
mode: "ipvs"
ipvs:
  strictARP: true
```

**Steps 2: Install MetalLB CRD & Controller using the official manifests by MetalLB**  [Reference](https://metallb.universe.tf/installation/)

`kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.12/config/manifests/metallb-native.yaml`


**Steps 3: Layer 2 Configuration for to advertise the IP Pool**  [Reference](https://metallb.universe.tf/configuration/#layer-2-configuration)

`vim metallb-ipadd-pool.yaml`

```bash
apiVersion: metallb.io/v1beta1
kind: IPAddressPool
metadata:
  name: first-pool
  namespace: metallb-system
spec:
  addresses:
  - 192.168.1.240-192.168.1.250
```

`kubectl apply -f metallb-ipadd-pool.yaml`

**Steps 4: Advertise the IP Address Pool**

`vim metallb-pool-advertise.yaml`

```bash
apiVersion: metallb.io/v1beta1
kind: L2Advertisement
metadata:
  name: example
  namespace: metallb-system
spec:
  ipAddressPools:
  - first-pool
```

`kubectl apply -f metallb-pool-advertise.yaml`

---

🎉🎉🎉 Congratulations!!! 🎉🎉🎉
:-----------------: