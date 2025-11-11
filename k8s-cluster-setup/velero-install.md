## Install AWS CLI and assign proper permission


```bash
wget https://github.com/vmware-tanzu/velero/releases/download/v1.17.0-rc.1/velero-v1.17.0-rc.1-linux-amd64.tar.gz
tar -xvf velero-v1.17.0-rc.1-linux-amd64.tar.gz
sudo mv velero-v1.17.0-rc.1-linux-amd64/velero /usr/local/bin/
velero version --client-only
```


## Steps 2: Create S3 Backup Bucket

```bash
aws s3api create-bucket \
    --bucket velero-backup-carrybee \
    --region ap-southeast-1 \
    --create-bucket-configuration LocationConstraint=ap-southeast-1
```


```bash
aws s3api put-bucket-versioning \
    --bucket velero-backup-carrybee \
    --versioning-configuration Status=Enabled
```

## 🛠️ Step 3. Create IAM Policy for Velero

`vim velero-policy.json`

```bash
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:DescribeVolumes",
        "ec2:DescribeSnapshots",
        "ec2:CreateTags",
        "ec2:CreateVolume",
        "ec2:CreateSnapshot",
        "ec2:DeleteSnapshot"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:PutObject",
        "s3:AbortMultipartUpload",
        "s3:ListMultipartUploadParts"
      ],
      "Resource": "arn:aws:s3:::velero-backup-carrybee/*"
    },
    {
      "Effect": "Allow",
      "Action": "s3:ListBucket",
      "Resource": "arn:aws:s3:::velero-backup-carrybee"
    }
  ]
}
```


```bash
aws iam create-policy \
  --policy-name VeleroBackupPolicy \
  --policy-document file://velero-policy.json
```


## Step 3. Create IAM Role for ServiceAccount (IRSA)

```bash
eksctl create iamserviceaccount \
  --cluster carrybee-migration-cluster \
  --namespace velero \
  --name velero \
  --attach-policy-arn arn:aws:iam::491203818637:policy/VeleroBackupPolicy \
  --region ap-southeast-1 \
  --approve
```

## Steps 4. Velero RBAC Configuration for AWS EKS Backups

`vim velero-rbac.yaml`

```bash
apiVersion: v1
kind: ServiceAccount
metadata:
  name: velero
  namespace: velero

---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: velero-clusterrole
  labels:
    component: velero
rules:
  # Core Kubernetes resources
  - apiGroups: [""]
    resources: 
      - "persistentvolumes"
      - "persistentvolumeclaims"
      - "namespaces"
      - "secrets"
      - "configmaps"
      - "serviceaccounts"
      - "nodes"
    verbs: ["*"]
  
  # Pod operations for backup/restore
  - apiGroups: [""]
    resources: ["pods", "pods/exec", "pods/log"]
    verbs: ["get", "list", "watch", "create", "update", "delete"]
  
  # Secrets specific permissions (for repo credentials)
  - apiGroups: [""]
    resources: ["secrets"]
    verbs: ["get", "list", "watch", "create", "update", "delete"]
  
  # Apps API group (for daemonsets, deployments, etc.)
  - apiGroups: ["apps"]
    resources: ["daemonsets", "deployments", "replicasets", "statefulsets"]
    verbs: ["get", "list", "watch"]
  
  # Batch API group (for jobs)
  - apiGroups: ["batch"]
    resources: ["jobs", "cronjobs"]
    verbs: ["get", "list", "watch"]
  
  # Discovery permissions - needed for resource enumeration
  - apiGroups: ["*"]
    resources: ["*"]
    verbs: ["list"]
  
  # CRD permissions
  - apiGroups: ["apiextensions.k8s.io"]
    resources: ["customresourcedefinitions"]
    verbs: ["get", "list", "watch", "create"]
  
  # Velero Custom Resources - THIS IS THE MISSING PART!
  - apiGroups: ["velero.io"]
    resources: 
      - "backups"
      - "restores"
      - "schedules"
      - "downloadrequests"
      - "podvolumebackups"
      - "podvolumerestores"
      - "backupstoragelocations"
      - "volumesnapshotlocations"
      - "serverstatusrequests"
      - "deletebackuprequests"
      - "backuprepositories"
      - "datauploads"
      - "datadownloads"
    verbs: ["*"]
  
  # Storage permissions
  - apiGroups: ["storage.k8s.io"]
    resources: ["csidrivers", "csinodes", "storageclasses", "volumeattachments"]
    verbs: ["get", "list", "watch", "create"]
  
  # Volume snapshot permissions (for CSI snapshots)
  - apiGroups: ["snapshot.storage.k8s.io"]
    resources: ["volumesnapshots", "volumesnapshotcontents", "volumesnapshotclasses"]
    verbs: ["get", "list", "watch", "create", "update", "delete"]
  
  # Events for monitoring
  - apiGroups: [""]
    resources: ["events"]
    verbs: ["get", "list", "watch", "create", "update", "patch"]
  # Add these to the rules section of your ClusterRole
  - apiGroups: ["scheduling.k8s.io"]
    resources: ["priorityclasses"]
    verbs: ["get", "list", "watch"]
  
  - apiGroups: ["rbac.authorization.k8s.io"]
    resources: ["clusterroles", "clusterrolebindings"]
    verbs: ["get", "list", "watch"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: velero-clusterrolebinding
  labels:
    component: velero
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: velero-clusterrole
subjects:
  - kind: ServiceAccount
    name: velero
    namespace: velero
```

🚀 Step 5. Install Velero (CLI-based)

```bash
velero install \
  --provider aws \
  --plugins velero/velero-plugin-for-aws:v1.13.0 \
  --bucket velero-backup-carrybee \
  --backup-location-config region=ap-southeast-1 \
  --snapshot-location-config region=ap-southeast-1 \
  --namespace velero \
  --service-account-name velero \
  --no-secret \
  --use-node-agent
```

## Verify Installation

Check all pods are running.\
`kubectl get pods -n velero`

Restart to apply new RBAC (if needed).\
`kubectl rollout restart deployment/velero -n velero`

```bash
velero backup create final-clean-backup-$(date +%Y%m%d-%H%M) \
  --include-namespaces '*' \
  --snapshot-volumes \
  --wait
```

Check the final backup status.\
`velero backup describe final-clean-backup-20251110-0938`

Verify no errors in logs.\
`velero backup logs final-clean-backup-20251110-0938 | grep -i "error\|warn\|fail"`

List all your backups.\
`velero backup get`

```bash
final-clean-backup-20251110-0938   Completed         0        0          2025-11-10 09:38:37 +0000 UTC   29d       default            <none>
full-cluster-20251110-0922         PartiallyFailed   215      0          2025-11-10 09:22:56 +0000 UTC   29d       default            <none>
root@ip-10-46-5-110:/tmp# 
```
Check backup storage location.\
`velero backup-location get`

Restoring from your Velero backup .\
`velero restore create --from-backup final-clean-backup-20251110-0938`


## Schedule Automated Backups

Daily backup at 2 AM
```bash
velero create schedule daily-backup \
  --schedule="0 2 * * *" \
  --include-namespaces '*' \
  --snapshot-volumes
```
With retention policy (30 days)
```bash
velero create schedule daily \
  --schedule="@daily" \
  --ttl 720h0m0s
```
