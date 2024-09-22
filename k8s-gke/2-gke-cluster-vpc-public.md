
## This would create a regional cluster spanning across the zones in the asia-east1 region

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