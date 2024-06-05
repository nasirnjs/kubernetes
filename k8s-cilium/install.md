helm install cilium cilium/cilium \
    --namespace kube-system \
    --set ipam.mode=kubernetes \
    --set kubeProxyReplacement=true \
    --set hubble.ui.enabled=true \
    --set hubble.relay.enabled=true \
    --set envoy.prometheus.enabled=true \
    --set k8sServiceHost=localhost \
    --set k8sServicePort=7445 \
    --set ipam.operator.clusterPoolIPv4PodCIDRList=192.168.170.0/16
