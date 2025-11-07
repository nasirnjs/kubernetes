
<h2>Apache Kafka KRaft (No Zookeeper) Cluster Setup Guide</h2>

## 🖥️ Step 1. System Preparation (All Nodes)
### 🔑 Switch to Root
`sudo -i`

### 🗂️ Update `/etc/hosts`
`vim /etc/hosts`

```bash
172.17.18.200 kafka1
172.17.18.201 kafka2
172.17.18.202 kafka3
```

### 🚫 Disable Swap
```bash
swapoff -a
sed -i '/swap/d' /etc/fstab
```

### ☕ Install Java
`apt update && apt install -y openjdk-21-jre-headless`

🟩 Verify installation.\
`java -version`





## 👤 Step 2. Create Kafka User, Group & Directories (All Nodes)

### Create User & Group
```bash
groupadd kafka
useradd -r -s /sbin/nologin -g kafka kafka
```
### Create Directories

```bash
mkdir -p /etc/kafka
mkdir -p /data/kafka
mkdir -p /data/log/kafka
```


## 📦 Step 3. Download and Install Kafka (All Nodes)
```bash
cd /opt
wget https://downloads.apache.org/kafka/3.9.0/kafka_2.12-3.9.0.tgz
tar -xzf kafka_2.12-3.9.0.tgz
cp -rp kafka_2.12-3.9.0/* /etc/kafka
```
### Set ownership
```bash
chown -R kafka:kafka /data/kafka
chown -R kafka:kafka /data/log
chown -R kafka:kafka /etc/kafka
```
## 📊 Step 4. Install JMX Prometheus Exporter (All Nodes)

```bash
cd /etc/kafka/libs
wget https://repo1.maven.org/maven2/io/prometheus/jmx/jmx_prometheus_javaagent/0.20.0/jmx_prometheus_javaagent-0.20.0.jar

```
```bash
chown kafka:kafka jmx_prometheus_javaagent-0.20.0.jar
chmod 644 jmx_prometheus_javaagent-0.20.0.jar
```

### Create JMX Exporter Config
```bash
echo -e "
rules:
- pattern: \".*\"
" > /etc/kafka/config/jmx_exporter_kraft.yml
```

## 🪵 Step 5. Configure Log4j Rotation & Append rotation policies (All Nodes)

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


## ⚙️ Step 6. Create Kafka Systemd Service (All Nodes)

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


## 🧩 Step 7. Configure Kafka KRaft (All Nodes)

Backup existing config.\
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

## 🔐 Step 8. Initialize the KRaft Cluster

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

🗂️ To Verify the Cluster ID

`cat /data/kafka/meta.properties`


## 🚀 Step 9. Start Kafka Services

```bash
systemctl daemon-reload
systemctl enable kafka
systemctl start kafka
systemctl status kafka
```
🟩 Check Service Logs.\
View the last 50 lines of recent Kafka service logs (systemd journal).\
`journalctl -u kafka -xe | tail -n 50`

## 🧭 Step 10. Cluster Verification.

Check the Cluster Controller (Leader).\
`/etc/kafka/bin/kafka-metadata-quorum.sh --bootstrap-server 172.17.18.202:9092 describe --status`

Verify All Brokers Are Connected.\
`/etc/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server 172.17.18.200:9092`

Check broker API versions (to confirm cluster membership).\
`/etc/kafka/bin/kafka-broker-api-versions.sh --bootstrap-server 172.17.18.200:9092`

Prints (shows) the content of the Kafka controller log.\
`cat /data/log/kafka/controller.log`
