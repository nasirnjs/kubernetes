
To list the available compute zones in Google Cloud Platform (GCP).\
`gcloud compute zones list`

To set the default compute zone.\
`gcloud config set compute/zone us-east1-b`


Step 1: Set Up IAM Service Account

1.1 Create a service account to manage the cluster securely.

```bash
gcloud iam service-accounts create gke-sa \
    --description="Service account for GKE cluster management" \
    --display-name="gke-sa" \
    --project aes-test-gke
```
1.2 Grant Permissions: Assign appropriate roles to the service account to manage the GKE cluster securely.

```
gcloud projects add-iam-policy-binding aes-test-gke \
    --member="serviceAccount:gke-sa@aes-test-gke.iam.gserviceaccount.com" \
    --role="roles/container.admin"

gcloud projects add-iam-policy-binding aes-test-gke \
    --member="serviceAccount:gke-sa@aes-test-gke.iam.gserviceaccount.com" \
    --role="roles/compute.instanceAdmin"
```

Step 2: Create a VPC Network with Subnets

```
gcloud compute networks create gke-1-net \
    --subnet-mode custom \
    --project aes-test-gke
```

Step 3: Create GKE Autopilot Cluster

Create the Autopilot GKE cluster with security features enabled.

```bash
gcloud container clusters create-auto aes-cluster-autopilot2 \
    --location asia-east1 \
    --network gke-1-net \
    --subnetwork gke-c1

```

Step 4: 

`gcloud container clusters describe aes-cluster-autopilot2 --location asia-east1 --format="get(endpoint)"`


```
gcloud compute firewall-rules create allow-gke-control-plane-access \
    --allow tcp:443 \
    --network gke-1-net \
    --source-ranges 115.127.82.114/32 \
    --target-tags control-plane-access \
    --description "Allow access to GKE control plane from office IP"
```

`gcloud compute firewall-rules list --filter="network:gke-1-net"`



Step 5: Get Cluster Credentials
To access the GKE cluster, you need the credentials. Make sure you run this command from a trusted machine with gcloud and kubectl installed.

`gcloud container clusters get-credentials aes-cluster-autopilot --region asia-east1 --project aes-test-gke`

