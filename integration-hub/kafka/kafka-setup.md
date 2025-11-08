
<h2>Apache Kafka KRaft (No Zookeeper) Cluster Setup Guide</h2>

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


### 👤 Steps 2. Create Kafka User, Group & Directories (All Nodes)

**Create User & Group**
```bash
groupadd kafka
useradd -r -s /sbin/nologin -g kafka kafka
```
**Create Directories**

```bash
mkdir -p /etc/kafka
mkdir -p /data/kafka
mkdir -p /data/log/kafka
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
chown -R kafka:kafka /data/kafka
chown -R kafka:kafka /data/log
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
```bash
echo -e "
rules:
- pattern: \".*\"
" > /etc/kafka/config/jmx_exporter_kraft.yml
```

### 🪵 Steps 5. Configure Log4j Rotation & Append rotation policies (All Nodes)

```bash
sed -i "s/yyyy-MM-dd-HH/yyyy-MM-dd/g" /etc/kafka/config/log4j.properties

echo -e "
log4j.appender.kafkaAppender.triggeringPolicy=org.apache.log4j.rolling.TimeBasedTriggeringPolicy
log4j.appender.kafkaAppender.triggeringPolicy.interval=7
log4j.appender.kafkaAppender.triggeringPolicy.intervalUnits=days

log4j.appender.stateChangeAppender.triggeringPolicy=org.apache.log4j.rolling.TimeBasedTriggeringPolicy
log4j.appender.stateChangeAppender.triggeringPolicy.interval=3
log4j.appender.stateChangeAppender.triggeringPolicy.intervalUnits=days

log4j.appender.requestAppender.triggeringPolicy=org.apache.log4j.rolling.TimeBasedTriggeringPolicy
log4j.appender.requestAppender.triggeringPolicy.interval=3
log4j.appender.requestAppender.triggeringPolicy.intervalUnits=days

log4j.appender.cleanerAppender.triggeringPolicy=org.apache.log4j.rolling.TimeBasedTriggeringPolicy
log4j.appender.cleanerAppender.triggeringPolicy.interval=3
log4j.appender.cleanerAppender.triggeringPolicy.intervalUnits=days

log4j.appender.controllerAppender.triggeringPolicy=org.apache.log4j.rolling.TimeBasedTriggeringPolicy
log4j.appender.controllerAppender.triggeringPolicy.interval=3
log4j.appender.controllerAppender.triggeringPolicy.intervalUnits=days

log4j.appender.authorizerAppender.triggeringPolicy=org.apache.log4j.rolling.TimeBasedTriggeringPolicy
log4j.appender.authorizerAppender.triggeringPolicy.interval=3
log4j.appender.authorizerAppender.triggeringPolicy.intervalUnits=days
" >> /etc/kafka/config/log4j.properties
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
Environment="KAFKA_HEAP_OPTS=-Xms4g -Xmx4g"
Environment="JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64"
Environment="KAFKA_HOME=/etc/kafka"
Environment="KAFKA_LOG4J_CONFIG=/etc/kafka/config/log4j.properties"
Environment="KAFKA_OPTS=-javaagent:/etc/kafka/libs/jmx_prometheus_javaagent-0.20.0.jar=7071:/etc/kafka/config/jmx_exporter_kraft.yml -Dkafka.logs.dir=/data/log/kafka"

WorkingDirectory=/etc/kafka
ExecStart=/etc/kafka/bin/kafka-server-start.sh /etc/kafka/config/kraft/server.properties
ExecStop=/etc/kafka/bin/kafka-server-stop.sh /etc/kafka/config/kraft/server.properties

Restart=on-failure
RestartSec=5
LimitNOFILE=infinity

[Install]
WantedBy=multi-user.target
```


### 🧩 Step 7. Configure Kafka KRaft (server.properties) for Each Node
**Notes:**
- Copy the appropriate file content to each node’s server.properties: kafka1-server.properties, kafka2-server.properties, kafka3-server.properties.

- Update node.id, listeners, and advertised.listeners per node in the server.properties file.

Backup existing server.properties config file.\
`cp /etc/kafka/config/kraft/server.properties /etc/kafka/config/kraft/server.properties.backup`

Edit configuration.\
`vim /etc/kafka/config/kraft/server.properties`

```bash
process.roles=broker,controller
node.id=1
controller.quorum.voters=1@192.168.169.85:9093,2@192.168.169.86:9093,3@192.168.169.87:9093

listeners=PLAINTEXT://192.168.169.85:9092,CONTROLLER://192.168.169.85:9093
advertised.listeners=PLAINTEXT://192.168.169.85:9092
inter.broker.listener.name=PLAINTEXT
controller.listener.names=CONTROLLER
listener.security.protocol.map=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT

log.dirs=/data/kafka
num.partitions=6
offsets.topic.replication.factor=3
transaction.state.log.replication.factor=3
transaction.state.log.min.isr=3

log.retention.hours=168
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000
```

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

`cat /data/kafka/meta.properties`


### 🚀 Steps 9. Start Kafka Services

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

Check the Cluster Controller (Leader).\
`/etc/kafka/bin/kafka-metadata-quorum.sh --bootstrap-server 172.17.18.202:9092 describe --status`

Verify All Brokers Are Connected.\
`/etc/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server 172.17.18.200:9092`

Check broker API versions (to confirm cluster membership).\
`/etc/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server 172.17.18.200:9092`

Prints (shows) the content of the Kafka controller log.\
`cat /data/log/kafka/controller.log`

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

### Steps 12. File & Process Limits Tuning

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