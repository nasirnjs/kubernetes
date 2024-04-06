<h2> Understanding Kubernetes Service Account & RBAC </h2>

**Table of Contents**
- [Users in Kubernetes](#users-in-kubernetes)
- [Normal Users](#normal-users)
- [Kubernetes Service Accounts](#kubernetes-service-accounts)
- [Kubernetes RBAC](#kubernetes-rbac)

## Users in Kubernetes 
All Kubernetes clusters have two categories of users: service accounts managed by Kubernetes, and normal users

[References](https://kubernetes.io/docs/reference/access-authn-authz/authentication/)

[Create a user](https://github.com/nasirnjs/kubernetes/blob/main/k8s-cheat-sheet/issue-certificate-for-user.md)

## Normal Users
These are human users who interact with the Kubernetes cluster using tools like `kubectl` or other client applications. Normal users authenticate themselves to the Kubernetes API server using various authentication methods such as client certificates, static token files, or OIDC. Normal users are typically responsible for managing and administering the cluster, as well as deploying and monitoring applications.


## Kubernetes Service Accounts

Kubernetes Service Accounts are a mechanism used to provide an identity for processes running in Kubernetes pods. They allow pods to authenticate and interact with the Kubernetes API server securely. Service Accounts are mainly used for:

1. **Authentication**
Service Accounts provide a way for pods to prove their identity to the Kubernetes API server. This authentication is crucial for securing interactions with the Kubernetes API.

2. **Authorization**
By associating Service Accounts with RBAC (Role-Based Access Control) policies, you can control what actions pods with those Service Accounts are allowed to perform within the cluster.

3. **Communication with other Kubernetes components**
Service Accounts are often used by various Kubernetes components and controllers to authenticate themselves when communicating with the Kubernetes API server or other components.

**Here's a brief overview of how Service Accounts work:**

- When a pod is created, it can specify which Service Account it wants to use through the `serviceAccountName` field in its PodSpec.
- Each namespace has a default Service Account, which is automatically used if not specified otherwise.
- When a pod makes an API request, such as creating or deleting resources, the Service Account associated with the pod is used to authenticate the request.
- The Kubernetes API server verifies the authentication token provided by the pod's Service Account to ensure that the request is authorized.
- RBAC policies determine what actions the pod is allowed to perform based on its associated Service Account.

Service Accounts play a crucial role in the security and authorization mechanisms of Kubernetes, enabling secure communication and access control within the cluster.

`kubectl create namespace staging-ns`

`kubectl create serviceaccount monitoring -n staging-ns`

`kubectl get serviceaccount`

`kubectl delete serviceaccount monitoring -n staging-ns`

`kubectl set serviceaccount deployment web-dashboard dashboard-sa`

## Kubernetes RBAC
Kubernetes RBAC is a key security control to ensure that cluster users and workloads have only the access to resources required to execute their roles. It is important to ensure that, when designing permissions for cluster users, the cluster administrator understands the areas where privilege escalation could occur, to reduce the risk of excessive access leading to security incidents.

In Kubernetes, roles and role bindings, as well as cluster roles and cluster role bindings, are used to manage permissions and access control within a cluster. These resources help define what actions a user, service account, or group of users can perform within the Kubernetes environment.

1. **Role and Role Binding** 
- A role is a set of permissions that defines what actions are allowed on Kubernetes objects within a specific namespace. For example, a role might grant permissions to create, read, update, or delete certain types of resources like pods, services, or deployments.
- A role binding binds a role to a user, group, or service account, granting the permissions defined by that role. This means that the subjects specified in the role binding will have the rights defined by the associated role within the namespace to which the role binding is applied.

1. **Cluster Role and Cluster Role Binding**

- A cluster role is similar to a role but is not limited to a specific namespace. It defines permissions across the entire cluster. Cluster roles are useful for granting permissions that need to span multiple namespaces or affect cluster-wide resources.
- A cluster role binding binds a cluster role to a user, group, or service account, granting the permissions defined by that cluster role across the entire cluster.

3. **To summarize**

- Use roles and role bindings for permissions within a specific namespace.
- Use cluster roles and cluster role bindings for permissions that need to span across multiple namespaces or affect cluster-wide resources.

**To create a Role and RoleBinding imperatively in Kubernetes**
```bash
kubectl create role pod-reader --verb=get,list,watch --resource=pods --namespace=default
kubectl create rolebinding pod-reader-binding --role=pod-reader --user=bob --namespace=default

```

**To create a ClusterRole and Cluster RoleBinding imperatively in Kubernetes**

```bash
kubectl create clusterrole pod-reader --verb=get,list,watch --resource=pods
kubectl create clusterrolebinding bob-admin-binding --clusterrole=pod-reader --user=bob
kubectl run nginx --image nginx --as bob
```