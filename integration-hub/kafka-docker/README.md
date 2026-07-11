# Kafka Docker — Single Node (KRaft)

Single-broker Kafka cluster using KRaft mode (no ZooKeeper) with Redpanda Console UI.

## Stack

| Service | Image | Port |
|---|---|---|
| Kafka | apache/kafka:4.3.1 | `9092` (external), `29092` (internal) |
| Kafka UI | redpandadata/console:latest | `8080` |

---

## Prerequisites

- Docker >= 24
- Docker Compose >= 2.x

---

## 1. Generate Cluster ID

A Kafka KRaft cluster requires a stable unique ID. Generate it **once** and never change it after the first start — changing it will make existing data unreadable.

```bash
uuidgen | tr -d '-'
```

---

## 2. Create .env File

Create a `.env` file in this directory:

```bash
# Replace <paste-uuid-here> with the output from step 1
KAFKA_CLUSTER_ID=<paste-uuid-here>

# Set to your machine's IP if connecting from other machines
# For local-only access use: localhost
KAFKA_ADVERTISED_HOST=192.168.147.194
```

Find your machine's IP:

```bash
ipconfig getifaddr en0      # macOS
hostname -I | awk '{print $1}'  # Linux
```

---

## 3. Start

```bash
docker compose up -d
```

Kafka takes ~30 seconds to become healthy. Check status:

```bash
docker compose ps
```

---

## 4. Access

| Service | URL |
|---|---|
| Kafka UI | http://localhost:8080 |
| Kafka broker (external) | `localhost:9092` |
| Kafka broker (internal, containers) | `kafka:29092` |

---

## Listener Design

| Listener | Address | Purpose |
|---|---|---|
| `INTERNAL` | `kafka:29092` | Container-to-container communication on `kafka-net` |
| `EXTERNAL` | `<KAFKA_ADVERTISED_HOST>:9092` | Access from host machine or other machines |
| `CONTROLLER` | `kafka:9093` | KRaft quorum traffic — never exposed |

Applications running inside Docker should use `kafka:29092`.
Applications running outside Docker should use `<host-ip>:9092`.

---

## Common Commands

**List topics:**
```bash
docker exec kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:29092 --list
```

**Create a topic:**
```bash
docker exec kafka /opt/kafka/bin/kafka-topics.sh \
  --bootstrap-server localhost:29092 \
  --create --topic my-topic --partitions 3 --replication-factor 1
```

**Produce a message:**
```bash
docker exec -it kafka /opt/kafka/bin/kafka-console-producer.sh \
  --bootstrap-server localhost:29092 --topic my-topic
```

**Consume messages:**
```bash
docker exec -it kafka /opt/kafka/bin/kafka-console-consumer.sh \
  --bootstrap-server localhost:29092 --topic my-topic --from-beginning
```

**View logs:**
```bash
docker compose logs -f kafka
docker compose logs -f kafka-ui
```

---

## Stop & Cleanup

```bash
# Stop containers (data preserved)
docker compose down

# Stop and remove all data
docker compose down -v
```

---

## Configuration Reference

| Variable | Default | Description |
|---|---|---|
| `KAFKA_CLUSTER_ID` | required | Unique cluster ID — generate once |
| `KAFKA_ADVERTISED_HOST` | `localhost` | IP/hostname advertised to external clients |
| `KAFKA_LOG_RETENTION_HOURS` | `168` | Retain messages for 7 days |
| `KAFKA_NUM_PARTITIONS` | `10` | Default partitions for new topics |
| `KAFKA_MESSAGE_MAX_BYTES` | `5242880` | Max message size (5MB) |
| `KAFKA_HEAP_OPTS` | `-Xmx1G -Xms1G` | JVM heap size |

---

## Notes

- `KAFKA_AUTO_CREATE_TOPICS_ENABLE` is set to `false` — create topics explicitly
- Logs are capped at 30MB per container (3 × 10MB rotated files)
- Data persists in Docker named volume `kafka-data`
- Add `.env` to `.gitignore` — never commit it
