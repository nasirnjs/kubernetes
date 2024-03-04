# Install minikube

📚 [Minikube Documentation](https://minikube.sigs.k8s.io/docs/start/)

🛠️ To install the latest minikube stable release on x86-64 Linux using Debian package.

```
curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube_latest_amd64.deb
sudo dpkg -i minikube_latest_amd64.deb

```
Start your cluster, From a terminal with administrator access (but not logged in as root), run

`minikube start
`

Interact with your cluster, If you already have kubectl installed (see documentation), you can now use it to access your shiny new cluster:

`kubectl get po -A`

Alternatively, minikube can download the appropriate version of kubectl and you should be able to use it like this

`minikube kubectl -- get po -A`


## Start Minikube With More Memory & CPUs
Minikube is a single-node Kubernetes cluster that can be installed on macOS, Linux and Windows.
By default, it starts with 2 CPUs and 2GB of memory, that may not be enough for experiments with some heavy projects.


## Delete & Recreate With More Resources
Delete the current instance and recreate it with the new resources
```
minikube stop
minikube delete
minikube start --memory 8192 --cpus 2
```

## Set The Memory & CPU for default start

```
minikube stop
minikube config set memory 8192
minikube config set cpus 4
minikube config set disk-size 20GB
minikube start
```

## SSH into Minikube Instance
`minikube ssh`


## Accessing the Kubernetes Minikube Dashboard
You can use the Kubernetes dashboard to monitor your cluster’s health, or to deploy applications manually. If you deployed Minikube locally, you can access the dashboard by running the minikube dashboard command.

`minikube dashboard`

You can use to access the dashboard, rather than opening a browser directly

`minikube dashboard --url`

Run dashboard command in the background

`minikube dashboard &`