<h2>Install the Kubernetes metrics server on a managed cluster or a self-managed Kubeadm server </h2>

**Tables of Contents**
- [Installation](#installation)
- [Metrics Server will fail with this error](#metrics-server-will-fail-with-this-error)
- [Why Metrics Server fail?](#why-metrics-server-fail)
- [Solution From scratch](#solution-from-scratch)
- [Solution for Running cluster](#solution-for-running-cluster)
  - [Steps 1: Update Master Node KubeletConfiguration](#steps-1-update-master-node-kubeletconfiguration)
  - [Steps 2: On each node, add the serverTLSBootstrap: true](#steps-2-on-each-node-add-the-servertlsbootstrap-true)
  - [Steps 3: Return to the master node and the Signed the certificate](#steps-3-return-to-the-master-node-and-the-signed-the-certificate)

## Installation
Metrics Server can be installed either directly from YAML manifest or via the official [Helm chart](https://artifacthub.io/packages/helm/metrics-server/metrics-server). To install the latest Metrics Server release from the components.yaml manifest, run the following command. [References](https://github.com/kubernetes-sigs/metrics-server?tab=readme-ov-file#readme)

`kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml`

We can attempt to execute kubectl top pod, but it should not work.

`kubectl top pod`

## Metrics Server will fail with this error
If you try to install metrics-server into a fresh, up to date, kubeadm cluster, it will fail with this error in the logs
```
0308 08:41:42.740193       1 scraper.go:149] "Failed to scrape node" err="Get \"https://172.17.18.200:10250/metrics/resource\": tls: failed to verify certificate: x509: cannot validate certificate for 172.17.18.200 because it doesn't contain any IP SANs" node="k8-master"
E0308 08:41:42.743432       1 scraper.go:149] "Failed to scrape node" err="Get \"https://172.17.18.201:10250/metrics/resource\": tls: failed to verify certificate: x509: cannot validate certificate for 172.17.18.201 because it doesn't contain any IP SANs" node="k8-work
```
## Why Metrics Server fail?
Because Kubelet certificates are self-signed, they are not signed by Kubernetes CA. And indeed, InternalIP is not part of the certificate SAN.

metrics-server can be configured to not use the InternalIP but rather the node hostname, or its ExternalIP. The argument --kubelet-preferred-address-types=InternalIP,ExternalIP,Hostname allows you to decide which one it should use. But this won’t solve our problem because if you use Hostname as first choice, you end up with a DNS resolution problem because your pod doesn’t know who “scw-sharp-cray” (the name of my node) is. Actually, even if the DNS resolution works, you will still face our first issue, because even the hostname of our node is not a certificate SAN…

Actually, InternalIP is a good choice. And the way to fix this is to signed Kubelet certificate with the APIServ.

## Solution From scratch
From scratch, you have to use serverTLSBootstrap: true in your kubeadm configfile.

`vim cluster-init-config.yaml`
```bash
apiVersion: kubeadm.k8s.io/v1beta3
kind: ClusterConfiguration
---
apiVersion: kubelet.config.k8s.io/v1beta1
kind: KubeletConfiguration
serverTLSBootstrap: true
```

## Solution for Running cluster
You basically have Two things to do:
- Edit the kubelet-config ConfigMap in the kube-system namespace. Edit the KubeletConfiguration document to set serverTLSBootstrap: true.
- On each node, add the serverTLSBootstrap: true field in /var/lib/kubelet/config.yaml and restart the kubelet
  
### Steps 1: Update Master Node KubeletConfiguration
Edit the kubelet-config ConfigMap in the kube-system namespace. Edit the KubeletConfiguration document to set `serverTLSBootstrap: true`.\
`kubectl get configmap kubelet-config -n kube-system -o yaml > kubelet-config.yaml`

`vim kubelet-config.yaml`

```bash
apiVersion: v1
data:
  kubelet: |
    apiVersion: kubelet.config.k8s.io/v1beta1
    authentication:
      anonymous:
        enabled: false
      webhook:
        cacheTTL: 0s
        enabled: true
      x509:
        clientCAFile: /etc/kubernetes/pki/ca.crt
    authorization:
      mode: Webhook
      webhook:
        cacheAuthorizedTTL: 0s
        cacheUnauthorizedTTL: 0s
    cgroupDriver: systemd
    clusterDNS:
    - 10.96.0.10
    clusterDomain: cluster.local
    containerRuntimeEndpoint: ""
    cpuManagerReconcilePeriod: 0s
    evictionPressureTransitionPeriod: 0s
    fileCheckFrequency: 0s
    healthzBindAddress: 127.0.0.1
    healthzPort: 10248
    httpCheckFrequency: 0s
    imageMinimumGCAge: 0s
    kind: KubeletConfiguration
    logging:
      flushFrequency: 0
      options:
        json:
          infoBufferSize: "0"
      verbosity: 0
    memorySwap: {}
    nodeStatusReportFrequency: 0s
    nodeStatusUpdateFrequency: 0s
    resolvConf: /run/systemd/resolve/resolv.conf
    rotateCertificates: true
    runtimeRequestTimeout: 0s
    shutdownGracePeriod: 0s
    shutdownGracePeriodCriticalPods: 0s
    staticPodPath: /etc/kubernetes/manifests
    streamingConnectionIdleTimeout: 0s
    syncFrequency: 0s
    volumeStatsAggPeriod: 0s
    serverTLSBootstrap: true   # Add this lineeeeeeeeeeeeee Onlyyyyyyyyyyyyyyy
kind: ConfigMap
metadata:
  annotations:
    kubeadm.kubernetes.io/component-config.hash: sha256:ff76c96ce6a025e279138fef234cfd93e648e9fdd0e482723f43376929e1784c
  creationTimestamp: "2024-02-11T15:31:04Z"
  name: kubelet-config
  namespace: kube-system
  resourceVersion: "238"
  uid: 80e4c382-d52e-43fb-9990-e538a5dd8922
```
Then apply changes.\
`kubectl apply -f kubelet-config.yaml --force`

### Steps 2: On each node, add the serverTLSBootstrap: true 
Edit file in /var/lib/kubelet/config.yaml end of the file add `serverTLSBootstrap: true` and restart the kubelet

`sudo systemctl restart kubelet.service`

### Steps 3: Return to the master node and the Signed the certificate
In each case, Kubelet will generate a CSR and submit it to the APIServer. You need to approve the CSR for each Kubelet on your cluster.
```bash
 kubectl get csr
 kubectl certificate approve csr-lkxps
 kubectl certificate approve csr-njrrm 
 kubectl certificate approve csr-rzrws
 kubectl certificate approve csr-thmcp
 kubectl get csr
```
Again restart kubelet.service.\
`sudo systemctl restart kubelet.service`

Get the name of the Metric Server pod.\
`kubectl get pods -n kube-system | grep metrics-server`

If you want to see the top pods based on CPU.\
`kubectl top pods --sort-by cpu -A`

And to see the top pods based on memory usage.\
`kubectl top pods --sort-by memory`

By default, these serving certificate will expire after one year. So, in one year, a new CSR will be generated by Kubelet and you will need to approve it, this is not automagic.

**If it does not work, delete the metrics-server, and reinstall it. I believe it should work perfectly afterward**