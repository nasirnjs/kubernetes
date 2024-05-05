
## Steps 1: Create Secreat
`kubectl create secret generic my-secrets --from-literal=somekey=somevalues`

`kubectl describe secrets my-secrets`

`kubectl get secrets my-secrets -o yaml`

`echo "c29tZXZhbHVlcw==" | base64 -d`

## Steps 2: Check present Plain text Secreat
`sudo apt install etcd-client`

```bash
sudo ETCDCTL_API=3 etcdctl \
   --cacert=/etc/kubernetes/pki/etcd/ca.crt   \
   --cert=/etc/kubernetes/pki/etcd/server.crt \
   --key=/etc/kubernetes/pki/etcd/server.key  \
   get /registry/secrets/default/my-secrets | hexdump -C
```
## Steps 3: Write an encryption configuration file

Generate a 32-byte random key and base64 encode it

`head -c 32 /dev/urandom | base64`

Replicate the encryption key

Save the new encryption config file to /etc/kubernetes/enc/enc.yaml

```bash
apiVersion: apiserver.config.k8s.io/v1
kind: EncryptionConfiguration
resources:
  - resources:
      - secrets
    providers:
      - aescbc:
          keys:
            - name: key1
              # See the following text for more details about the secret value
              secret: DG6I6VCx9toTUJuQ8EvXSHk4KhGJzo8YrcQtWh+6+OM=
      - identity: {} 
```
## Steps 4: Edit the manifest for the kube-apiserver

Edit the manifest for the kube-apiserver static pod: /etc/kubernetes/manifests/kube-apiserver.yaml
[Reference](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/#use-the-new-encryption-configuration-file)

Automatically API server will be restart

## Steps 5: Verify that newly written data is encrypted

Create a new Secret called secret1 in the default namespace

`kubectl create secret generic secret1 -n default --from-literal=mykey=mydata`

Using the etcdctl command line tool, read that Secret out of etcd

```bash
ETCDCTL_API=3 etcdctl \
   --cacert=/etc/kubernetes/pki/etcd/ca.crt   \
   --cert=/etc/kubernetes/pki/etcd/server.crt \
   --key=/etc/kubernetes/pki/etcd/server.key  \
   get /registry/secrets/default/secret1 | hexdump -C
```


[References](https://kubernetes.io/docs/tasks/administer-cluster/encrypt-data/)