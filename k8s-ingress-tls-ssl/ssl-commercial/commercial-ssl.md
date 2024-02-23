## How to Install Commercial SSL/TLS for Kubernetes IngressNginx


**Steps 1: Deploy application and Service**

**Steps 2: Install Ingress Controller**

 Install IngressNginx via helm from [HERE](https://github.com/kubernetes/ingress-nginx/tree/main/charts/ingress-nginx) or deployment manifest file from [HERE](https://github.com/kubernetes/ingress-nginx)

**Steps 3:** Update your domain **A** record as Ingress controller Public IP.

**Steps 4: Generating a CSR and and generate Private Key via OPENSSL**

`sudo openssl req -newkey rsa:2048 -nodes -keyout nasir.xyz.key -out nasir.xyz.csr` 

It will be prompted for several lines of information that will be included in your certificate request. The most important part is the **Common Name** field, which should match the name that you want to use your certificate with – for example, **nasir.xyz**, or (for a wildcard certificate request) ***.example.com.**.\
This will generate a **nasir.xyz.key** and **nasir.xyz.csr** file. The .key file is your private **.key***, and should be kept secure. The **.csr** file is what you will send to the CA to request your SSL certificate.

**Step 5: Purchasing and Obtaining SSL Certificate**.\
There are many commercial CA providers, and you can compare and contrast the most appropriate options for your own setup. You will need to upload the CSR that you generated in the previous step. Your CA provider will also likely have an “Approver” step, which will send a validation request email to an address in your domain’s WHOIS record or to an administrator type address of the domain that you are getting a certificate for.\
After approving the certificate, the certificate will be emailed to you or you could able to download SLL certificate from ssl certificate authority portal. Copy and save them to your server in the same location that you generated your private key and CSR. Name the certificate with the domain name and a .crt extension, e.g. **nasir.xyz.crt**, and name the intermediate certificate intermediate.crt.

**Step 6: Creating the Kubernetes Secret**.\
Next, we must link the certificate and key to a Kubernetes Secret. This is done by running the following command.\
`kubectl create secret tls ingress-cert --key=certs/nasir.xyz.key --cert=certs/nasir.xyz.crt -o yaml`

The actual secret can be retrieved using **kubectl get secret**.\


**Steps 7: Create a new Ingress Nginx resource manifest to expose your service with SLL/TLS**.\
Create a file called may-ingress.yaml and declare the Ingress resource using the SSL/TLS configuration parameters as follows.
```bash
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sample-app-ingress
  namespace: default
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - nasir.xyz
    secretName: ingress-cert    #Secret name that you create vis ssl certificate on Steps: 6
  rules:
  - host: "nasir.xyz"
    http:
      paths:
        - pathType: Prefix
          path: "/"
          backend:
            service:
              name: sample-app-service
              port:
                number: 80
```
Finally apply this into the Kubernetes cluster.\
`kubectl apply -f may-ingress.yaml`


<p align="center">
  🎉🎉🎉 Congratulations!!! Enjoy your SSL/TLS Connection 🎉🎉🎉
</p>