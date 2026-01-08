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
        "Federated": "arn:aws:iam::690894442426044:oidc-provider/oidc.eks.us-east-2.amazonaws.com/id/112F8F36C989BBJDFD45BB31C0321018"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "oidc.eks.us-east-2.amazonaws.com/id/112F8F36C989BBJDFD45BB31C0321018:aud": "sts.amazonaws.com",
          "oidc.eks.us-east-2.amazonaws.com/id/112F8F36C989BBJDFD45BB31C0321018:sub": "system:serviceaccount:kube-system:alb-ingress-controller"
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

# Update AWS Load Balancer Controller version

Check Existing Helm Releases.\
`helm list -n kube-system`

Search for Available Chart Versions.\
`helm search repo eks/aws-load-balancer-controller --versions`

Before upgrading, check your current values.\
`helm get values aws-load-balancer-controller -n kube-system`

Upgrade or Downgrade the Release.\
`helm upgrade aws-load-balancer-controller eks/aws-load-balancer-controller --version 1.3.3 -n kube-system`

Verify the controller’s status.\
`kubectl get pods -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller`
