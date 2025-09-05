
<h2>Deployments</h2>

A Deployment provides declarative updates for Pods and ReplicaSets.

You describe a desired state in a Deployment, and the Deployment Controller changes the actual state to the desired state at a controlled rate. You can define Deployments to create new ReplicaSets, or to remove existing Deployments and adopt all their resources with new Deployments.

**Table of Contents**
- [Creating a Deployment](#creating-a-deployment)
- [Updating nginx-deployment deployment](#updating-nginx-deployment-deployment)
- [Rolling Back a Deploymen](#rolling-back-a-deploymen)
- [Checking Rollout History of a Deployment](#checking-rollout-history-of-a-deployment)
- [Rolling Back to a Previous Revision](#rolling-back-to-a-previous-revision)
- [Scaling a Deployment](#scaling-a-deployment)
- [Deployment Strategy](#deployment-strategy)
  - [Recreate Deployment](#recreate-deployment)
  - [Rolling Update Deployment](#rolling-update-deployment)


## Creating a Deployment
To create a Deployment imperatively (using imperative commands) for nginx.\
`kubectl create deployment nginx-deployment --image=nginx:1.14.2 --replicas=3`

Optionally, you can generate the Deployment manifest.\
`kubectl run deployment nginx-deployment --image=nginx:1.14.2 --replicas=3 --dry-run=client -o yaml`

## Updating nginx-deployment deployment
Let's update the nginx Pods to use the nginx:1.16.1 image instead of the nginx:1.14.2 image.\
`kubectl set image deployment/nginx-deployment nginx=nginx:1.16.1`

Alternatively, you can edit the Deployment and change.\
`kubectl edit deployment/nginx-deployment`

To see the rollout status, run.\
`kubectl rollout status deployment/nginx-deployment`


## Rolling Back a Deploymen
Suppose that you made a typo while updating the Deployment, by putting the image name as nginx:1.161 instead of nginx:1.16.1.\
`kubectl set image deployment/nginx-deployment nginx=nginx:1.161`

The rollout gets stuck. You can verify it by checking the rollout status.\
`kubectl rollout status deployment/nginx-deployment`

Describe Deployment.\
`kubectl describe deployment nginx-deployment`


## Checking Rollout History of a Deployment

Use --record while creating the deployment so that it will start recroding the deployment.\
`kubectl create -f deploy.yaml --record=true`

First, check the revisions of this Deployment.\
`kubectl rollout history deployment/nginx-deployment`

To see the details of each revision, run.\
`kubectl rollout history deployment/nginx-deployment --revision=2`

How to check k8s deploy history.\
`kubectl rollout history deployment/erpbe-pod  --revision=1  -o yaml`

## Rolling Back to a Previous Revision 

Now you've decided to undo the current rollout and rollback to the previous revision.\
`kubectl rollout undo deployment/nginx-deployment`

Alternatively, you can rollback to a specific revision by specifying it with --to-revision.\
`kubectl rollout undo deployment/nginx-deployment --to-revision=2`

Check if the rollback was successful and the Deployment is running as expected, run.\
`kubectl get deployment nginx-deployment`

Get the description of the Deployment.\
`kubectl describe deployment nginx-deployment`


## Scaling a Deployment
You can scale a Deployment by using the following command.
`kubectl scale deployment/nginx-deployment --replicas=10`


Assuming horizontal Pod autoscaling is enabled in your cluster, you can set up an autoscaler for your Deployment and choose the minimum and maximum number of Pods you want to run based on the CPU utilization of your existing Pods.\
`kubectl autoscale deployment/nginx-deployment --min=10 --max=15 --cpu-percent=80`

## Deployment Strategy

### Recreate Deployment
All existing Pods are killed before new ones are created when .spec.strategy.type==Recreate.

### Rolling Update Deployment
The Deployment updates Pods in a rolling update fashion when .spec.strategy.type==RollingUpdate. You can specify maxUnavailable and maxSurge to control the rolling update process.

`maxUnavailable` is an optional field that specifies the maximum number of Pods that can be unavailable during the update process.

`maxSurge` is a parameter used in Kubernetes Deployments to control the number of additional Pods that can be created above the desired number of Pods during a rolling update.


When the maxUnavailable and maxSurge parameters are not explicitly specified in a Deployment manifest, Kubernetes uses default values for these parameters.

**By default**

maxUnavailable is set to 25% of the total number of Pods.
maxSurge is set to 25% of the total number of Pods.
These defaults ensure a balanced rolling update process where at least 75% of the desired Pods are available (ensuring high availability) and allows for up to a 25% increase in the total number of Pods during the update process.

If you don't specify maxUnavailable and maxSurge, Kubernetes will apply these default values to your Deployment. However, it's always good practice to explicitly define these parameters to match your specific requirements and ensure predictable behavior during updates.

# Liveness and Readiness Probes in Kubernetes

Kubernetes **probes** are health checks that the kubelet uses to determine the state of a container.

---

## 1. What are Liveness and Readiness Probes?

### **Liveness Probe**
- Checks if a container is **alive** (running properly).
- If it fails, Kubernetes **restarts the container** automatically.
- **Purpose:** Ensure the container doesn’t hang or enter a deadlock.

### **Readiness Probe**
- Checks if a container is **ready to serve traffic**.
- If it fails, Kubernetes **removes the Pod from Service endpoints**, so it won’t receive requests until ready.
- **Purpose:** Prevent sending traffic to containers that aren’t fully initialized.

---

## 2. How Probes Work

### Probe Types
- **HTTP GET:** Kubernetes sends an HTTP request to a container endpoint, e.g., `/healthz` or `/ready`.
- **TCP Socket:** Kubernetes tries to open a TCP connection on a port.
- **Exec Command:** Kubernetes executes a command inside the container; exit code `0` = success, non-zero = failure.

### Common Fields
| Field | Description |
|-------|-------------|
| `initialDelaySeconds` | Time to wait after container start before first probe. |
| `periodSeconds` | How often to perform the probe. |
| `timeoutSeconds` | How long to wait for a response. |
| `failureThreshold` | Number of failures before action (restart or mark unready). |
| `successThreshold` | Number of successes before marking ready. |

### initialDelaySeconds

- What it is: The number of seconds Kubernetes waits after the container starts before performing the first probe.
- Why it’s important: Some applications need time to initialize before they can respond correctly. If Kubernetes probes too early, it might think the container is unhealthy and restart it unnecessarily.

### periodSeconds
- What it is: How often Kubernetes performs the probe after the initial delay.
- Why it’s important: Determines the frequency of health checks. A shorter interval detects failures faster but adds more load; a longer interval reduces load but detects failures slower.

---

## 3. Importance of Liveness and Readiness Probes

1. **Automatic Recovery**  
   Liveness probes detect hung or deadlocked containers and restart them automatically, improving reliability.

2. **Traffic Management**  
   Readiness probes prevent traffic from going to containers that are not ready, e.g., waiting for DB connections or initialization tasks.

3. **Zero Downtime Deployments**  
   Readiness probes ensure rolling updates don’t route traffic to unready pods, preventing failed requests during deployments.

4. **Resource Optimization**  
   Kubernetes stops sending requests to unready pods, reducing failed requests and CPU/memory waste.

---

## 4. Use Cases

| Probe Type | Use Case Example |
|------------|----------------|
| **Liveness**  | A web server gets stuck in a deadlock — restart automatically. |
| **Readiness** | App waits for database connection — mark unready until DB is available. |
| **Liveness + Readiness** | Microservices that need DB connection and periodic health checks — ensures reliability and safe traffic routing. |

**Example for Spring Boot:**
```java
@RestController
public class HealthController {
    @GetMapping("/healthz")
    public String healthCheck() { return "OK"; } // Liveness

    @GetMapping("/ready")
    public String readinessCheck() { 
        // Optionally check DB connection
        return "READY"; 
    }
}
```
Here’s the  manifest snippet

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: stu-mnm-be
spec:
  replicas: 1
  selector:
    matchLabels:
      app: stu-mnm-be  
  template:
    metadata:
      labels:
        app: stu-mnm-be
    spec:
      containers:
      - name: stu-mnm-be
        image: nasirnjs/stumnmbe:0.0.11
        imagePullPolicy: Always
        ports:
        - containerPort: 8080
        livenessProbe:
          httpGet:
            path: /healthz
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 15
          timeoutSeconds: 5
          failureThreshold: 3
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 10
          periodSeconds: 10
          timeoutSeconds: 3
          failureThreshold: 3
```