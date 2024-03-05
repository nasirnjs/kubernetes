Install a Specific Version Of Kubectl Tools on Ubuntu

Kubectl is a command-line tool that provides an interface to control the cluster and its components. It can be used to execute commands in one or more containers, submit new workloads for scheduling on clusters, get logs from containers running in a cluster, and so on.

## Find Version
To install a specific version of kubectl, we first need to go to the releases [URL below](https://github.com/kubernetes/kubernetes/releases) page and find the version we would like to install.



In my case, I will install version v1.28.1 In the below curl command, I have set the version number. Once you set the version number, run the command.
```
cd /usr/local/bin/
sudo curl -LO https://dl.k8s.io/release/v1.28.1/bin/linux/amd64/kubectl
sudo chmod +x kubectl
sudo chown -R nasir:nasir kubectl
kubectl version
```

After downloading the specific version to my server, I will run the command below to install it.

kubectl version --output yaml


[Ref](https://stackoverflow.com/questions/49721708/how-to-install-specific-version-of-kubernetes)
