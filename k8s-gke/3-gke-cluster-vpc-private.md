## What is Google Kubernetes Engine (GKE)

1. Kubernetes is a production-grade orchestration tool for containers that offers you better management and scaling of your application. Kubernetes allows you to deploy containers on a set of nodes called a **cluster**. The node represents a computing instance.
2. Kubernetes deploys a container in a **pod**. A pod is the smallest deployable unit in K8s. Each pod in Kubernetes gets a unique Ephemeral IP address.
3. **Deployment** is another component of K8s that can be described as the blueprint of your workload.
4. By default, pods are accessible only inside your cluster. To make the pods publicly accessible, you need to expose them using a **Service**—the most common service type used in Cloud is a **Load Balancer**.

### GKE Public Cluster

1. **Google Kubernetes Engine (GKE) public cluster** is a cluster of virtual machines that run Kubernetes, an open-source container orchestration system.
2. This cluster can be accessed from the internet, making it a public cluster.
3. A public GKE cluster is typically used when you want to deploy and manage containerized applications in a production environment that is accessible to users on the internet. 
4. Public GKE clusters are ideal for web applications, microservices, or other services that need to be exposed to the public.
5. GKE provides high availability, automatic scaling, and easy management, making it a popular choice for production deployments.

### GKE Private Cluster

1. **GKE private cluster** is a cluster of virtual machines that runs Kubernetes, an open-source container orchestration system.
2. This cluster is not directly accessible from the internet and can only be accessed through a VPN or Cloud Interconnect, making it a private cluster.
3. A private GKE cluster is typically used when you want to deploy and manage containerized applications in a production environment that is not accessible to users on the internet. 
4. Private GKE clusters are used for internal web applications, microservices, or other services that should not be exposed to the public.
5. It provides the same features as a public GKE cluster, such as high availability, automatic scaling, and easy management, but with added security and isolation.
6. Private GKE clusters are useful in sensitive environments where data must remain private and not accessible to the public.

### Decision Maker for GKE Public Cluster and GKE Private Cluster

#### GKE Public Cluster

1. Public GKE clusters are used by companies that want to provide a service or application to a large number of users or customers.
2. Public GKE clusters handle high levels of traffic and ensure that the service or application remains available and responsive during periods of high demand.
3. Public GKE clusters can easily connect to other GCP services like BigQuery, Cloud Storage, and Cloud SQL, making it easy to build and deploy applications.
4. Public GKE clusters are an excellent choice for organizations that want to deploy and manage containerized applications in a production environment that is easily accessible to users on the internet.

#### GKE Private Cluster

1. Private GKE clusters are useful in scenarios where regulatory or compliance requirements mandate that certain data and applications remain within a private network.
2. They are ideal for industries like healthcare, finance, or government applications, where data privacy and security regulations are strict.
3. Private GKE clusters are used by companies with a multi-cloud strategy that want to keep workloads isolated and managed through a private network.
4. A Private GKE cluster is an excellent choice for organizations that want to deploy and manage containerized applications in a secure and isolated environment.


## This would create a regional GKE Private cluster spanning across the zones in the asia-east1 region

To make the GKE cluster private while enabling outbound internet access via Cloud NAT, follow these steps. This will ensure that the cluster's nodes do not have public IP addresses, but they can still access the internet for essential operations.


1. Create a Service Account:

Created a service account (bastion-sa) for the bastion host to access GKE.
```bash
gcloud iam service-accounts create bastion-sa \
    --description="Service account for bastion host to access GKE" \
    --display-name="bastion-sa" \
    --project aes-test-gke

```
1.2 Assign IAM Roles:

Granted necessary roles to the service account for accessing GKE and Compute Engine.

```bash
gcloud projects add-iam-policy-binding aes-test-gke \
    --member="serviceAccount:bastion-sa@aes-test-gke.iam.gserviceaccount.com" \
    --role="roles/container.admin"

gcloud projects add-iam-policy-binding aes-test-gke \
    --member="serviceAccount:bastion-sa@aes-test-gke.iam.gserviceaccount.com" \
    --role="roles/compute.instanceAdmin"
```

2. Create the VPC Network
```
gcloud compute networks create gke-1-net \
    --subnet-mode custom \
    --project aes-test-gke
```

2.1 Create the NAT Subnet.\
We need to create a dedicated subnet for NAT, which will allow the private GKE cluster's nodes to communicate with the internet.
```
gcloud compute networks subnets create nat-subnet \
    --network=gke-1-net \
    --region=asia-east1 \
    --range=192.168.100.0/24
```
2.3 Create the GKE Subnet.\
You also already have the command for creating the primary GKE subnet, where the cluster nodes will reside.

Confirm the details of the existing subnets in your project.\
`gcloud compute networks subnets list --regions asia-east1 --project aes-test-gke`

```bash
gcloud compute networks subnets create gke-c1 \
    --project aes-test-gke \
    --network gke-1-net \
    --range 172.16.4.0/22 \
    --region asia-east1
```

3. Allocate External IP for Bastion Host:

Created a static external IP address for the bastion host.

```bash
gcloud compute addresses create bastion-ip \
    --region asia-east1 \
    --project aes-test-gke
```

To list the static external IP addresses in the asia-east1 region for your project aes-test-gke.\

`gcloud compute addresses list --regions asia-east1 --project aes-test-gke`


3.1 Create Bastion Host:

Launched a bastion host instance with the appropriate settings, including a startup script to install kubectl.
```bash
gcloud compute instances create bastion-host \
    --zone asia-east1-a \
    --machine-type e2-medium \
    --subnet gke-c1 \
    --network-tier PREMIUM \
    --tags bastion \
    --image-family ubuntu-2204-lts \
    --image-project ubuntu-os-cloud \
    --boot-disk-size 10GB \
    --boot-disk-type pd-balanced \
    --boot-disk-device-name bastion-host \
    --address 35.229.198.123 \
    --service-account bastion-sa@aes-test-gke.iam.gserviceaccount.com \
    --scopes https://www.googleapis.com/auth/cloud-platform

```

4. Create the Firewall Rule for Control Plane to allow bastion Host.\

```bash
gcloud compute firewall-rules create allow-control-plane \
    --allow tcp:443 \
    --source-ranges 35.189.176.82 \
    --network gke-1-net
```

Create firewall rules for Bastion host allow SSH Connection
```bash
gcloud compute firewall-rules create allow-ssh-from-office \
    --network gke-1-net \
    --allow tcp:22 \
    --source-ranges 115.127.82.114/32 \
    --target-tags bastion
```

5. Create the Cloud Router.\
This step sets up the Cloud Router, which is required for the NAT gateway.
```
gcloud compute routers create nat-router \
    --network=gke-1-net \
    --region=asia-east1
```
6. Configure Cloud NAT.\
Configure Cloud NAT to allow the private GKE nodes to communicate with the internet.

To list all NAT configurations in your project, you can use the following command.\
`gcloud compute routers nats list --router=nat-router --region=asia-east1 --project=aes-test-gke`

```
gcloud compute routers nats create nat-config \
    --router=nat-router \
    --auto-allocate-nat-external-ips \
    --nat-all-subnet-ip-ranges \
    --region=asia-east1
```
7. Create the Private GKE Cluster.\
Here, the GKE nodes will be private (i.e., without public IPs), and they will rely on Cloud NAT for outbound internet traffic:
```bash
gcloud container clusters create aes-cluster \
    --zone asia-east1-a \
    --enable-master-authorized-networks \
    --machine-type c2d-highcpu-2 \
    --num-nodes 1 \
    --max-nodes 4 \
    --enable-autoscaling \
    --min-nodes 1 \
    --no-enable-basic-auth \
    --no-issue-client-certificate \
    --enable-ip-alias \
    --network gke-1-net \
    --subnetwork gke-c1 \
    --metadata disable-legacy-endpoints=true \
    --enable-private-nodes \
    --enable-private-endpoint \
    --master-authorized-networks 172.16.4.0/24 \
    --service-account bastion-sa@aes-test-gke.iam.gserviceaccount.com \
    --cluster-ipv4-cidr 10.0.0.0/14 \
    --services-ipv4-cidr 10.32.0.0/16
```
Explanation of Additional Flags:
--enable-private-nodes: This makes the nodes private, without public IP addresses. \
--enable-private-endpoint: The control plane (API server) will only be accessible via its private IP, ensuring full privacy for the cluster.
--cluster-ipv4-cidr:  Defines the CIDR (Classless Inter-Domain Routing) range for the pod IP addresses within your cluster
--services-ipv4-cidr: Defines the CIDR range for the ClusterIP service addresses


1. SSH into Bastion Host:

Accessed the bastion host via SSH.

`gcloud compute ssh bastion-host --zone asia-east1-a`

9. Install Google Cloud SDK:

Downloaded and installed the Google Cloud SDK.

```bash
wget https://dl.google.com/cloudsdk/channels/rapid/google-cloud-sdk.tar.gz
tar -xf google-cloud-sdk.tar.gz
cd google-cloud-sdk
./install.sh
```

10. Configure SDK and Get Cluster Credentials:

Updated your environment and initialized the SDK to access the GKE cluster.

```bash
vim ~/.bashrc
export PATH="$HOME/google-cloud-sdk/bin:$PATH"
source ~/.bashrc
gcloud version
gcloud init
cd /
gcloud components install kubectl
gcloud components install gke-gcloud-auth-plugin
kubectl version --clien
gcloud container clusters get-credentials aes-cluster --zone asia-east1-a --project aes-test-gke
```

`kubectl get nodes`


It shows the names, locations (zone or region), and status of your clusters.\
`gcloud container clusters list --project=aes-test-gke`


---
### Delete the Kubernetes cluster
`gcloud container clusters delete aes-cluster --zone asia-east1-a --project aes-test-gke --quiet`

### Delete the bastion host instance
`gcloud compute instances delete bastion-host --zone asia-east1-a --quiet`

### To delete the reserved static IP address associated with your bastion host in Google Cloud
`gcloud compute addresses delete bastion-ip --region asia-east1 --quiet`

### Delete the NAT router
`gcloud compute routers delete nat-router --region asia-east1 --project aes-test-gke --quiet`

### Delete the NAT subnet
`gcloud compute networks subnets delete nat-subnet --region asia-east1 --project aes-test-gke --quiet`

### Delete the GKE subnet
`gcloud compute networks subnets delete gke-c1 --region asia-east1 --project aes-test-gke --quiet`

### Delete the custom network
`gcloud compute networks delete gke-1-net --project aes-test-gke --quiet`

### Delete the service account
`gcloud iam service-accounts delete aesgke@aes-test-gke.iam.gserviceaccount.com --quiet`





https://codelabs.developers.google.com/cloudnet-psc-ilb-gke#8