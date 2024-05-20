
## Trivy
Trivy is a popular open-source vulnerability scanner that is easy to use and integrates well with various CI/CD pipelines and container platforms. It can scan container images, file systems, and Git repositories for known vulnerabilities

## Scan images for known vulnerabilities (Trivy)

Install [References](https://aquasecurity.github.io/trivy/v0.31.3/getting-started/installation/)

Simply specify an image name.\
`trivy image python:3.4-alpine`

Can we scan tarball archives using trivy ?.\
`trivy image --input nginx.tar`

Pull python:3.10.0a4-alpine image on controlplane host and scan the same using trivy. Save the scan results in /root/python_alpine.txt file on controlplane host.
```bash
crictl pull python:3.10.0a4-alpine
trivy image --output /root/python_alpine.txt python:3.10.0a4-alpine
```
Report output redirect to a file.\
`trivy image --severity HIGH --output /root/python.txt python:3.6.12-alpine3.11`

There is a docker image file /root/alpine.tar on controlplane host, scan this archive file using trivy and save the results in /root/alpine.json file in json format.\
`trivy image --input /root/alpine.tar --format json --output /root/alpine.json`
