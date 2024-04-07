
<h2> Understanding Ingress Rewrite Targets: $1 vs $2 </h2>

- Use `$1` when you want to include the entire matched portion of the URL path.
- Use `$2` when you only want to include the portion of the URL path captured by the second capturing group
  
---
```bash
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: website-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
spec:
  rules:
  - host: cloudopsschool.com
    http:
      paths:
      - pathType: ImplementationSpecific
        path: /?(.*)
        backend:
          service:
            name: stu-mnm-fe
            port:
              number: 80
      - pathType: ImplementationSpecific
        path: /be/api?(.*)
        backend:
          service:
            name: stu-mnm-be
            port:
              number: 80
```
The rewrite target $1 will include the entire matched portion of the URL path. Let's see how it affects the routing

- `/be/api` will be rewritten to `/be/api` and forwarded to the stu-mnm-be service.

- The entire matched portion of the URL path is included in the rewrite target, so `/be/api` is preserved.
  
- `/` anything will be rewritten to `/` followed by the captured part of the URL path and forwarded to the stu-mnm-fe service.

- Since `/` matches the first rule capturing any path `(/?(.*))`, the entire matched portion of the URL path will be included in the rewrite target. So, for example, `/anything` will be rewritten to `/anything` and forwarded to stu-mnm-fe.


---
```bash
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: website-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
  - host: cloudopsschool.com
    http:
      paths:
      - pathType: ImplementationSpecific
        path: /?(.*)
        backend:
          service:
            name: stu-mnm-fe
            port:
              number: 80
      - pathType: ImplementationSpecific
        path: /be/api?(.*)
        backend:
          service:
            name: stu-mnm-be
            port:
              number: 80
```
The rewrite target using $2, only the part of the URL path captured by the second capturing group.
- `/be/api` will be rewritten to `/api` and forwarded to the stu-mnm-be service.
- `/` anything will be rewritten to an empty string and forwarded to the stu-mnm-fe service.
