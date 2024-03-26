
Lists regions that support DigitalOcean Kubernetes clusters.\
`doctl kubernetes options regions`

Lists machine sizes that you can use in a DigitalOcean Kubernetes cluster.\
`doctl kubernetes options sizes`

Create DigitalOcean  Kubernetes clusters.
```bash
doctl kubernetes cluster create test-cluster \
    --node-pool="name=test-node-pool;size=s-1vcpu-2gb;count=2;auto-scale=true;min-nodes=2;max-nodes=5" \
    --region=sgp1
```

Retrieve the list of Kubernetes clusters for your account.\
`doctl kubernetes cluster list`

Delete Kubernetes clusters.\
`doctl kubernetes cluster delete clusterID/Name`



[References](https://docs.digitalocean.com/reference/doctl/reference/kubernetes/cluster/create/)