### Make metrics-server work with kubeadm
If you try to install metrics-server into a fresh, up to date, kubeadm cluster, it will fail with this error in the logs.
```
0308 08:41:42.740193       1 scraper.go:149] "Failed to scrape node" err="Get \"https://172.17.18.200:10250/metrics/resource\": tls: failed to verify certificate: x509: cannot validate certificate for 172.17.18.200 because it doesn't contain any IP SANs" node="k8-master"
E0308 08:41:42.743432       1 scraper.go:149] "Failed to scrape node" err="Get \"https://172.17.18.201:10250/metrics/resource\": tls: failed to verify certificate: x509: cannot validate certificate for 172.17.18.201 because it doesn't contain any IP SANs" node="k8-work
```