
## Kubesec 
`wget https://github.com/controlplaneio/kubesec/releases/download/v2.13.0/kubesec_linux_amd64.tar.gz`

`tar -xvf  kubesec_linux_amd64.tar.gz`

`mv kubesec /usr/bin/`

`kubesec scan k8s-deployment.yaml`

[Refe](https://github.com/controlplaneio/kubesec?tab=readme-ov-file#download-kubesec)


## Scan images for known vulnerabilities (Trivy)

Install [References](https://aquasecurity.github.io/trivy/v0.31.3/getting-started/installation/)

Simply specify an image name.\
`trivy image python:3.4-alpine`

Report output redirect to a file.\
`trivy image --severity HIGH --output /root/python.txt python:3.6.12-alpine3.11`

There is a docker image file /root/alpine.tar on controlplane host, scan this archive file using trivy and save the results in /root/alpine.json file in json format.\
`trivy image --format json --output /root/alpine.json --input alpine.tar`