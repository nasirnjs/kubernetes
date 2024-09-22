 
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
    --metadata disable-legacy-endpoints=true
```
```
gcloud container clusters update aes-cluster \
    --zone asia-east1-a \
    --enable-master-authorized-networks \
    --master-authorized-networks 115.127.82.114/32
```
==================================================
```
gcloud compute networks create gke-1-net \
    --subnet-mode custom \
    --project aes-test-gke
```

`gcloud compute firewall-rules list`

```
gcloud compute firewall-rules create allow-control-plane \
    --allow tcp:443 \
    --source-ranges 115.128.82.114/32 \
    --network gke-1-net
```
```
gcloud compute networks subnets create gke-c1 \
    --project aes-test-gke \
    --network gke-1-net \
    --range 172.16.4.0/22 \
    --region asia-east1
```
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

`gcloud container clusters list --project=aes-test-gke`

`gcloud container clusters get-credentials aes-cluster --zone=asia-east1-a --project=aes-test-gke`


`gcloud container clusters delete aes-cluster --zone=asia-east1-a --project=aes-test-gke`