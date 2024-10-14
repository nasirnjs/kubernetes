
## Create EKS Cluster in AWS via Cli

### **Steps 1: Install AWS Cli**
Install AWS Cli first from [Here](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) or you can install via apt.
```bash
sudo apt update
sudo apt install awscli
```

### **Steps 2: Install ecksctl** 
Install `eksctl` from [Here](https://docs.aws.amazon.com/emr/latest/EMR-on-EKS-DevelopmentGuide/setting-up-eksctl.html)

**Configure AWS CLI**\
`aws configure`

### **Steps 3: Set the AWS Region**

list the AWS regions permitted by your IAM.\
`aws ec2 describe-regions`

From list of region set a default region.\
`aws configure set region us-east-2`

You can check resources of specific region.
```bash
aws ec2 describe-instance-types \
    --query 'InstanceTypes | sort_by([], &MemoryInfo.SizeInMiB) | [*].{InstanceType: InstanceType, CPU: VCpuInfo.DefaultVCpus, Memory: MemoryInfo.SizeInMiB, Storage: InstanceStorageInfo.TotalSizeInGB}' \
    --region us-east-2 | head -n 200
```
### **Steps 4: Apply cluster config yaml file**
Apply `eks-cluster-setup.yaml` file to create eks cluster or you can create cluster imperative way [Ref](https://eksctl.io/getting-started/).\
`eksctl create cluster -f eks-cluster-setup.yaml`

**Update a kubeconfig file for your cluster Replace region-code with the AWS Region that your cluster is in and replace my-cluster with the name of your cluster.** \
`aws eks --region us-east-2 update-kubeconfig --name my-eks-cluster`

### **Steps 5: Delete eks cluster**
`eksctl delete cluster -f eks-cluster-setup.yaml`

`eksctl delete cluster --region us-east-2 --name my-eks-cluster --force`

`kubectl delete pod --all --force --grace-period=0 -A`



---



[AWS ALB](https://kubernetes-sigs.github.io/aws-load-balancer-controller/v2.2/deploy/installation/)

[AWS ALB Sig git](https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main/helm/aws-load-balancer-controller)

