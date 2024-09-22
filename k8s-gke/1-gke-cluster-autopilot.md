
To list the available compute zones in Google Cloud Platform (GCP).\
`gcloud compute zones list`

To set the default compute zone.\
`gcloud config set compute/zone us-east1-b`

create the GKE cluster with autopilot mode
```bash
gcloud container clusters create CLUSTER_NAME \
    --release-channel "regular" \
    --enable-autopilot \
    --min-nodes 2 
```