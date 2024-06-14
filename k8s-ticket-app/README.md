

## frontend directory has frontend app with Dockerfile

## eticket-be directory has backend app with Dockerfile

## eticket-db has mongodb existing sample data

## k8s and k8s-env has all k8s related file


## Create a Temporary pod for connection test and try ti connect headless service
`kubectl run -i --tty --rm debug-mongo --image=mongo --restart=Never -- bash`

```
apt update
apt install iputils-ping
apt install dnsutils
```

`mongosh mongodb-sts-0.eticker-mongodb.default.svc.cluster.local:27017/admin --username root --password Password`

`mongosh mongodb-sts-0.eticker-mongodb.default.svc.cluster.local:27017/eticket --username eticket --password eticket`

**Insert Data into eticket DB via CLI and MongoDB Compass**

