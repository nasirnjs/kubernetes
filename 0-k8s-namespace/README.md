<h2> Kubernetes Namespace and kubectx + kubens</h2>

**Table of Contents**
- [Kubernetes Namespace](#kubernetes-namespace)
- [Namespaces benefits](#namespaces-benefits)
- [Working with Namespaces](#working-with-namespaces)
- [kubectx tools](#kubectx-tools)
- [Kubens tools](#kubens-tools)

## Kubernetes Namespace
In Kubernetes, namespaces provide a mechanism for isolating groups of resources within a single cluster. Names of resources need to be unique within a namespace, but not across namespaces. Namespace isolate different workloads or environments within the same physical cluster.

## Namespaces benefits
- **Resource isolation**: Each namespace has its own set of resources, such as pods, services, and storage volumes. This allows you to isolate workloads from each other, preventing interference and conflicts.
- **Access control**: Kubernetes provides Role-Based Access Control (RBAC) mechanisms that allow you to control access to resources within namespaces. This enables you to grant different permissions to different teams or users.
- **Resource quotas**: You can set resource quotas on namespaces to limit the amount of compute resources (CPU, memory) and storage that can be consumed by workloads within the namespace. This helps prevent one workload from monopolizing cluster resources.
- **Environment segregation**: Namespaces can be used to segregate different environments, such as development, staging, and production. This makes it easier to manage and deploy applications across different stages of the software development lifecycle.

**Example:**

For example, suppose you have a Kubernetes cluster used by multiple teams in your organization. You can create separate namespaces for each team, such as `development`, `staging`, and `production`. Within each namespace, the team can deploy their applications and services without affecting other teams' workloads.

Here's how you can create a namespace in Kubernetes:

```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: development
```

To list all Kubernetes API resources.\
`kubectl api-resources`

`kubectl api-resources -o wide`

`kubectl api-resources --namespaced=true`

`kubectl api-resources --namespaced=false`


## Working with Namespaces

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


## kubectx tools

**kubectx**  Streamlining Cluster Navigation Kubectx allows you to switch between Kubernetes clusters effortlessly.

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

## Kubens tools
**Kubens**  Efficient Namespace Switching With Kubens, you can easily switch between namespaces. Similar to Kubectx, you can use the kubens command followed by the namespace name.

Change the active namespace on kubectl, Active namespace is **kube-system** .\
`kubens kube-system`

Go back to the previous namespace, Active namespace is **default** .\
`kubens -`

**Conclusion:** Kubectx and Kubens are powerful tools that simplify the management of Kubernetes clusters and namespaces. These tools enhance productivity, collaboration, and troubleshooting capabilities by providing an intuitive way to navigate contexts, switch namespaces, and streamline operations. Whether you are a Kubernetes beginner or an experienced operator, integrating Kubectx and Kubens into your day-to-day operations will improve your workflow and make your life easier.