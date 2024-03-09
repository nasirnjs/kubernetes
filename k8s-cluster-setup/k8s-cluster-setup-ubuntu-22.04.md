
<h2>How to Configure Kubernetes Cluster on Ubuntu 22.04 </h2>
Kubernetes stands out as a cutting-edge technology indispensable for seamless application deployment, efficient scaling, and robust management, irrespective of the underlying infrastructure. As a DevOps engineer or software developer, you'll inevitably find yourself in scenarios where installing Kubernetes on diverse platforms with essential dependencies becomes a crucial task. This guide furnishes you with meticulous, step-by-step instructions for installing Kubernetes specifically on the Ubuntu operating system.


**Table of Contents**
- [What is Kubernetes cluster](#what-is-kubernetes-cluster)
- [Prerequisites for Installing a Kubernetes Cluster](#prerequisites-for-installing-a-kubernetes-cluster)
- [Overall configurations steps](#overall-configurations-steps)
- [1. Setting up Static IPV4 on all nodes](#1-setting-up-static-ipv4-on-all-nodes)
- [2. Disabling swap \& Setting up hostnames](#2-disabling-swap--setting-up-hostnames)
- [3. Installing Kubernetes components on all nodes](#3-installing-kubernetes-components-on-all-nodes)
  - [3.1 Configure modules](#31-configure-modules)
  - [3.2 Configure Networking](#32-configure-networking)
  - [3.3 Install containerd (Master \& Worker Node).](#33-install-containerd-master--worker-node)
  - [3.4 Modify containerd configuration (Master \& Worker Node).](#34-modify-containerd-configuration-master--worker-node)
  - [3.5 Install Kubernetes Management Tools (Master \& Worker Node).](#35-install-kubernetes-management-tools-master--worker-node)
- [4. Initialization the Kubernetes Cluster (Master Node).](#4-initialization-the-kubernetes-cluster-master-node)
- [5. Configuring Kubectl (Master Node).](#5-configuring-kubectl-master-node)
- [6. Install Calico networking for on-premises deployments (Master Node)](#6-install-calico-networking-for-on-premises-deployments-master-node)
- [7. Print Join token for worker Node to join Cluster (Master Node).](#7-print-join-token-for-worker-node-to-join-cluster-master-node)
  - [7.1 Join worker Node to the Cluster (Worker Node)](#71-join-worker-node-to-the-cluster-worker-node)
  - [7.2 Get Cluster Info (Master Node)](#72-get-cluster-info-master-node)
- [8. Deploy Applications into k8s Cluster (Master Node)](#8-deploy-applications-into-k8s-cluster-master-node)


## What is Kubernetes cluster
A Kubernetes cluster is a set of machines (physical or virtual) that are grouped together to run Kubernetes and its applications. Kubernetes is an open-source container orchestration platform designed to automate the deployment, scaling, and management of containerized applications.

**In a Kubernetes cluster, there are typically two types of nodes:**

1. **Master Node(s)**: These nodes are responsible for managing the cluster and its components. They schedule applications, maintain the desired state of the cluster, and handle scaling, updates, and other administrative tasks. Usually, a Kubernetes cluster has multiple master nodes for high availability and fault tolerance.

2. **Worker Node(s)**: Also known as minion nodes, these machines run the actual containerized applications and workloads. They communicate with the master node(s) to receive instructions, report their status, and perform the tasks assigned to them.

## Prerequisites for Installing a Kubernetes Cluster
To install Kubernetes Cluster on your Ubuntu machine, make sure it meets the following requirements:
- At list 2 Nodes 
- 2 vCPUs
- At least 4GB of RAM
- At least 20 GB of Disk Space
- A reliable internet connection

## Overall configurations steps

1. Setting up the Static IPV4 on all nodes.
2. Disabling swap & Setting up hostnames.
3. Installing Kubernetes components on all nodes.
4. Initializing the Kubernetes cluster.
5. Configuring Kubectl.
6. Configure Calico Network operator.
7. Print Join token & add worker nodes in the cluster.
8. Deploy Applications.

## 1. Setting up Static IPV4 on all nodes
Configure Static IP Address on Ubuntu 22.04 (Master & Worker Node)**.\
Edit netplan file add and update IP Address as your Network.

`sudo vim /etc/netplan/01-network-manager-all.yaml`

```bash
network:
  version: 2
  renderer: networkd
  ethernets:
    ens33:
      dhcp4: no
      addresses:
        - 192.168.10.245/24
      routes:
        - to: default
          via: 192.168.10.1
      nameservers:
          addresses: [8.8.8.8, 8.8.4.4]
```
Apply changes.\
`sudo netplan apply`

## 2. Disabling swap & Setting up hostnames
Disabling swap & Setting up hostnames (Master & Worker Node). Disabling swap before configuring a Kubernetes cluster helps ensure optimal performance, resource management, and stability, which are crucial for running containerized workloads efficiently in a production environment\

```bash
sudo apt-get update
sudo swapoff -a
sudo vim /etc/fstab
sudo init 6
```
Setup hostname all nodes (Masternode should be master & worker node should be worker).\
`sudo hostnamectl set-hostname "master-node"`

## 3. Installing Kubernetes components on all nodes
Installing Kubernetes components on all nodes (Master & Worker Node).\
Description: This section covers the essential steps to install Kubernetes components on both the master and worker nodes, paving the way for a fully functional Kubernetes cluster. From configuring kernel modules for containerd to setting up system parameters crucial for networking and the Container Runtime Interface (CRI), each step is carefully crafted to ensure a seamless installation process. Follow these instructions to equip your nodes with the necessary components for efficient container orchestration.

### 3.1 Configure modules
Configure modules required by containerd (Master & Worker Node).\
Description: Configure kernel modules necessary for containerd to operate seamlessly.

```bash
cat <<EOF | sudo tee /etc/modules-load.d/k8s.conf
overlay
br_netfilter
EOF
```
```bash
sudo modprobe br_netfilter
sudo modprobe overlay
```
### 3.2 Configure Networking
Configure system parameters for networking and CRI (Master & Worker Node).\
Description: Set up system parameters related to networking for Kubernetes and the Container Runtime Interface (CRI).

```bash
cat <<EOF | sudo tee /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-iptables  = 1
net.bridge.bridge-nf-call-ip6tables = 1
net.ipv4.ip_forward                 = 1
EOF
```
`sudo sysctl --system`

### 3.3 Install containerd (Master & Worker Node).
Description: Install the container runtime (containerd) for managing containers.
```bash
sudo apt-get update
sudo apt-get install -y containerd
```
### 3.4 Modify containerd configuration (Master & Worker Node).
Description: Configure containerd to enable systemd cgroup integration.
```bash
sudo mkdir -p /etc/containerd
sudo containerd config default | sudo tee /etc/containerd/config.toml
sudo sed -i 's/SystemdCgroup \= false/SystemdCgroup \= true/g' /etc/containerd/config.toml
cat /etc/containerd/config.toml
```
`sudo systemctl restart containerd.service`

`sudo systemctl status containerd`

### 3.5 Install Kubernetes Management Tools (Master & Worker Node).
Description: Install essential Kubernetes management tools - Kubeadm, Kubelet, and Kubectl.

[Reference](https://kubernetes.io/docs/tasks/tools/install-kubectl-linux/#install-using-native-package-management)
```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl
sudo apt-get install -y apt-transport-https ca-certificates curl

curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /etc/apt/keyrings/kubernetes-archive-keyring.gpg
echo "deb [signed-by=/etc/apt/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
```
```bash
sudo apt-get update
sudo apt-get install -y kubelet kubeadm kubectl
sudo apt-mark hold kubelet kubeadm kubectl
```

## 4. Initialization the Kubernetes Cluster (Master Node).
Description: Initialize the Kubernetes control-plane on the master server.

`sudo kubeadm init --apiserver-advertise-address=172.17.17.200 --pod-network-cidr=192.168.0.0/16 --cri-socket /run/containerd/containerd.sock --ignore-preflight-errors Swap`

- 172.17.17.200 this is your k8s Master Server IP
- 192.168.0.0/16 this is Pod CIDR if you change this you have to udpate CNI Network Configuration operator file also.

## 5. Configuring Kubectl (Master Node).
Description: This step focuses on creating the kubeconfig file, a crucial configuration file for using the `kubectl` command on the master node. Create kubeconfig file to use kubectl command 

```bash
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config
```
## 6. Install Calico networking for on-premises deployments (Master Node)
[Reference](https://projectcalico.docs.tigera.io/getting-started/kubernetes/self-managed-onprem/onpremises).\
Description: In this step, we'll install Calico, a powerful networking solution, to facilitate on-premises deployments in your Kubernetes cluster.

Install the operator on your cluster.\
`kubectl create -f https://raw.githubusercontent.com/projectcalico/calico/v3.24.1/manifests/tigera-operator.yaml`

Download the custom resources necessary to configure Calico.\
`curl https://raw.githubusercontent.com/projectcalico/calico/v3.24.1/manifests/custom-resources.yaml -O`

If you wish to customize the Calico install, customize the downloaded custom-resources.yaml manifest locally and Create the manifest in order to install Calico.
`kubectl create -f custom-resources.yaml`

## 7. Print Join token for worker Node to join Cluster (Master Node).
Description: Print the join command Master Server and use it to add nodes to the Kubernetes cluster.

`kubeadm token create --print-join-command`

### 7.1 Join worker Node to the Cluster (Worker Node)
Description: Join Node to the Cluster (Node Configuration)

`kubeadm join 172.17.18.200:6443 --token 5g5jo2.agl26wfzkujgjt3s --discovery-token-ca-cert-hash ha256:57795a664200425258ed0619af960fe476d1ae93f99182a3d710ce1185468d3f`


### 7.2 Get Cluster Info (Master Node)
Get APi resources list and sort name\
`kubectl api-resources `

Display addresses of the master and services\
`kubectl cluster-info`

Dump current cluster state to stdout\
`kubectl cluster-info dump`

## 8. Deploy Applications into k8s Cluster (Master Node)
To deploy Nginx using the imperative approach in Kubernetes.\
`kubectl run nginx-deployment --image=nginx --replicas=3 --port=80`

If you want to expose the Nginx deployment externally, you can create a service.\
`kubectl expose deployment nginx-deployment --type=LoadBalancer --name=nginx-service`

And you can also check the running pods and Services.

```bash
kubectl get pods
kubectl get services
```

---

<div style="text-align: center;">
🎉🎉🎉 Congratulations!!! 🎉🎉🎉
</div>


You've successfully completed the step-by-step guide to configure a Kubernetes cluster on Ubuntu 22.04. Your Kubernetes cluster is now equipped with essential components, networking configurations, and management tools, ready to handle seamless application deployment and scaling.

Explore the vast capabilities of Kubernetes, and feel free to deploy your applications, manage resources, and scale effortlessly. Remember, you now have a robust foundation for orchestrating containers and building scalable, resilient applications.

If you encounter any challenges or have specific use cases in mind, refer to the official Kubernetes documentation for detailed information and best practices.


<div style="text-align: center;">
🎉🎉🎉 &copy;CloudOpsSchool & Happy Kuberneting! 🎉🎉🎉
</div>

