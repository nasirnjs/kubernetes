
<h2> Certified Kubernetes Security Specialist (CKS) Exam study guide </h2>
Table of Contents

- [Kubesec](#kubesec)
- [Scan images for known vulnerabilities (Trivy)](#scan-images-for-known-vulnerabilities-trivy)
- [Falco](#falco)
  - [Key Features](#key-features)
- [How Falco Works](#how-falco-works)
  - [Use Cases in DevOps](#use-cases-in-devops)
  - [Integration in DevOps Workflows](#integration-in-devops-workflows)
- [Installing Falco with Kubernetes](#installing-falco-with-kubernetes)



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

## Falco
Falco is an open-source runtime security tool that helps detect unexpected application behavior and configuration changes in real-time. Originally developed by Sysdig, it has since become an incubation project within the Cloud Native Computing Foundation (CNCF).\ 
Here’s a detailed look at Falco in the DevOps context:

### Key Features
1. Real-Time Detection: Falco continuously monitors system calls to detect abnormal behavior based on a set of rules.
2. Customizable Rules Engine: Users can write custom rules tailored to their specific environment, making it highly flexible.
3. Container and Host Monitoring: It can monitor both containerized and non-containerized environments, making it versatile for various use cases.
4. Integration with SIEM Tools: Falco can be integrated with Security Information and Event Management (SIEM) tools to enhance security monitoring and incident response capabilities.
5. Alerting and Notification: It supports alerting through various channels such as Slack, email, and webhooks, ensuring timely notification of potential security incidents.

## How Falco Works
- System Call Monitoring: Falco taps into the system call interface to capture detailed information about every action taken by the system, such as file access, network activity, and process execution.
- Rules Engine: The core of Falco is its rules engine, which evaluates system calls against predefined rules. When a rule is violated, Falco generates an alert.
- Anomaly Detection: By defining what constitutes normal behavior for your applications and infrastructure, Falco can detect anomalies that might indicate security breaches, misconfigurations, or other issues.

### Use Cases in DevOps
- Security Monitoring: Falco helps in monitoring Kubernetes clusters and detecting potentially malicious activity, such as container breakouts or privilege escalation attempts.
- Compliance: Ensuring compliance with security policies and standards by continuously monitoring and validating runtime behavior against predefined rules.
- Incident Response: Providing detailed logs and alerts that can be used to quickly identify and respond to security incidents.
- Operational Insights: Offering insights into application behavior and performance issues by monitoring system calls and detecting abnormal patterns.

### Integration in DevOps Workflows
- Kubernetes Integration: Falco is often used in Kubernetes environments to monitor pods and containers. It can be deployed as a DaemonSet to ensure it runs on every node in the cluster.
- CI/CD Pipelines: Integrating Falco with CI/CD pipelines allows for the detection of security issues during the development and deployment phases, preventing insecure code from reaching production.
- Collaboration Tools: Integrating Falco with tools like Slack or PagerDuty ensures that DevOps teams are promptly alerted to any potential security issues, facilitating faster response times.

## Installing Falco with Kubernetes
[Helm References](https://github.com/falcosecurity/charts/tree/master/charts/falco)

[Artifacthub](https://artifacthub.io/packages/helm/falcosecurity/falco/2.0.9)

[Falcosidekick](https://github.com/falcosecurity/charts/tree/master/charts/falcosidekick#configuration)

[Ref1](https://blog.ovhcloud.com/near-real-time-threats-detection-with-falco-on-ovhcloud-managed-kubernetes/)


**Steps 1: Adding falcosecurity repository**
```bash
helm repo add falcosecurity https://falcosecurity.github.io/charts
helm repo update
```
**Steps 2: Install Falco + Falcosidekick + Falcosidekick-ui**\
```bash
helm install falco \
    --create-namespace \
    --namespace falco \
    --set tty=true \
    --set falcosidekick.enabled=true \
    --set falcosidekick.webui.enabled=true \
    --set falcosidekick.webui.redis.storageClass=nfs-client \
    --set falcosidekick.webui.redis.storageEnabled=true \
    --set falcosidekick.webui.redis.storageSize="1Gi" \
    --set falcosidekick.webui.user="myuser:mypassword" \
    --set falcosidekick.webui.service.type=LoadBalancer \
    falcosecurity/falco
```
*Or yu could install using helm values file*


How can you check for the events generated by falco in this set up?\
`journalctl -u falco`

`journalctl -fu falco`

As mentioned in the lecture, falco uses the configuration file located at.\
`/etc/falco/falco.yaml`

Which file was this rule configured in?\
`/etc/falco/falco_rules.local.yam`
