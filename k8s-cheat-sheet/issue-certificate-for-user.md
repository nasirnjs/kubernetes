<h2> How to Create a User in a Kubernetes Cluster and Grant Access </h2>

**Table of Contents**
- [1. Generate a Certificate for the User `nasir-user`](#1-generate-a-certificate-for-the-user-nasir-user)
- [2. Create a CertificateSigningRequest](#2-create-a-certificatesigningrequest)
- [3. Approve the CertificateSigningReques](#3-approve-the-certificatesigningreques)
- [4. Get the certificate](#4-get-the-certificate)
- [5. Create Role and RoleBinding](#5-create-role-and-rolebinding)
- [6. Configure the Developer's kubeconfig](#6-configure-the-developers-kubeconfig)
  - [6.1. First get Cluster name and CA Data](#61-first-get-cluster-name-and-ca-data)
    - [6.1.1 Get the Cluster Name](#611-get-the-cluster-name)
    - [6.1.2 Get the Cluster's CA Certificate](#612-get-the-clusters-ca-certificate)
    - [6.1.3 Decode the CA Certificate Data](#613-decode-the-ca-certificate-data)
  - [6.2. Set the Cluster Information](#62-set-the-cluster-information)
  - [6.3. Configure the Developer's Kubeconfig](#63-configure-the-developers-kubeconfig)
- [7. Test Access](#7-test-access)
- [8. Back to Cluster Admin Account](#8-back-to-cluster-admin-account)




## 1. Generate a Certificate for the User `nasir-user`

```
# Generate a private key
openssl genrsa -out nasir-user.key 2048

# Generate a CSR
openssl req -new -key nasir-user.key -out nasir-user.csr -subj "/CN=nasir-user/O=dev-team"

```


## 2. Create a CertificateSigningRequest

**Some points to note:**

usages has to be 'client auth'

expirationSeconds could be made longer (i.e. 864000 for ten days) or shorter (i.e. 3600 for one hour)

request is the base64 encoded value of the CSR file content. You can get the content using this command:

`cat nasir-user.csr | base64 | tr -d "\n"`

```bash
cat <<EOF | kubectl apply -f -
apiVersion: certificates.k8s.io/v1
kind: CertificateSigningRequest
metadata:
  name: nasir-user
spec:
  request: LS0tLS1CRUdJTiBDRVJUSUZJQ0FURSBSRVFVRVNULS0tLS0KTUlJQ2JUQ0NBVlVDQVFBd0tERVRNQkVHQTFVRUF3d0tibUZ6YVhJdGRYTmxjakVSTUE4R0ExVUVDZ3dJWkdWMgpMWFJsWVcwd2dnRWlNQTBHQ1NxR1NJYjNEUUVCQVFVQUE0SUJEd0F3Z2dFS0FvSUJBUUNvOExJekkwNStySFdXCmxqbDRjNi9QTjNIL3J0TWpYbmk1OSsyOXNCVSs3RHhqN3MxcFlaM0Y5M1VwdDJxcmFyTjIvQlpReFlodU5IQW8KUlFobG9ocmVWRkZKZ1dDTUUrTXhvcnI2N0ptRXBhM1dUK3BtQkNuUGRibWp0M2toeEFHTmozWks5QWZrdWR3agpsa3ZPdjIvQk1PQmhEZDdFSENEbmJ5U0ZvbUVmbDhNMkJEbVkxVk1BeFl3ODBZZUxNNHJ4V2dPM00xUnpCYlhyCmRtTzEzTm5WNW1EOU5CTUoxaDQ3M0tUTXlMK09uSU5aYUl2NHVFWGNVRC9GbmRyc3N0a1NQUWp4NWwxL0hvaDkKMVdyUFdaajByZm9YWGtNUGxVakxsSkF4RTRhQ1ZnbkdGRHZManZVeFFyTVllM2ltRmtQbFVhSktScnQ2VjRyTgpTUFB3OTNaOUFnTUJBQUdnQURBTkJna3Foa2lHOXcwQkFRc0ZBQU9DQVFFQUVqNWpFQ1g1R1JsZGRxOXo4R2phCjNuVnoxVHVreE42YlVaYlFjS1hQV1hqSWJodllLc3ZUOXBra0hrdHpId1J4Zks5aUdLYUlDK1VhTXk3Vm9HY1QKanROVlN1SVpaVXprZEs1cHdObkNCMGowblV0eGhKbWlVcitTUy9xeTB3b0IxOEZCdkd1ZFJhYVlkL1ovNUNlNAowWUdoMmRCOTdIQk92cTJuSnh3bjMwRVlzQVE4czdldGx2eks1RlhxYm1yNzM2WWErYk5vL3NrSW5kd3NmbkpUCmM1bEcrUlAxSEZjWWJDZktiTTZGQ2dldHdUN0ZSTlE4Y2hmdWI2SWhMeldVY3A2VTdpMHFZSGwrRDdibjBBQ1gKeXdFMkx4UmVycnNCUnBuRWdoV2dzUmlyNVFsTzZRSHpBTStRdFE0QUNTTFF2OXdvRkhoemxXV2pMcDc3WDVuUgpUdz09Ci0tLS0tRU5EIENFUlRJRklDQVRFIFJFUVVFU1QtLS0tLQo=
  signerName: kubernetes.io/kube-apiserver-client
  expirationSeconds: 7776000  # 90 days
  usages:
  - client auth
EOF
```

## 3. Approve the CertificateSigningReques

Get the list of CSRs.\
`kubectl get csr`

Approve the CSR.\
`kubectl certificate approve nasir-user`


## 4. Get the certificate

Retrieve the certificate from the CSR.\
`kubectl get csr/nasir-user -o yaml`

The certificate value is in Base64-encoded format under status.certificate. Export the issued certificate from the CertificateSigningRequest.\
`kubectl get csr nasir-user -o jsonpath='{.status.certificate}'| base64 -d > nasir-user.crt`


## 5. Create Role and RoleBinding 
With the certificate created it is time to define the Role and RoleBinding for this user to access Kubernetes cluster resources. This is a sample command to create a Role for this new user.\
`kubectl create role developer --verb=create --verb=get --verb=list --verb=update --verb=delete --resource=pods`

This is a sample command to create a RoleBinding for this new user.\
`kubectl create rolebinding developer-binding --role=developer --user=nasir-user`


## 6. Configure the Developer's kubeconfig
### 6.1. First get Cluster name and CA Data
#### 6.1.1 Get the Cluster Name
You can get the cluster name by running the following command:
`kubectl config view --minify=true -o jsonpath='{.clusters[].name}'`

#### 6.1.2 Get the Cluster's CA Certificate
You can get the path to your cluster's CA certificate from your kubeconfig file. Typically, it's located at ~/.kube/config.

`grep certificate-authority ~/.kube/config`

#### 6.1.3 Decode the CA Certificate Data
Decode the base64-encoded CA certificate data obtained from ~/.kube/config. This will give you the actual content of the CA certificate.\
`echo "<CA_CERTIFICATE_DATA>" | base64 --decode > ca.crt`

### 6.2. Set the Cluster Information
Get the current cluster details, including the API server URL
`kubectl cluster-info`

Set the cluster information in the developer's kubeconfig using the decoded CA certificate file.\
`kubectl config set-cluster your_cluster_name --server=https://your-kubernetes-api-server:6443 --certificate-authority=ca.crt`

### 6.3. Configure the Developer's Kubeconfig
Configure the developer's kubeconfig with the cluster information, user credentials, and context.
```bash
kubectl config set-credentials nasir-user --client-certificate=nasir-user.crt --client-key=nasir-user.key --embed-certs=true
kubectl config set-context nasir-user-context --cluster=your_cluster_name --user=nasir-user
kubectl config use-context nasir-user-context
```

## 7. Test Access
Test the developer's access by running kubectl commands.

```bash
kubectl get pods
kubectl get services
# etc
```


## 8. Back to Cluster Admin Account 
`kubectl config get-contexts`

`kubectl config use-context kubernetes-admin@kubernetes`

`kubectl get pod -A`


[Reference](https://kubernetes.io/docs/reference/access-authn-authz/certificate-signing-requests/#normal-user)
