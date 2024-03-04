
- [Kubernetes simple Nginx Pod](#kubernetes-simple-nginx-pod)
- [`kubectl api-resources -o wide`](#kubectl-api-resources--o-wide)
- [Deployment Declarative \& Imperative ways example](#deployment-declarative--imperative-ways-example)
- [ReplicaSet \& autoscaling](#replicaset--autoscaling)
- [Kubernetes "Persistent Volumes"](#kubernetes-persistent-volumes)
- [StatefulSet \& Headless Service](#statefulset--headless-service)



## Kubernetes simple Nginx Pod

**Step 1: Create a YAML file named nginx-pod.yaml for for declarative way to create a pod**

`vim nginx-pod.yaml`

```bash
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod
spec:
  containers:
  - name: nginx-container
    image: nginx
    ports:
    - containerPort: 80
```

`kubectl apply -f nginx-pod.yaml`

`kubectl get pods`

**Steps 2: Here's an example imperative (command-line) approaches:**

`kubectl run nginx-pod-imperative --image=nginx --port=80 --restart=Never`

`kubectl get pods`

`kubectl api-resources -o wide`
---

## Deployment Declarative & Imperative ways example

**Steps 1: Deployment Declarative way, Create a YAML file named nginx-deployment.yaml**

`vim nginx-deployment.yaml`

```bash
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx-container
        image: nginx:latest
        ports:
        - containerPort: 80
```

`kubectl apply -f nginx-deployment.yaml`

**Steps 2: Create deployment Imperative Way (Command-Line)**

`kubectl create deployment nginx-deployment --image=nginx:latest --replicas=3`

`kubectl create deployment --image=nginx nginx --replicas=4 --dry-run=client -o yaml > nginx-deployment.yaml`


Verify Deployment.

```bash
kubectl get deployments
kubectl get pods
```
---

## ReplicaSet & autoscaling
A ReplicaSet's purpose is to maintain a stable set of replica Pods running at any given time. As such, it is often used to guarantee the availability of a specified number of identical Pods.

Increase replicas number for nginx-deployment.\
`kubectl scale deployment/nginx-deployment --replicas=5`

Using autoscaling.\
`kubectl autoscale deployment/nginx-deployment --min=2 --max=5`


[Reference](https://www.clickittech.com/devops/kubernetes-autoscaling/#h-the-kubernetes-horizontal-pod-autoscaler-nbsp)

---

## Kubernetes "Persistent Volumes" 

**Step 1: Create a Persistent Volume (PV)**.\
Create a YAML file pv.yaml and define a Persistent Volume. Adjust the parameters like capacity, accessModes, and hostPath to suit your requirements.

`vim pv.yaml`

```bash
apiVersion: v1
kind: PersistentVolume
metadata:
  name: my-pv
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: "/var/mydata/"    #worker nodes must have this path
```

`kubectl apply -f pv.yaml`

**Step 2: Create a Persistent Volume Claim (PVC)**.\
Create a YAML file pvc.yaml and define a Persistent Volume Claim. Ensure the resources and accessModes match your requirements and the PV you created.

`vim pvc.yaml`

```bash
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: my-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
```

`kubectl apply -f pvc.yaml`

**Step 3: Create a Pod using the PVC**.\
Create a YAML file pod.yaml and define a Pod that uses the PVC created in the previous step.

`vim pod.yaml`

```bash
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
  - name: my-container
    image: nginx
    volumeMounts:
    - name: my-storage
      mountPath: /usr/share/nginx/html
  volumes:
  - name: my-storage
    persistentVolumeClaim:
      claimName: my-pvc
```
`kubectl apply -f pod.yaml`

---

## StatefulSet & Headless Service

```bash
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: web
spec:
  serviceName: "mysql"  # Referring to the name of the Headless Service
  replicas: 3
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: ["ReadWriteOnce"]
      storageClassName: nfs-client
      resources:
        requests:
          storage: 2Gi
```


In your StatefulSet definition, the serviceName field should match the metadata.name of the Headless Service. Here's a snippet from the StatefulSet.

```bash
apiVersion: v1
kind: Service
metadata:
  name: mysql  # This is the name of the Headless Service
  labels:
    app: web
spec:
  ports:
  - port: 80
    name: web
  clusterIP: None
  selector:
    app: web
```