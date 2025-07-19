# Steps to Install AWS Load Balancer Controller on EKS

## Steps 1: Create IAM policy for Load Balancer Controller

[Download](https://docs.aws.amazon.com/eks/latest/userguide/lbc-manifest.html) an IAM policy for the AWS Load Balancer Controller that allows it to make calls to AWS APIs on your behal.

`curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.13.3/docs/install/iam_policy.json`

Create an IAM policy using the policy downloaded in the previous step.

`aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://3.0-iam_policy.json`

## Steps 2: Create Role for Load Balancer Controller

Retrieve the OIDC provider URL for your cluster:

`aws eks describe-cluster --name meetup-may2025 --query "cluster.identity.oidc.issuer" --output text`

`vim 3.1-trust-policy.json`

```
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/<OIDC_PROVIDER>"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
		  "<OIDC_PROVIDER>:aud": "sts.amazonaws.com",
          "<OIDC_PROVIDER>:sub": "ystem:serviceaccount:kube-system:alb-ingress-controller"
        }
      }
    }
  ]
}
```
### Steps 2.1 Create the IAM AmazonEKSLoadBalancerController Role using the trust policy:

`aws iam create-role --role-name AmazonEKSLoadBalancerControllerRole --assume-role-policy-document file://3.1-trust-policy.json`

### Steps 2.2 Retrieve the Policy ARN with AWS CLI for attach this policy with EKSLoadBalancerController.

`aws iam list-policies --scope Local --query "Policies[?PolicyName=='AWSLoadBalancerControllerIAMPolicy'].Arn" --output text`

### Steps 2.3: Attach the IAM policy created in Step 1 to the role:
`aws iam attach-role-policy --role-name AmazonEKSLoadBalancerControllerRole --policy-arn arn:aws:iam::605134426044:policy/AWSLoadBalancerControllerIAMPolicy`


## Steps 3: Get AmazonEKSLoadBalancerControllerRole ARN for Helm ALB

`aws iam get-role --role-name AmazonEKSLoadBalancerControllerRole --query 'Role.Arn' --output text`


`helm repo add eks https://aws.github.io/eks-charts`

```bash
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
--set clusterName=meetup-may2025 \
--set vpcId=vpc-0e14bb6861fa70da6 \
--set serviceAccount.create=true \
--set serviceAccount.name=alb-ingress-controller \
--set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"="arn:aws:iam::605134426044:role/AmazonEKSLoadBalancerControllerRole" \
--namespace kube-system
```

## Steps 4: Deploy sample applications

`kubectl create -f 3.2-ingress-example.yaml`