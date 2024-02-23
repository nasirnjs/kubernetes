
# Deploy Application Frontend+Backend with SSL/TLS Security

## Deploy application and Service

### Steps 1: Deploy frontend application and Service

### Steps 2: Deploy backend application and Service


## Configure Ingress TLS/SSL Certificates

### Steps 1: Install IngressNginx.
Install Ingress via helm from [HERE](https://github.com/kubernetes/ingress-nginx/tree/main/charts/ingress-nginx) or deployment manifest file from [HERE](https://github.com/kubernetes/ingress-nginx), here is the Ingress installation example via Helm.
```zsh
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install any-name ingress-nginx/ingress-nginx
```
** **Configure your Ingress resources as per your Frontend and Backend Application** **

### Steps 2: Update A Record your Domain.
Update domain **A** record as Ingress controller Public IP.

### Steps 3: Install Cert Managet.
Install Cert Manager via helm from [HERE](https://cert-manager.io/docs/installation/helm/) or Default static file install from [HERE](https://cert-manager.io/docs/installation/)\
**Recomand to Install via static manifest file, here is the example of Helm**
```bash
helm repo add jetstack https://charts.jetstack.io --force-update
helm repo update
helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --version v1.14.2 \
  --set installCRDs=true
```
Check cert manager API is ready!. First, make sure that cmctl is installed from [HERE](https://cert-manager.io/docs/reference/cmctl/#installation) or you could install `cmctl` via following curl cmd.\
`curl -L -o kubectl-cert-manager.tar.gz https://github.com/jetstack/cert-manager/releases/latest/download/kubectl-cert_manager-linux-amd64.tar.gz tar xzf kubectl-cert-manager.tar.gz sudo mv kubectl-cert_manager /usr/local/bin`

`kubectl cert-manager check api`

### Steps 4: Install TLS Certificate.
Apply cert Issuer `issuer.yaml` and Create an Ingress resource `ingress-service.yaml` with exect reference of issuers.