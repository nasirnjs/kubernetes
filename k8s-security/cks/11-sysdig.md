Use a runtime inspection tool to detect anomalous processes that occur and execute frequently in a single container of Pod redis123.
There are two tools available:
- sysdig
- falco

Note: These tools are pre-installed on the cluster's worker node node02 only, not on the master node.

Use the tools to analyze the spawned and executed processes for at least 30 seconds, checking them with filters and writing the events to the file/opt/KSR00101/incidents/summary, which contains the detected events in the following format.

This file contains the detected events in the following format:

*timestamp,uid/username,processName*

Keep the original timestamp format of the tool intact.

Ensure that the events file is stored on a working node in the cluster.
---

`sysdig -M 30 -p '%evt.time,%user.uid,%proc.name' container.id=4648d67aabafe79310e2d25a8c    >> /opt/KSR00101/incidents/summary`

`sysdig -M 30 -p '%evt.time,%user.name,%proc.name' container.id=    >> /opt/KSR00101/incidents/summary`

`sysdig -p'%evt.time, %container.id, %container.name, %user.name, %k8s.ns.name, %k8s.pod.name' container.image=docker.io/library/nginx:latest >> /var/work/tests/artifacts/12/log`
---

`journalctl -fu falco | grep shell`

`grep -A 10 -B 10 'A shell was spawned in a container' /etc/falco/falco_rules.yaml`

`grep -A 10 -B 10 'Drift Detected' /etc/falco/falco_rules.yaml`