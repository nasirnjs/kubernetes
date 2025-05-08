</h2> 🛠️ Karpenter Installation Guide for an Existing Amazon EKS Cluster </h2>

Karpenter is an open-source autoscaler for Kubernetes developed by AWS. It automatically launches and terminates EC2 instances based on the requirements of your cluster's workloads.


## Prerequisites
- An existing Amazon EKS cluster (1.21+)
- kubectl, eksctl, helm, and aws CLI installed and configured
- IAM permissions to create roles and policies


## Step 1: Set Environment Variables

```bash
export KARPENTER_NAMESPACE="kube-system"
export KARPENTER_VERSION="1.4.0"
export K8S_VERSION="1.31"
export AWS_PARTITION="aws"
export CLUSTER_NAME="karpenter-c1"
export AWS_DEFAULT_REGION="us-east-2"
export AWS_ACCOUNT_ID="$(aws sts get-caller-identity --query Account --output text)"
export TEMPOUT="$(mktemp)"
export ALIAS_VERSION="$(aws ssm get-parameter --name "/aws/service/eks/optimized-ami/${K8S_VERSION}/amazon-linux-2023/x86_64/standard/recommended/image_id" --query Parameter.Value | xargs aws ec2 describe-images --query 'Images[0].Name' --image-ids | sed -r 's/^.*(v[[:digit:]]+).*$/\1/')"
```

## Deploy Karpenter CloudFormation Template

```bash
curl -fsSL https://raw.githubusercontent.com/aws/karpenter-provider-aws/v"${KARPENTER_VERSION}"/website/content/en/preview/getting-started/getting-started-with-karpenter/cloudformation.yaml > "${TEMPOUT}"

aws cloudformation deploy \
  --stack-name "Karpenter-${CLUSTER_NAME}" \
  --template-file "${TEMPOUT}" \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides "ClusterName=${CLUSTER_NAME}"
```

## Tag Subnets and Security Groups

```bash
for NODEGROUP in $(aws eks list-nodegroups --cluster-name "${CLUSTER_NAME}" --query 'nodegroups' --output text); do
    aws ec2 create-tags \
        --tags "Key=karpenter.sh/discovery,Value=${CLUSTER_NAME}" \
        --resources $(aws eks describe-nodegroup --cluster-name "${CLUSTER_NAME}" \
        --nodegroup-name "${NODEGROUP}" --query 'nodegroup.subnets' --output text )
done
```

```bash
NODEGROUP=$(aws eks list-nodegroups --cluster-name "${CLUSTER_NAME}" --query 'nodegroups[0]' --output text)
LAUNCH_TEMPLATE=$(aws eks describe-nodegroup --cluster-name "${CLUSTER_NAME}" --nodegroup-name "${NODEGROUP}" --query 'nodegroup.launchTemplate.{id:id,version:version}' --output text | tr -s "\t" ",")

SECURITY_GROUPS=$(aws ec2 describe-launch-template-versions \
  --launch-template-id "${LAUNCH_TEMPLATE%,*}" --versions "${LAUNCH_TEMPLATE#*,}" \
  --query 'LaunchTemplateVersions[0].LaunchTemplateData.[NetworkInterfaces[0].Groups||SecurityGroupIds]' \
  --output text)

aws ec2 create-tags \
  --tags "Key=karpenter.sh/discovery,Value=${CLUSTER_NAME}" \
  --resources "${SECURITY_GROUPS}"
```

## Setup Pod Identity and Maping setup

define both the IAM service account for Karpenter and the IAM identity mapping for EC2 worker nodes in a single eksctl YAML config file.

`eksctl create addon --cluster karpenter-c1 --name eks-pod-identity-agent`

`vim podidentityassociation.yaml`

```bash
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig
metadata:
  name: karpenter-c1  # Must match existing cluster
  region: us-east-2   # Must match cluster region

iam:
  podIdentityAssociations:
    - namespace: kube-system
      serviceAccountName: karpenter
      roleName: karpenter-c1-karpenter
      permissionPolicyARNs:
        - arn:aws:iam::605134426044:policy/KarpenterControllerPolicy-karpenter-c1
```
`eksctl create podidentityassociation -f podidentityassociation.yaml`

`vim iamidentitymapping.yaml`

```bash
apiVersion: eksctl.io/v1alpha5
kind: ClusterConfig
metadata:
  name: karpenter-c1   # Must match your cluster name
  region: us-east-2    # Must match your cluster region

iamIdentityMappings:
  - arn: "arn:aws:iam::605134426044:role/KarpenterNodeRole-karpenter-c1"
    username: system:node:{{EC2PrivateDNSName}}
    groups:
      - system:bootstrappers
      - system:nodes
```

`eksctl create iamidentitymapping -f iamidentitymapping.yaml`


## Install karpenter via helm

```bash
helm registry logout public.ecr.aws

helm upgrade --install karpenter oci://public.ecr.aws/karpenter/karpenter \
  --version "${KARPENTER_VERSION}" \
  --namespace "${KARPENTER_NAMESPACE}" --create-namespace \
  --set "settings.clusterName=${CLUSTER_NAME}" \
  --set "settings.interruptionQueue=${CLUSTER_NAME}" \
  --set controller.resources.requests.cpu=1 \
  --set controller.resources.requests.memory=1Gi \
  --set controller.resources.limits.cpu=1 \
  --set controller.resources.limits.memory=1Gi \
  --wait
```

`kubectl get pods -n kube-system`

## Create NodePool and EC2NodeClass

```bash
cat <<EOF | envsubst | kubectl apply -f -
apiVersion: karpenter.sh/v1
kind: NodePool
metadata:
  name: default
spec:
  template:
    spec:
      requirements:
        - key: kubernetes.io/arch
          operator: In
          values: ["amd64"]
        - key: kubernetes.io/os
          operator: In
          values: ["linux"]
        - key: karpenter.sh/capacity-type
          operator: In
          values: ["on-demand"]
        - key: karpenter.k8s.aws/instance-category
          operator: In
          values: ["c", "m", "r", "t"]
        - key: karpenter.k8s.aws/instance-generation
          operator: Gt
          values: ["2"]
      nodeClassRef:
        group: karpenter.k8s.aws
        kind: EC2NodeClass
        name: default
      expireAfter: 720h
  limits:
    cpu: 1000
  disruption:
    consolidationPolicy: WhenEmptyOrUnderutilized
    consolidateAfter: 1m
---
apiVersion: karpenter.k8s.aws/v1
kind: EC2NodeClass
metadata:
  name: default
spec:
  role: "KarpenterNodeRole-${CLUSTER_NAME}"
  amiSelectorTerms:
    - alias: "al2023@${ALIAS_VERSION}"
  subnetSelectorTerms:
    - tags:
        karpenter.sh/discovery: "${CLUSTER_NAME}"
  securityGroupSelectorTerms:
    - tags:
        karpenter.sh/discovery: "${CLUSTER_NAME}"
EOF
```

## Deploy Test Application

`kubectl create deployment nginx-deployment --image=nginx --replicas=5`

`kubectl get nodeclaims`


## If you are not owner of Cluster

`kubectl apply -f crd-access.yaml`

```bash
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: crd-creator
rules:
- apiGroups: ["apiextensions.k8s.io"]
  resources: ["customresourcedefinitions"]
  verbs: ["create", "get", "list", "watch", "delete", "update"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: crd-creator-binding
subjects:
- kind: User
  name: nasir  # Replace with actual IAM username
  apiGroup: rbac.authorization.k8s.io
roleRef:
  kind: ClusterRole
  name: crd-creator
  apiGroup: rbac.authorization.k8s.io
```

`kubectl auth can-i create crds --as=nasir`