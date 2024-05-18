

## AppArmor

AppArmor is a Linux security module (LSM) that provides mandatory access control (MAC) by confining programs to a set of rules specified by profiles. It acts as a security framework for controlling which resources processes can access on the system.

#### Key Concepts
Profiles: AppArmor uses profiles to define the permissions and restrictions for specific programs or processes. These profiles specify the allowed accesses to files, directories, network sockets, and other system resources.

#### AppArmor Modes

- Enforce Mode: In enforce mode, AppArmor actively enforces the rules defined in the profiles. If a process attempts to access a resource that is not allowed by its profile, AppArmor blocks the access.
- Complain Mode: In complain mode, AppArmor logs violations of the profile rules but does not enforce them. This mode is useful for testing and troubleshooting profiles without blocking access to resources.
- Rules: AppArmor profiles consist of rules that define allowed accesses to resources. These rules are written using a simple syntax and specify the paths to resources and the types of accesses allowed or denied.

#### Use Cases
- Application Security: AppArmor is commonly used to enhance the security of applications by restricting their access to sensitive resources. For example, web servers, databases, and other server applications can be confined to only access necessary files and directories.

- Process Isolation: AppArmor can isolate processes from each other and from the rest of the system, reducing the impact of potential security vulnerabilities or compromised processes.

- Multi-Tenant Environments: In multi-tenant environments, such as cloud hosting platforms, AppArmor can provide additional security by ensuring that each tenant's processes are confined to their designated resources.

### AppArmor Implementation

**Steps 1: Understanding AppArmor Service and Profiles**
Check AppArmor is installed on your system.\
`sudo systemctl status apparmor.service`

By default, AppArmor is installed on Debian and Ubuntu distributions and you can see how many profiles are loaded.\
`sudo aa-status`

It’s necessary to install additional packages in order to use various AppArmor utilities.\
`sudo apt install apparmor-utils`

**Steps 2: Create AppArmor Profile**.\
Create `deny-write` profile to worker nodes.
```bash
sudo vi /etc/apparmor.d/deny-write

#include <tunables/global>
profile k8s-apparmor-deny-write flags=(attach_disconnected) {
  #include <abstractions/base>
  file,
  # Deny all file writes.
  deny /** w,
}
```
**Steps 3: Load the profile on all our nodes default directory /etc/apparmor.**.\
`sudo apparmor_parser -q /etc/apparmor.d/deny-write`

To check a specific AppArmor profile, such as /etc/apparmor.d/deny-write, is loaded or not!.\
`sudo aa-status | grep deny-write`

Profile is disabled permanently and will not be reloaded after a reboot.\
`sudo aa-disable /etc/apparmor.d/deny-write`

The profile can be reloaded manually or automatically on reboot if it still exists in the /etc/apparmor.d/ directory.\
`sudo apparmor_parser -R /etc/apparmor.d/deny-write`


**Steps 4: Apply AppAmrmor profile to pod or Deployment.**.\
`vim hello-apparmor.yaml`
```bash
apiVersion: v1
kind: Pod
metadata:
  name: hello-apparmor
  annotations:
    container.apparmor.security.beta.kubernetes.io/hello: localhost/k8s-apparmor-deny-write
spec:
  containers:
  - name: hello
    image: busybox
    command: [ "sh", "-c", "echo 'Hello AppArmor!' && sleep 1h" ]
```
Deploy the AppAmrmor pod using kubect.\
`kubectl describe pod hello-apparmor`

**Steps 5: Steps to Verify**
Access the Pod & Open a shell in the running container and Attempt a Write Operation, you will be deny.
```bash
kubectl exec -it hello-apparmor -- sh
echo "Test write operation" > /tmp/testfile
```
*If the AppArmor profile is working correctly, the write operation should be denied. The command should fail with a "Permission denied" error or similar.*
  
Check for logs related to the deny-write profile, you can chain grep commands.\
`sudo journalctl | grep apparmor | grep deny-write`

*By disabling the AppArmor pod annotations and recreating the pod, you will be able to write inside the pod.*



[References 1](https://jumpcloud.com/blog/how-to-configure-apparmor-for-security-debian-ubuntu#:~:text=The%20output%20tells%20you%20how,two%20modes%3A%20enforce%20or%20complain.)
[References 2](https://gitlab.com/apparmor/apparmor/-/wikis/Documentation)
