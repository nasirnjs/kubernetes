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


## This would create a regional GKE Public cluster spanning across the zones in the asia-east1 region

### Create VPC Network
```
gcloud compute networks create gke-1-net \
    --subnet-mode custom \
    --project aes-test-gke
```
#### List Firewall Rules
`gcloud compute firewall-rules list`

### Create Firewall Rule
```
gcloud compute firewall-rules create allow-control-plane \
    --allow tcp:443 \
    --source-ranges 115.128.82.114/32 \
    --network gke-1-net
```
### Create Subnet
```
gcloud compute networks subnets create gke-c1 \
    --project aes-test-gke \
    --network gke-1-net \
    --range 172.16.4.0/22 \
    --region asia-east1
```

### Create GKE Cluster
 ```   
gcloud container clusters create aes-cluster \
    --zone asia-east1-a \
    --enable-master-authorized-networks \
    --master-authorized-networks 115.128.82.114/32 \
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
    --metadata disable-legacy-endpoints=true
```
It shows the names, locations (zone or region), and status of your clusters.\
`gcloud container clusters list --project=aes-test-gke`

This command retrieves the authentication credentials (kubeconfig) for the aes-cluster.\
`gcloud container clusters get-credentials aes-cluster --zone=asia-east1-a --project=aes-test-gke`

This command deletes the aes-cluster in the asia-east1-a zone. It will prompt for confirmation before deletion and permanently removes the cluster, along with all associated resources, (except any persistent disks or external load balancers unless manually removed).\
`gcloud container clusters delete aes-cluster --zone=asia-east1-a --project=aes-test-gke`