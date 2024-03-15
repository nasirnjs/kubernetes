




## Creating a Deployment


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

First, check the revisions of this Deployment.\
`kubectl rollout history deployment/nginx-deployment`


To see the details of each revision, run.\
`kubectl rollout history deployment/nginx-deployment --revision=2`


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
