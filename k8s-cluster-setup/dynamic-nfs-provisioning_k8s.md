# Setup Dynamic NFS Provisioning in Kubernetes Cluster
=======================================================

**Step1: Prepare the NFS Server** \
First lets install NFS server on the host machine
```
sudo apt update
sudo apt install nfs-kernel-server -y
```
Create a directory where our NFS server will serve the files.
```
sudo mkdir -p /var/k8-nfs/data
sudo chown -R nobody:nogroup /var/k8-nfs/data
sudo chmod 2770 /var/k8-nfs/data
```

Add NFS export options
```
sudo vi /etc/exports	
/var/k8-nfs/data 172.17.17.0/24(rw,sync,no_subtree_check,no_root_squash,no_all_squash)
```

Makes the specified directories available for NFS clients to access and restart the NFS Service
```
sudo exportfs -avr
sudo systemctl restart nfs-kernel-server
sudo systemctl status nfs-kernel-server
```

On the worker and master nodes, install nfs-common package using following
`sudo apt install nfs-common -y`



**Step 2: Install and Configure NFS Client Provisioner**\
The provisioner is responsible for dynamically creating and managing Persistent Volumes (PVs) and Persistent Volume Claims (PVCs) backed by NFS storage.
The choice between using the NFS Subdir External Provisioner and the NFS StorageClass depends on your specific requirements and the capabilities you need for provisioning NFS volumes in your Kubernetes cluster
1. NFS StorageClass:
- The NFS StorageClass is a built-in provisioner in Kubernetes that allows you to dynamically provision NFS volumes using the kubernetes.io/nfs provisioner. It offers a simple and straightforward way to provision NFS volumes without additional components.
- It is suitable for basic NFS provisioning requirements where you don't need advanced features like dynamic directory creation, per-namespace provisioning, or custom storage options.
- If your NFS server supports dynamic volume provisioning directly through the kubernetes.io/nfs provisioner, using the NFS StorageClass is a recommended approach.

2.NFS Subdir External Provisioner:
- The NFS Subdir External Provisioner is a separate provisioner that provides additional features for NFS provisioning in Kubernetes. It dynamically creates subdirectories on the NFS server for each PVC and manages them automatically.
- It allows for more granular control over directory creation, enabling per-PVC or per-namespace directory isolation.
- If you require per-PVC or per-namespace provisioning, the NFS Subdir External Provisioner is a suitable choice.
- Additionally, if your NFS server does not support dynamic volume provisioning through the kubernetes.io/nfs provisioner, the NFS Subdir External Provisioner can fill that gap by creating the necessary directories.

[NFS subdir external provisioner References](https://github.com/kubernetes-sigs/nfs-subdir-external-provisioner)

```
helm repo add nfs-subdir-external-provisioner https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner
helm install nfs-subdir-external-provisioner nfs-subdir-external-provisioner/nfs-subdir-external-provisioner --set nfs.server=172.17.17.74 --set nfs.path=/var/k8-nfs/data
```

**Step 3: Create Persistent Volume Claims (PVCs)**\
`vi demo-pvc.yml`
```
kind: PersistentVolumeClaim
apiVersion: v1
metadata:
  name: demo-claim
  #namespace: nfs-provisioning
spec:
  storageClassName: nfs-client
  accessModes:
    - ReadWriteMany
  resources:
    requests:
      storage: 10Mi
```
Apply PVC

`kubectl create -f demo-pvc.yml` \
`kubectl get pv,pvc`
