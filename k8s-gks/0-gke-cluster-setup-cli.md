
How To Create A Google Kubernetes Engine Cluster (GKE)

## 1. What is What is GKE?

Google Kubernetes Engine (GKE) is a managed Kubernetes service provided by Google Cloud Platform (GCP) that allows you to deploy, manage, and scale containerized applications using Kubernetes. Kubernetes is an open-source platform designed for automating the deployment, scaling, and management of containerized applications.

## 2. Types of GKE

**Standard GKE:** This is the original offering of GKE, where you have full control over the configuration and management of your Kubernetes clusters. You can customize various aspects of the cluster, such as the node types, networking, and security settings. Standard GKE is suitable for users who require fine-grained control over their Kubernetes environment and want to manage the infrastructure themselves.

**Autopilot GKE:** Autopilot is a managed mode for GKE that automates infrastructure management tasks, such as cluster setup, node provisioning, scaling, and upgrades. With Autopilot, Google automatically manages the underlying infrastructure based on the workload requirements, allowing you to focus on deploying and managing your applications. Autopilot GKE is suitable for users who prefer a fully managed Kubernetes environment and want to minimize the operational overhead of managing clusters

To create a Google Kubernetes Engine (GKE) cluster via the command-line interface (CLI), you can use the gcloud command, which is the Google Cloud SDK tool for interacting with Google Cloud resources. Here's how you can create a GKE cluster using the gcloud CLI:

## 3. Install Google Cloud SDK

If you haven't already, you'll need to install the Google Cloud SDK from [Here](https://cloud.google.com/sdk/docs/install). You can find installation instructions for various operating systems here.

## 4. Authenticate with Google Cloud

Before you can create resources in Google Cloud, you need to authenticate with your Google Cloud account. Run the following command and follow the instructions:

`gcloud auth login`

## 5. Set Default Project and Region

If you haven't already set a default project and region for the gcloud CLI. First you have to checkout list of zone and machine types vai `gcloud compute regions list` and `gcloud compute machine-types list --filter="asia-east1"` you can do so by running 
```
gcloud config set project PROJECT_ID
gcloud config set compute/region REGION
```

## 6. Create GKE Cluster

Now you can create the GKE cluster using the gcloud container clusters create command. Here's an example.

```zsh
gcloud container clusters create aes-cluster \
    --zone asia-east1-a \
    --machine-type c2d-highcpu-2 \
    --num-nodes 2 \
    --max-nodes 4 \
    --enable-autoscaling \
    --min-nodes 2 \
    --no-enable-basic-auth \
    --no-issue-client-certificate \
    --enable-ip-alias \
    --metadata disable-legacy-endpoints=true
```

`gcloud container clusters list`

## 7. Kubectl authentication plugin installation

`sudo apt-get install google-cloud-sdk-gke-gcloud-auth-plugin`

`gke-gcloud-auth-plugin --version`

## 8. Run kubectl with the new GKE auth plugin

```zsh
export USE_GKE_GCLOUD_AUTH_PLUGIN=True
source ~/.zshrc
sudo apt-get update && sudo apt-get --only-upgrade install kubectl google-cloud-sdk-gke-gcloud-auth-plugin
```

This will force the config for this cluster to be updated to the Client-go Credential Plugin configuration.\
`gcloud container clusters get-credentials aes-cluster --zone=asia-east1-a`

Get list of cluster POD\
`kubectl get pod -A`

Get API Call.\
`gcloud container clusters list --log-http >& gke-log.txt`

To delete the GKE cluster named aes-cluster in the asia-east1-a region.\
`gcloud container clusters delete aes-cluster --region=asia-east1-a`


<p align="center">
  🎉🎉🎉 Congratulations!!! Enjoy your GKE Cluster 🎉🎉🎉
</p>
