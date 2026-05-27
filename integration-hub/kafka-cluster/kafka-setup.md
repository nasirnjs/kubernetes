# Apache Kafka KRaft (No Zookeeper) Cluster Setup Guide

### 🖥️ Steps 1. System Preparation (All Nodes)
**🔑 Switch to Root**.
```bash
sudo -i
```

**🗂️ Update `/etc/hosts`**

```bash
vim /etc/hosts
```

```bash
172.17.18.200 kafka1
172.17.18.201 kafka2
172.17.18.202 kafka3
```

**🚫 Disable Swap**
```bash
swapoff -a
sed -i '/swap/d' /etc/fstab
```

**☕ Install Java**
```bash
apt update && apt install -y openjdk-21-jre-headless
```

**Verify installation**
```bash
java -version
```


### 👤 Steps 2. Create Kafka User, Group, External Volumes & Directories (All Nodes)

> **Directory layout (production):**
> - `/etc/kafka` → Kafka binaries + config (lives on the **OS disk**)
> - `/kafka/data` → topic data (commit log, partitions, segments) — referenced by `log.dirs`. Lives on **external data disk**.
> - `/log/kafka` → service / operational logs (`server.log`, `controller.log`, GC logs) — referenced by `kafka.logs.dir`. Lives on **external log disk**.
>
> `/kafka` and `/log` MUST be on **separate external block devices** (not the OS volume). This isolates topic IO from OS IO and prevents a log spike from filling the data disk.

**2a. Create User & Group**
```bash
groupadd kafka
useradd -r -s /sbin/nologin -g kafka kafka
```

**2b. Kafka Disk Setup**

How to attach, format, mount, and prepare the two external disks for Kafka:
- One disk for **data**
- One disk for **service logs**

**Identify Disks — check all available disks in the system**
```bash
lsblk
```
Example output — OS disk 100 G, Kafka data disk 1 TB, log disk 100 G:
```
sda   100G
sdb     1T
sdc   100G
```

**Format the Disks** — XFS for Kafka data, EXT4 for logs:

```bash
mkfs.xfs  -f /dev/sdb
mkfs.ext4 -F /dev/sdc
```

**Create mount-point folders**
```bash
mkdir -p /kafka /log
```

**Mount the Disks**
```bash
mount -o noatime,nodiratime /dev/sdb /kafka
mount -o noatime            /dev/sdc /log
```

**Make Mount Permanent — `/etc/fstab` (disks stay mounted after reboot)**

```bash
cat >> /etc/fstab <<EOF
/dev/sdb  /kafka  xfs   defaults,noatime,nodiratime  0 2
/dev/sdc  /log    ext4  defaults,noatime             0 2
EOF
```

**Verify fstab + active mounts** — `mount -a` reapplies fstab (errors if syntax is wrong); `df -hT` confirms both volumes are mounted on the correct filesystems:

```bash
mount -a
df -hT /kafka /log
```

**2c. Create Kafka subdirectories on the mounted volumes**

```bash
mkdir -p /etc/kafka /kafka/data /log/kafka
```


### 📦 Steps 3. Download and Install Kafka (All Nodes)
```bash
cd /opt
wget https://downloads.apache.org/kafka/3.9.0/kafka_2.12-3.9.0.tgz
tar -xzf kafka_2.12-3.9.0.tgz
cp -rp kafka_2.12-3.9.0/* /etc/kafka
```
**Set ownership**
```bash
chown -R kafka:kafka /kafka/data
chown -R kafka:kafka /log/kafka
chown -R kafka:kafka /etc/kafka
```
### 📊 Steps 4. Install JMX Prometheus Exporter (All Nodes)

```bash
cd /etc/kafka/libs
wget https://repo1.maven.org/maven2/io/prometheus/jmx/jmx_prometheus_javaagent/0.20.0/jmx_prometheus_javaagent-0.20.0.jar

```
```bash
chown kafka:kafka jmx_prometheus_javaagent-0.20.0.jar
chmod 644 jmx_prometheus_javaagent-0.20.0.jar
```

**Create JMX Exporter Config**

Use the official curated Kafka rules from `prometheus/jmx_exporter` instead of a wildcard `pattern: ".*"` — wildcards explode Prometheus cardinality (thousands of useless MBean metrics per broker).

```bash
wget -O /etc/kafka/config/jmx_exporter_kraft.yml \
  https://raw.githubusercontent.com/prometheus/jmx_exporter/release-0.20.0/example_configs/kafka-2_0_0.yml
chown kafka:kafka /etc/kafka/config/jmx_exporter_kraft.yml
chmod 644 /etc/kafka/config/jmx_exporter_kraft.yml
```

### 🪵 Steps 5. Configure Log Rotation & Retention (All Nodes)

Kafka's default Log4j config rotates broker logs **hourly** and **never deletes** old files — the data disk will eventually fill. Production best practice: rotate **daily** via `logrotate`, retain a fixed number of days, compress old files, and tune log levels to suppress noise.

**5a. Switch Kafka's Log4j file pattern from hourly to daily**

```bash
sed -i "s/yyyy-MM-dd-HH/yyyy-MM-dd/g" /etc/kafka/config/log4j.properties
```

> Do **not** add Log4j's `TimeBasedTriggeringPolicy` — it rotates but does not delete, and conflicts with `logrotate`'s `copytruncate`. Use `logrotate` as the single rotation mechanism (5c).

**5b. Tune log levels (suppress noisy classes)**

```bash
cat >> /etc/kafka/config/log4j.properties <<'EOF'

# --- Production log levels ---
log4j.logger.kafka.network.RequestChannel$=WARN
log4j.logger.kafka.request.logger=WARN
log4j.logger.kafka.controller=INFO
log4j.logger.kafka.log.LogCleaner=INFO
log4j.logger.state.change.logger=INFO
log4j.logger.kafka.authorizer.logger=INFO
EOF
```

> Never run `rootLogger=DEBUG` or enable `request.logger` permanently in production — both produce 10–50× normal log volume.

**5c. Install logrotate config**

```bash
cat > /etc/logrotate.d/kafka <<'EOF'
/log/kafka/server.log
/log/kafka/kafkaServer-gc.log
{
    daily
    rotate 10
    missingok
    notifempty
    compress
    delaycompress
    copytruncate
    dateext
    dateformat -%Y-%m-%d
    su kafka kafka
}

/log/kafka/controller.log
/log/kafka/state-change.log
/log/kafka/log-cleaner.log
/log/kafka/kafka-authorizer.log
{
    daily
    rotate 10
    missingok
    notifempty
    compress
    delaycompress
    copytruncate
    su kafka kafka
}
EOF
```

> **Why `copytruncate`:** Kafka holds open file handles. A normal rename-and-recreate would orphan the FD until restart. `copytruncate` zeroes the file in place so Kafka keeps writing without intervention.

**5d. Retention rationale** — all rotated files kept **10 days** (compressed) per the `rotate 10` setting in 5c.

| File | Purpose |
|------|---------|
| `server.log` | Main broker log — startup, warnings, errors |
| `kafkaServer-gc.log` | JVM garbage-collection log |
| `controller.log` | KRaft consensus / controller events |
| `state-change.log` | Partition leadership and ISR changes |
| `log-cleaner.log` | Log-compaction cleaner activity |
| `kafka-authorizer.log` | ACL allow/deny audit trail |
| `kafka-request.log` | Request traces — disabled by default, enable only when actively debugging |

> If you need longer retention for `controller.log` or `kafka-authorizer.log` (audit/forensics), split them into a separate logrotate block with `rotate 30`.

**5e. Dry-run + verify**

```bash
logrotate -d /etc/logrotate.d/kafka      # dry-run, shows what would happen
logrotate -f /etc/logrotate.d/kafka      # force a rotation now (test only)
ls -lh /log/kafka/                       # confirm rotated + compressed files
```

**5f. Disk-usage alert (recommended)**

`/kafka` and `/log` are already on separate disks (configured in Step 2b). Add a disk-usage alert in your monitoring stack so a runaway log doesn't silently fill `/log` before you notice:

```
node_filesystem_avail_bytes{mountpoint="/log"}   / node_filesystem_size_bytes{mountpoint="/log"}   < 0.15
node_filesystem_avail_bytes{mountpoint="/kafka"} / node_filesystem_size_bytes{mountpoint="/kafka"} < 0.20
```


### ⚙️ Steps 6. Create Kafka Systemd Service (All Nodes)

`vim /etc/systemd/system/kafka.service`

```bash
[Unit]
Description=Apache Kafka Broker
After=network.target

[Service]
User=kafka
Group=kafka
# Heap size 50% of RAM rule (Kafka best practice)
Environment="KAFKA_HEAP_OPTS=-Xms4g -Xmx4g"
Environment="JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64"
Environment="KAFKA_HOME=/etc/kafka"
Environment="KAFKA_OPTS=-javaagent:/etc/kafka/libs/jmx_prometheus_javaagent-0.20.0.jar=7071:/etc/kafka/config/jmx_exporter_kraft.yml -Dkafka.logs.dir=/log/kafka"

WorkingDirectory=/etc/kafka
ExecStart=/etc/kafka/bin/kafka-server-start.sh /etc/kafka/config/kraft/server.properties
ExecStop=/etc/kafka/bin/kafka-server-stop.sh /etc/kafka/config/kraft/server.properties

Restart=on-failure
RestartSec=5
TimeoutStopSec=180          # let Kafka flush state on graceful shutdown (default 90s can SIGKILL mid-flush)
KillMode=process            # only signal the main pid; spare child JVM threads from SIGKILL storm
LimitNOFILE=infinity
LimitNPROC=65536

[Install]
WantedBy=multi-user.target
```


### 🧩 Steps 7. Configure Kafka KRaft (server.properties) for Each Node
**Notes:**
- Copy the appropriate file content to each node’s server.properties: kafka1-server.properties, kafka2-server.properties, kafka3-server.properties.

- Update node.id, listeners, and advertised.listeners per node in the server.properties file.

Backup existing server.properties config file.\
`cp /etc/kafka/config/kraft/server.properties /etc/kafka/config/kraft/server.properties.backup`

Edit configuration.\
`vim /etc/kafka/config/kraft/server.properties`

> **Note:** Replace the IP, `node.id`, and listener addresses to match the node you are configuring.
> Full per-node configs live in `kafka1-server.properties`, `kafka2-server.properties`, `kafka3-server.properties`.

```bash
############################# KRaft and Node Identity #############################
process.roles=broker,controller
node.id=1
controller.quorum.voters=1@172.17.18.200:9093,2@172.17.18.201:9093,3@172.17.18.202:9093

############################# Listener Settings #############################
listeners=PLAINTEXT://172.17.18.200:9092,CONTROLLER://172.17.18.200:9093
advertised.listeners=PLAINTEXT://172.17.18.200:9092
inter.broker.listener.name=PLAINTEXT
controller.listener.names=CONTROLLER
listener.security.protocol.map=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT,SSL:SSL,SASL_PLAINTEXT:SASL_PLAINTEXT,SASL_SSL:SASL_SSL

############################# Log Basics #############################
log.dirs=/kafka/data
num.partitions=6
num.recovery.threads.per.data.dir=1

############################# Replication and Reliability #############################
offsets.topic.replication.factor=3
transaction.state.log.replication.factor=3
transaction.state.log.min.isr=2
default.replication.factor=3
min.insync.replicas=2

############################# Log Retention Policy #############################
log.retention.hours=168
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000

############################# Network and I/O #############################
num.network.threads=8
num.io.threads=16
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=209715200
message.max.bytes=209715200
max.message.bytes=209715200
replica.fetch.max.bytes=209715200

############################# General Broker Settings #############################
auto.create.topics.enable=false
delete.topic.enable=true
unclean.leader.election.enable=false
log.cleaner.enable=true

############################# Replica / Leader Tuning #############################
num.replica.fetchers=4
replica.lag.time.max.ms=30000
auto.leader.rebalance.enable=true
leader.imbalance.check.interval.seconds=300
group.initial.rebalance.delay.ms=3000
compression.type=producer
```

> **Per-node deltas only:**
> | Node | `node.id` | Listener IP | `broker.rack` placeholder |
> |------|-----------|-------------|---------------------------|
> | kafka1 | `1` | `172.17.18.200` | `#broker.rack=rack-1` |
> | kafka2 | `2` | `172.17.18.201` | `#broker.rack=rack-2` |
> | kafka3 | `3` | `172.17.18.202` | `#broker.rack=rack-3` |
>
> Every other line is identical across all three files.

### 🔐 Steps 8. Initialize the KRaft Cluster

**On the First Node:**
```bash
KAFKA_CLUSTER_ID="$(/etc/kafka/bin/kafka-storage.sh random-uuid)"
echo $KAFKA_CLUSTER_ID
/etc/kafka/bin/kafka-storage.sh format -t $KAFKA_CLUSTER_ID -c /etc/kafka/config/kraft/server.properties
```

**On other nodes:**

```bash
export KAFKA_CLUSTER_ID=<same_cluster_id>
/etc/kafka/bin/kafka-storage.sh format -t $KAFKA_CLUSTER_ID -c /etc/kafka/config/kraft/server.properties
```

**🗂️ To Verify the Cluster ID**

`cat /kafka/data/meta.properties`


### 🚀 Steps 9. Start Kafka Services

Run on **all three nodes** (in any order — KRaft will form the quorum once a majority is up):

```bash
systemctl daemon-reload
systemctl enable kafka
systemctl start kafka
systemctl status kafka
```
**Check Service Logs.**\
View the last 50 lines of recent Kafka service logs (systemd journal).\
`journalctl -u kafka -xe | tail -n 50`

### 🧭 Steps 10. Cluster Verification

Check the KRaft controller (leader) status.\
`/etc/kafka/bin/kafka-metadata-quorum.sh --bootstrap-server 172.17.18.200:9092 describe --status`

Verify all brokers are connected (lists broker API versions, confirming cluster membership).\
`/etc/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server 172.17.18.200:9092`

View the KRaft controller log.\
`cat /log/kafka/controller.log`

### Steps 11. Kernel Parameter Tuning

```bash
vim /etc/sysctl.conf
```

```bash
# --- Performance & Connection Handling ---
net.core.somaxconn=8192                 # Max queued connections (prevents connection drops under load)
net.core.netdev_max_backlog=8192        # Max network packets queue before processing
net.ipv4.tcp_max_syn_backlog=8192       # TCP SYN queue size (improves connection handling)
net.ipv4.ip_local_port_range=10000 65000 # Available ports for client connections

# --- File Descriptors & Memory ---
fs.file-max=1000000                     # Max number of open files system-wide
vm.swappiness=1                         # Minimize swapping (keeps Kafka in RAM for stability)

# --- TCP Memory Buffers ---
net.core.wmem_max=12582912              # Max socket write buffer size
net.core.rmem_max=12582912              # Max socket read buffer size
net.ipv4.tcp_rmem=10240 87380 12582912  # Default/Min/Max TCP read buffer
net.ipv4.tcp_wmem=10240 87380 12582912  # Default/Min/Max TCP write buffer

# --- Network Security (Optional, but Recommended) ---
net.ipv4.conf.all.accept_redirects=0    # Prevent ICMP redirects
net.ipv4.conf.all.send_redirects=0
net.ipv4.icmp_ignore_bogus_error_responses=1
net.ipv4.conf.all.rp_filter=1           # Prevent spoofed packets
```

Apply the changes immediately (without rebooting) and verify a sample value:

```bash
sysctl -p
sysctl net.core.somaxconn vm.swappiness
```

### Steps 12. File & Process Limits Tuning

> **Note:** `/etc/security/limits.conf` only applies to **PAM login sessions**. The Kafka systemd service inherits limits from the unit file (`LimitNOFILE=infinity`, `LimitNPROC=65536` already set in Step 6). This block matters when an operator runs `kafka-server-start.sh` manually as the `kafka` user (e.g., for debugging).

```bash
vim /etc/security/limits.conf
```

```bash
# --- For Kafka User ---
kafka soft nofile 1000000
kafka hard nofile 1000000
kafka soft nproc 65536
kafka hard nproc 65536

# --- For Root (Optional, for admin tasks) ---
root soft nofile 95000
root hard nofile 95000
root soft nproc 95000
root hard nproc 95000
```

### Steps 13. Disable Transparent Huge Pages (THP) Tuning

```bash
cat <<EOF > /etc/systemd/system/disable-thp.service
[Unit]
Description=Disable Transparent Huge Pages
After=sysinit.target local-fs.target

[Service]
Type=oneshot
ExecStart=/bin/sh -c "echo never > /sys/kernel/mm/transparent_hugepage/enabled"
ExecStart=/bin/sh -c "echo never > /sys/kernel/mm/transparent_hugepage/defrag"
RemainAfterExit=yes

[Install]
WantedBy=multi-user.target
EOF
```

```bash
systemctl enable disable-thp
systemctl start disable-thp
```

### Steps 14. Time Synchronization (chrony)

Distributed consensus and consumer-group offset commits depend on consistent clocks across brokers. Install and verify chrony on **all nodes**.

```bash
apt install -y chrony
systemctl enable --now chrony
chronyc tracking
chronyc sources
```

### 🧪 Steps 15. Smoke Tests

```bash
# Create a test topic
/etc/kafka/bin/kafka-topics.sh --bootstrap-server 172.17.18.200:9092 \
  --create --topic smoke-test --partitions 6 --replication-factor 3 \
  --config min.insync.replicas=2

# Describe (verify leader/ISR spread across all 3 brokers)
/etc/kafka/bin/kafka-topics.sh --bootstrap-server 172.17.18.200:9092 \
  --describe --topic smoke-test

# Produce
/etc/kafka/bin/kafka-console-producer.sh --bootstrap-server 172.17.18.200:9092 \
  --topic smoke-test

# Consume from another shell
/etc/kafka/bin/kafka-console-consumer.sh --bootstrap-server 172.17.18.201:9092 \
  --topic smoke-test --from-beginning

# Cleanup
/etc/kafka/bin/kafka-topics.sh --bootstrap-server 172.17.18.200:9092 \
  --delete --topic smoke-test
```

---

### 🔄 Steps 16. Rolling Restart Procedure

Use this for any config or version change. **One broker at a time.**

```bash
# 1. Pick a non-controller broker (find controller first)
/etc/kafka/bin/kafka-metadata-quorum.sh --bootstrap-server 172.17.18.200:9092 describe --status

# 2. Stop, change config, start
systemctl stop kafka
# ... edit config ...
systemctl start kafka

# 3. Wait until URPs == 0 before moving to the next broker
watch -n 2 '/etc/kafka/bin/kafka-topics.sh --bootstrap-server 172.17.18.200:9092 --describe --under-replicated-partitions'
```

If the broker being restarted holds the controller role, the cluster will elect a new controller automatically — do **not** restart two brokers in parallel.


