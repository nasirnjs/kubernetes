

ImagePolicyWebhook

`vim /etc/kubernetes/epconfig/admission_configuration.json`

```yaml
apiVersion: apiserver.config.k8s.io/v1
kind: AdmissionConfiguration
plugins:
  - name: ImagePolicyWebhook
    configuration:
      imagePolicy:
        kubeConfigFile: /etc/kubernetes/epconfig/kubeconfig.json
        allowTTL: 50
        denyTTL: 50
        retryBackoff: 500
        defaultAllow: false
```

admission kubeconfig file location.\
`vim /etc/kubernetes/epconfig/kubeconfig.json`


Edit kubeapi server, enable admission pluging and admission controler configuration file.\
`sudo vim /etc/kubernetes/manifests/kube-apiserver.yaml`

```yaml
--enable-admission-plugins=ImagePolicyWebhook
--admission-control-config-file=/etc/kubernetes/epconfig/admission_configuration.json
```

Finally, test that the configuration works by attempting to deploy the vulnerable resource /cks/img/web1.yaml.