<h2>Installing MetalLB Load Balancer on Kubernetes</h2>

**Table of Contents**

- [What Do MetalLV Load Balancers Do in Kubernetes?](#what-do-metallv-load-balancers-do-in-kubernetes)
- [How MetalLB L2 Mode Works](#how-metallb-l2-mode-works)
- [MetalLB Installation Steps Here](#metallb-installation-steps-here)
- [Steps 1: Enable strict ARP mode](#steps-1-enable-strict-arp-mode)
- [Steps 2: Install MetalLB CRD \& Controller using the official manifests by MetalLB](#steps-2-install-metallb-crd--controller-using-the-official-manifests-by-metallb)
- [Steps 3: Layer 2 Configuration for to advertise the IP Pool](#steps-3-layer-2-configuration-for-to-advertise-the-ip-pool)
- [Steps 4: Advertise the IP Address Pool](#steps-4-advertise-the-ip-address-pool)
- [Steps 4: Expose server via LoadBalancer](#steps-4-expose-server-via-loadbalancer)


This tutorial guides you through the installation of the MetalLB load balancer on your Kubernetes cluster. MetalLB provides a robust solution for LoadBalancer-type services in Kubernetes, offering a single IP address to route external requests to your applications.

## What Do MetalLV Load Balancers Do in Kubernetes?
Load balancers are essential for exposing applications to the external network, providing a unified entry point for incoming requests. To enable Kubernetes services of type LoadBalancer, you must have a suitable load balancer implementation available for Kubernetes.

Load balancers can be implemented by a cloud provider as an external service (often incurring additional costs) or internally within the Kubernetes cluster using a software-based solution like MetalLB.

**MetalLB**  [Reference](https://metallb.universe.tf/concepts/)

MetalLB is a Kubernetes service implementation for LoadBalancer-type services. When a LoadBalancer service is requested, MetalLB dynamically allocates an IP address from the configured range and informs the network that the IP "lives" within the cluster.

MetalLB simplifies the process of providing external access to services running within your Kubernetes cluster. Follow the steps outlined in this tutorial to install MetalLB and enhance your Kubernetes cluster with efficient load balancing.

## How MetalLB L2 Mode Works

- ARP Announcements: In L2 mode, MetalLB uses ARP (Address Resolution Protocol) to announce service IPs to the local network. When a service is assigned an IP from MetalLB's pool, the MetalLB speaker sends out ARP responses to make the network aware that this IP is available on a specific node.

- IP Address Allocation: MetalLB assigns an IP address from a predefined pool to a service. This IP address is then used by the service, and MetalLB ensures that traffic destined for this IP is sent to the correct node.

## MetalLB Installation Steps Here

*If you’re using kube-proxy in IPVS mode, since Kubernetes v1.14.2 you have to enable strict ARP mode.*
You can achieve this by editing kube-proxy config in current cluster and Set ARP mode **true**. Find out this KubeProxyConfiguratuon block and change only **strictARP: true**

## Steps 1: Enable strict ARP mode

`kubectl edit configmap -n kube-system kube-proxy`

```bash
apiVersion: kubeproxy.config.k8s.io/v1alpha1
kind: KubeProxyConfiguration
mode: "ipvs"
ipvs:
  strictARP: true
```

## Steps 2: Install MetalLB CRD & Controller using the official manifests by MetalLB
[Reference](https://metallb.universe.tf/installation/)

`kubectl apply -f https://raw.githubusercontent.com/metallb/metallb/v0.13.12/config/manifests/metallb-native.yaml`


## Steps 3: Layer 2 Configuration for to advertise the IP Pool
[Reference](https://metallb.universe.tf/configuration/#layer-2-configuration)

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

## Steps 4: Advertise the IP Address Pool

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

## Steps 4: Expose server via LoadBalancer

`kubectl run nginx-deployment --image=nginx --port=80`

`kubectl expose deployment nginx-deployment --type=LoadBalancer --name=nginx-service`

`kubectl get svc`

---

🎉🎉🎉 Congratulations!!! 🎉🎉🎉
:-----------------: