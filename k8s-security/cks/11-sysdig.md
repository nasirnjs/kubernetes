
---

`sysdig -M 30 -p '%evt.time,%user.uid,%proc.name' container.id=4648d67aabafe79310e2d25a8c    >> /opt/KSR00101/incidents/summary`

`sysdig -M 30 -p '%evt.time,%user.name,%proc.name' container.id=    >> /opt/KSR00101/incidents/summary`

`sysdig -p'%evt.time, %container.id, %container.name, %user.name, %k8s.ns.name, %k8s.pod.name' container.image=docker.io/library/nginx:latest >> /var/work/tests/artifacts/12/log`
---

`journalctl -fu falco | grep shell`

`grep -A 10 -B 10 'A shell was spawned in a container' /etc/falco/falco_rules.yaml`

`grep -A 10 -B 10 'Drift Detected' /etc/falco/falco_rules.yaml`