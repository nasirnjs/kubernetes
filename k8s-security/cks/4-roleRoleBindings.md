- An existing Pod named web-pod is running in the namespace db.

- Create a new Role in the namespace db named role-2 and run only delete operations on resources of type namespaces.

- Create a new RoleBinding named role-2-binding that binds the newly created Role to the Pod's ServiceAccount.

`kubectl create role role-2 --verb=delete --resource=namespaces -n db`

`kubectl create rolebinding role-2-binding --role=role-2 --serviceaccount=db:service-account-web -n db`

