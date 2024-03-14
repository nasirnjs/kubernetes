




## Creating a Deployment

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


`kubectl describe deployment nginx-deployment`


## Checking Rollout History of a Deployment

First, check the revisions of this Deployment.\
`kubectl rollout history deployment/nginx-deployment`


To see the details of each revision, run.\
`kubectl rollout history deployment/nginx-deployment --revision=2`


## Rolling Back to a Previous Revision 
