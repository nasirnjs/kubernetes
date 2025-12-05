Add label name=erp to the ERP namespace.\
`kubectl label namespace erp name=erp`

Add label name=un-known to the un-known namespace.\
`kubectl label namespace un-known name=un-known`

Verify the labels on all namespaces.\
`kubectl get namespaces --show-labels`


```bash
apt-get update
apt-get install -y iputils-ping
```


✅ Summary:
- Same namespace: yes, only podSelector is enough.
- Different namespace: you must use namespaceSelector + podSelector