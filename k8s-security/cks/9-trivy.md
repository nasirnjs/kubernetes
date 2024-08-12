
Find images with Higher Critical severity vulnerabilities and remove Pods that use them

`kubectl describe pod -n secdein | grep -i image:`

`trivy image -s HIGH,CRITICAL nginx | grep -i Total`

