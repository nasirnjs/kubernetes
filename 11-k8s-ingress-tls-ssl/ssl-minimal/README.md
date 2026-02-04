# Deploy Application in K8s Cluster with SSL/TLS Security
**Table of Contenst:**
- [Deploy Application in K8s Cluster with SSL/TLS Security](#deploy-application-in-k8s-cluster-with-ssltls-security)
  - [Steps 1: Deploy application and Service](#steps-1-deploy-application-and-service)
      - [Steps 1.1: Deploy application and Service that have k8s directory](#steps-11-deploy-application-and-service-that-have-k8s-directory)
  - [Steps 2: Configure Ingress](#steps-2-configure-ingress)
      - [Steps 2.1: Install IngressNginx.](#steps-21-install-ingressnginx)
  - [Steps 3: Update A Record your Domain.](#steps-3-update-a-record-your-domain)
  - [Steps 4: Install Cert Managet.](#steps-4-install-cert-managet)
  - [Steps 5: Install TLS Certificate.](#steps-5-install-tls-certificate)

## Steps 1: Deploy application and Service

#### Steps 1.1: Deploy application and Service that have k8s directory

## Steps 2: Configure Ingress

#### Steps 2.1: Install IngressNginx.
Install Ingress via helm from [HERE](https://github.com/kubernetes/ingress-nginx/tree/main/charts/ingress-nginx) or deployment manifest file from [HERE](https://github.com/kubernetes/ingress-nginx), here is the Ingress installation example via Helm.
```zsh
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install any-name ingress-nginx/ingress-nginx
```
** **Configure your Ingress resources as per your Frontend and Backend Application** **

## Steps 3: Update A Record your Domain.
Update domain **A** record as Ingress controller Public IP.

## Steps 4: Install Cert Managet.
Install Cert Manager via helm from [HERE](https://cert-manager.io/docs/installation/helm/) or Default static file install from [HERE](https://cert-manager.io/docs/installation/)\

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.19.2/cert-manager.yaml
```
**Recomand to Install via static manifest file, here is the example of Helm**
```bash
helm repo add jetstack https://charts.jetstack.io --force-update

helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.19.2 \
  --set crds.enabled=true
```
Check cert manager API is ready.\
`kubectl cert-manager check api`

## Steps 5: Install TLS Certificate.
Apply & cert `issuer.yaml` and Create an Ingress resource `ingress.yaml` with exect reference of issuers.

Here is the Example of `Issuer.yaml` file.

```bash
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: admin@nasirtechtalks.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
```

Here is the example of `ingress.yaml` file.

```bash
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ingress-services
  annotations:
    cert-manager.io/cluster-issuer: letsencrypt-prod
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - nasirtechtalks.com
    secretName: nasirtechtalks-tls
  rules:
  - host: nasirtechtalks.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: nasir-python
            port:
              number: 80
```


<p align="center">
  🎉🎉🎉 Congratulations!!! Enjoy your k8s Cluster with SSL Certificate 🎉🎉🎉
</p>