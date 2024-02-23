## How to merge Kubernetes kubectl config files into one single file, for use MultiCluster or Switching contexts.
When dealing with multiple Kubernetes clusters, merge their kubeconfig files into a single configuration file ($HOME/.kube/config). This facilitates context switching using kubectl config use-context <context-name>, streamlining the management of configurations for seamless multi-cluster operations.

**Steps 1:**
Copy your second and third cluster config file to `.kube` directory

**Steps 2:**
Merge all kubeconfig files into one.\
`KUBECONFIG=$HOME/.kube/config:$HOME/.kube/nasir-k8s-kubeconfig.yaml kubectl config view --merge --flatten=true > $HOME/.kube/config.new`

**Steps 3:**
Updates new configuration file name at `~/.kube/config`. This is the file that was just updated in the previous step.\
`mv $HOME/.kube/config.new $HOME/.kube/config`

**Steps 4:**
Display a list of available contexts in the Kubernetes configuration. A context in Kubernetes is a combination of a cluster, user, and namespace.\
`kubectl config get-contexts`

To retrieve a list of Kubernetes contexts in your Kubectl configuration.\
`kubectl config get-contexts -o=name`

 Displays the current Kubectl configuration, minifies it removes any unnecessary whitespace and comments.\
 `kubectl config view --minify`

**Steps 5:**
Now switch to a different context in your Kubernetes configuration.\
`kubectl config use-context aes-cluster-1`


[Reference](https://github.com/SMACAcademy/Kubernetes_on_Vultr_Cloud/blob/main/vultr/00-01-kubeconfig.md)