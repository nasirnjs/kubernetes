
##  Step 1: Generate Private Key and CSR for

```bash
# Generate private key
openssl genrsa -out nasir.key 4096

# Generate CSR with CN=nasir
openssl req -new -key nasir.key -out nasir.csr -subj "/CN=nasir/O=readonly"
```

## Step 2: Sign CSR with Kubernetes CA (Valid for 365 Days)

```bash
openssl x509 -req -in nasir.csr \
  -CA /etc/kubernetes/pki/ca.crt \
  -CAkey /etc/kubernetes/pki/ca.key \
  -CAcreateserial -out nasir.crt \
  -days 365 -sha256
```

##  Step 3: Create Custom Read-Only ClusterRole

`readonly-clusterrole.yaml`

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: readonly-nasir
rules:
- apiGroups: [""]
  resources:
    - pods
    - pods/log    # 👈 this line allows logs
    - services
    - nodes
    - namespaces
    - endpoints
    - configmaps
    - secrets
    - persistentvolumes
    - persistentvolumeclaims
  verbs: ["get", "list", "watch"]
- apiGroups: ["apps", "batch"]
  resources:
    - deployments
    - replicasets
    - statefulsets
    - daemonsets
    - jobs
    - cronjobs
  verbs: ["get", "list", "watch"]
- apiGroups: ["rbac.authorization.k8s.io"]
  resources:
    - roles
    - rolebindings
    - clusterroles
    - clusterrolebindings
  verbs: ["get", "list", "watch"]
```

## Step 4: Bind the Role Binding

`readonly-clusterrolebinding.yaml`

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRoleBinding
metadata:
  name: readonly-nasir-binding
roleRef:
  apiGroup: rbac.authorization.k8s.io
  kind: ClusterRole
  name: readonly-nasir
subjects:
- kind: User
  name: nasir
  apiGroup: rbac.authorization.k8s.io

```

## Step 5: Create Kubeconfig File for user

First, encode certificates in base64:

```bash
CERT_DATA=$(base64 -w 0 < nasir.crt)
KEY_DATA=$(base64 -w 0 < nasir.key)
CA_DATA=$(kubectl config view --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}')
CLUSTER_NAME=$(kubectl config view -o jsonpath='{.clusters[0].name}')
CLUSTER_ENDPOINT=$(kubectl config view -o jsonpath='{.clusters[0].cluster.server}')

```
Automate this with a one-liner

```yaml
cat <<EOF > nasir.kubeconfig
apiVersion: v1
kind: Config
clusters:
- cluster:
    certificate-authority-data: $CA_DATA
    server: $CLUSTER_ENDPOINT
  name: $CLUSTER_NAME
contexts:
- context:
    cluster: $CLUSTER_NAME
    user: nasir
  name: nasir-context
current-context: nasir-context
users:
- name: nasir
  user:
    client-certificate-data: $CERT_DATA
    client-key-data: $KEY_DATA
EOF
```

## Step 6: Test the Access

`KUBECONFIG=nasir.kubeconfig kubectl get pods --all-namespaces`


Full Cluster-Wide Read-Only Role for All Resources (including logs)