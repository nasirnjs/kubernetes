# Namespaces, Kubectx and Kubens

In Kubernetes, namespaces provides a mechanism for isolating groups of resources within a single cluster. Names of resources need to be unique within a namespace, but not across namespaces. Namespace-based scoping is applicable only for namespaced objects (e.g. Deployments, Services, etc) and not for cluster-wide objects (e.g. StorageClass, Nodes, PersistentVolumes, etc).

## Working with Namespaces in Kubernetes

How many Namespaces exist on the system?.\
`kubectl get namespace --no-headers | wc -l`

Create Name Space dev-ns.\
`kubectl create ns dev-ns`

How many pods exist in dev-ns?.\
`kubectl get pods --namespace=dev-ns`

How to switch namespace in kubernetes.\
`kubectl config set-context --current --namespace=dev-ns`

Create deployment with dev-ns Namespace.\
`kubectl create deployment redis-deploy --image=redis --replicas=2 -n=dev-ns`

List all pods in all namespaces, with more details.\
`kubectl get pods -o wide -n dev-ns`

List all pods in all namespaces, with more details.\
`kubectl get pods -o wide --all-namespaces`


---

## Kubectx & Kubens

**kubectx**  Streamlining Cluster Navigation Kubectx allows you to switch between Kubernetes clusters effortlessly.\
**Kubens**  Efficient Namespace Switching With Kubens, you can easily switch between namespaces. Similar to Kubectx, you can use the kubens command followed by the namespace name.

[Install Reference](https://github.com/ahmetb/kubectx) Stable versions of kubectx and kubens are small [bash scripts](https://github.com/ahmetb/kubectx?tab=readme-ov-file#manual-installation-macos-and-linux) that you can find in this repository

**Install** kubectx Install via `snap` on Ubuntu 20.04 Lts or 22.04 Lts.\
`snap install kubectx --classic`

**Examples**\
Switch to another cluster that's in kubeconfig,Switched to context **minikube**.\
`kubectx minikube`

Switch back to previous cluster, Switched to context **oregon**.\
`kubectx -`

Rename context `gke_ahmetb_europe-west1-b_dublin` renamed to **dublin** .\
`kubectx dublin=gke_ahmetb_europe-west1-b_dublin`

Change the active namespace on kubectl, Active namespace is **kube-system** .\
`kubens kube-system`

Go back to the previous namespace, Active namespace is **default** .\
`kubens -`

**Conclusion:** Kubectx and Kubens are powerful tools that simplify the management of Kubernetes clusters and namespaces. These tools enhance productivity, collaboration, and troubleshooting capabilities by providing an intuitive way to navigate contexts, switch namespaces, and streamline operations. Whether you are a Kubernetes beginner or an experienced operator, integrating Kubectx and Kubens into your day-to-day operations will improve your workflow and make your life easier.