helm install cilium cilium/cilium \
    --namespace kube-system \
    --set ipam.mode=kubernetes \
    --set kubeProxyReplacement=true \
    --set hubble.ui.enabled=true \
    --set hubble.relay.enabled=true \
    --set envoy.prometheus.enabled=true \
    --set k8sServiceHost=localhost \
    --set k8sServicePort=6443 \
    --set ipam.operator.clusterPoolIPv4PodCIDRList=192.168.170.0/16
    
    
helm install cilium cilium/cilium --version 1.15.5 \
  --namespace kube-system \
  --set kubeProxyReplacement=true \
  --set ipam.operator.clusterPoolIPv4PodCIDRList=192.168.170.0/16 \
  --set hubble.relay.enabled=true \
  --set hubble.ui.enabled=true



helm delete cilium -n kube-system
