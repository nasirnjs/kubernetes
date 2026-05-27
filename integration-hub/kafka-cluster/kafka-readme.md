# Kafka Architect's Deep Dive Study Guide

## Message Queue vs Event Streaming
A Message Queue is designed to distribute work, where a message is typically processed once and removed. Event Streaming platforms like Kafka are designed to distribute events, retain them for a period of time, and allow multiple consumers to independently process and replay the same events.

| Aspect               | Message Queue                              | Traditional Pub/Sub                      | Event Streaming (Kafka)                  |
| -------------------- | ------------------------------------------ | ---------------------------------------- | ---------------------------------------- |
| **Delivery Model**   | Usually Push-based                         | Push-based                               | Pull-based                               |
| **Communication**    | Point-to-Point                             | Publish-Subscribe                        | Publish-Subscribe + Persistent Log       |
| **Consumer Pattern** | One message → one consumer                 | One message → many subscribers           | One event → many consumer groups         |
| **Message Storage**  | Temporary                                  | Usually temporary                        | Persistent durable log                   |
| **Replay Support**   | Usually not supported                      | Limited                                  | Fully supported using offsets            |
| **Consumer Control** | Limited                                    | Limited                                  | Full control over offsets & polling      |
| **Backpressure**     | Broker handles delivery                    | Broker pushes to subscribers             | Consumers control read speed             |
| **Scaling**          | Add consumers                              | Add subscribers                          | Add partitions + consumer groups         |
| **Best For**         | Task processing, background jobs           | Notifications, live updates              | Analytics, event-driven systems          |
| **Examples**         | RabbitMQ Queue, Amazon SQS                 | Redis Pub/Sub, NATS, Google Pub/Sub      | Kafka, Pulsar, Redpanda                  |

## What is Kafka?
- Kafka is a system that helps different applications talk to each other using events.
- Kafka is a message system that stores and delivers data between services in real time.
- Kafka works on event-driven architecture, Something happens → event is created → other services react
- Kafka is a distributed event streaming platform that lets microservices communicate by sending and receiving events in real time.
- Single node Kafka is only for development — never use in production e-commerce.

  
## 1. Core Concepts: Beyond the Basics

**Kafka Producer:** A Kafka Producer is a client application that publishes (writes) messages to a Kafka topic. `In e-commerce terms:` The producer is like a customer placing an `order` it creates an event/message and sends it to Kafka.
- Producer sends messages to a topic — not directly to a partition.
- Producer key determines partition — same key always goes to the same partition (e.g., same userId → same partition).
- acks=all means producer waits for all replicas to confirm — safest for e-commerce but slower.
- acks=0 means producer doesn't wait for confirmation — fastest but may lose data.
- Always set acks=all for financial transactions — orders and payments must not disappear.


**Kafka Consumer:** A Kafka Consumer is a client application that reads (subscribes to) messages from a Kafka topic. `In e-commerce terms:` The consumer is like a warehouse worker it picks up `orders` from Kafka and processes them `packing, shipping, payment` .
- One consumer CAN read one partition of a single topic
- One Consumer Can Read from Multiple Partitions of Different Topics
- Consumers are strongly recommended to be part of consumer groups for production environments.
- Never have more consumers than partitions — extra consumers do nothing.
- Consumer PULLs Events from Kafka
- Consumer decides the poll interval (milliseconds to minutes)
  
**Consumer Group:** A consumer group is a set of consumers that work together to read messages from PARTITIONS of a topic — each partition is assigned to only one consumer within the group.
- Never have more consumers than partitions — extra consumers will be idle waste.


**Kafka Topic:** Kafka Topic is a named logical channel or category where producers send messages and consumers read messages from. 
- A topic is a logical category or stream that can hold thousands or even millions of events (messages), all related to the same business entity (e.g., orders, payments, shipments).
- A Kafka Topic is like different **queues** or **sections** in a warehouse:
- A topic can have many partitions
- A single topic is designed to store thousands or millions of events (messages) of the same type.


| Topic Name | What it stores |
|------------|----------------|
| `orders` | All customer order messages |
| `payments` | Payment transaction messages |
| `inventory` | Stock update messages |
| `shipments` | Shipping status messages |
| `notifications` | Email/SMS alert messages |

**Key Characteristics of a Topic**

| Characteristic | Explanation |
|----------------|-------------|
| **Name** | Must be unique (e.g., "orders", "payments") |
| **Partitions** | Topics are split into parts for parallel processing |
| **Replication** | Copies of data for fault tolerance |
| **Immutable** | Messages cannot be changed once written |
| **Retention** | Messages stay for a configured time (e.g., 7 days) |


**Kafka Topic Creation Command**
```bash
bin/kafka-topics.sh --create \
  --topic orders \
  --partitions 6 \
  --replication-factor 3 \
  --bootstrap-server localhost:9092 \
  --config retention.ms=604800000 \
  --config min.insync.replicas=2 \
  --config compression.type=zstd \
  --config cleanup.policy=delete \
  --config unclean.leader.election.enable=false \
  --config segment.bytes=2147483648
```

**Kafka Broker** A Kafka Broker is a server (or node) in a Kafka cluster that stores data and serves client requests (producers and consumers). A Single Node Kafka setup means you have only one broker running on one server/machine.

Simple analogy: Think of a broker as one shelf in a warehouse. The warehouse (Kafka cluster) has many shelves (brokers), and each shelf stores some of the messages (topics/partitions). Single Node Kafka, Instead of a full warehouse with many shelves, you have just one small shelf in a room. All messages (orders, payments, etc.) go on that single shelf.

**Kafka Partition:** A Kafka Partition is a basic unit of parallelism and ordering within a Kafka topic. Each topic is divided into one or more partitions, and messages within a partition are stored in the order they arrive.
- A partition is a dedicated processing lane — orders on the same lane stay in sequence, multiple lanes work in parallel.
- A partition is like a checkout counter in a supermarket — one line, one cashier, order preserved.
- A partition belongs to exactly ONE topic — but one topic can have many partitions.
- For a 3-node cluster, ideal partitions per topic = 3, 6, 9, or 12 always a multiple of 3 for perfect distribution across all brokers.
- Always use a key for ordering requirements — same key = same partition = same order.

**Offset** An offset is a unique, sequential ID assigned to each message within a partition it acts like a page number or position indicator for messages
- Offsets are stored INSIDE partitions as the position indicator for each message. 
- Consumer offsets (commit offsets) are stored separately in __consumer_offsets topic.
- Each message has its offset number stored with it

**Topic:** `orders` Partition 0
- Offset 0 → Order #1000 (Laptop)
- Offset 1 → Order #1001 (Mouse)
- Offset 2 → Order #1002 (Cable)
- Offset 3 → Order #1003 (Keyboard)
- Offset 4 → Order #1004 (Monitor)
- Offset 5 → Order #1005 (Adapter)

✔ Offsets are stored inside the partition log  
✔ Each message has a sequential offset  
✔ Offset is part of message metadata  
  

**Replication:** Replication is the process of creating and maintaining copies of partition data across multiple brokers in a Kafka cluster.

**Replication Factor:** Replication Factor is the number of copies (including the leader) that a partition has across different brokers.
- Replication factor = number of copies per partition — RF=3 means each partition has 3 copies across 3 brokers.
- Replication factor cannot exceed number of brokers — you cannot have RF=3 with only 2 brokers.
- For a 3-node cluster, the ideal replication factor is 3 it allows loss of up to 2 brokers with zero data loss.
- Replication factor = 3 consumes 3x storage — plan disk space accordingly.

**Calculations for 6 Partitions, 3 Brokers, RF=3**

## Complete Picture for 6 Partitions, 3 Brokers, RF=3
This is considered the "Goldilocks" configuration for many e-commerce applications not too small, not too big, just right.

### Configuration Summary

| Parameter                    | Value                      |
|----------------------------|----------------------------|
| Total Brokers              | 3                          |
| Total Partitions           | 6                          |
| Replication Factor (RF)    | 3                          |
| Copies per Partition       | 3 (1 Leader + 2 Followers) |
| Total Leaders (Cluster)    | 6                          |
| Total Followers (Cluster)  | 12                         |
| Total Replicas (Cluster)   | 18                         |

### Per Broker

| Metric                      | Value |
|----------------------------|-------|
| Leaders per Broker         | 2     |
| Followers per Broker      | 4     |
| Total Replicas per Broker  | 6     |

### Consumer Configuration

- **Consumers:** 3–6 (start with 3)
- **Poll Interval:** 500–1000 ms
- **Max Poll Records:** 500
- **Auto Commit:** false (manual commit)
- **Auto Offset Reset:** earliest

### Producer Configuration

- **Acks:** all
- **Enable Idempotence:** true
- **Compression Type:** zstd

### Expected Performance

| Metric | Expected Value |
|----------|---------------|
| Throughput (3 Consumers) | 1,500–3,000 orders/sec |
| Throughput (6 Consumers) | 3,000–6,000 orders/sec |
| Data Loss | Impossible* ✅ |

## Complete Kafka Sequence

| # | Component | Role | E-commerce Example |
|---|-----------|------|---------------------|
| 1 | **Producer** | Sends data | Order Service sends order |
| 2 | **Topic** | Logical folder | "orders" topic |
| 3 | **Broker** | Physical server | Server A, B, C (3 total) |
| 4 | **Partition** | Split for speed | Partition 0, 1, 2 (3 total) |
| 5 | **Replication** | Copy for safety | RF=3 (each partition has 3 copies) |


**Leader Replica:** Handles all read and write requests for a partition.

**Follower Replica:** Brokers with a copy of the partition, asynchronously replicating data from the leader.

**In-Sync Replicas (ISR):** The set of replicas (leader + followers) that are currently alive and caught-up.

**How Long Data is Stored (Retention)**
Kafka keeps data independent of whether consumers read it or not.
Two main policies control this:

1. Time-based retention (log.retention.hours, default = 168 hours / 7 days).\
Example: keep messages for 7 days, then delete old ones.
1. Size-based retention (log.retention.bytes).\
Example: keep up to 10 GB per partition, then remove the oldest segments.

*Whichever limit is reached first (time OR size), old data is deleted.*

##  End-to-End Kafka Flow
1. Producer requests metadata from a broker.
2. Kafka returns the leader for the target partition.
3. Producer sends the message directly to the leader.
4. Leader writes the message to its partition log and assigns an offset.
5. Leader replicates the message to follower replicas.
6. Followers acknowledge replication.
7. Leader returns an acknowledgment (`acks=all`) to the producer.

## 3. Deep Dive: Producer Mechanics

**Batching:** Accumulate messages in memory and send in larger batches.  
- Controlled by `linger.ms` (how long to wait for more messages) and `batch.size`.

**Acknowledgment (`acks`):** Trade-off between durability and latency.  
- `acks=0`: Fire-and-forget, highest throughput, no guarantee.  
- `acks=1` (default): Leader writes to its log and acknowledges. Balance of durability & latency.  
- `acks=all` or `acks=-1`: Leader waits for all ISR replicas. Strongest durability. Requires `min.insync.replicas`.

**Idempotent Producer:** Prevents message duplicates caused by retries.  
- Enable via `enable.idempotence=true`.

**Compression:** (`compression.type=lz4|snappy|gzip`) applied on producer side. Saves network bandwidth & broker storage.

---

## 4. Deep Dive: Consumer Mechanics & Groups

**Consumer Group:** A set of consumers cooperating to consume data from one or more topics.  

**Golden Rule:** Each partition is consumed by exactly **one consumer** in the group.  

**Rebalancing:** Partition assignment process; a stop-the-world event where all consumers pause.

**Delivery Semantics:**
- **At-most-once:** Commit offset immediately. Risk: message loss if processing fails.  
- **At-least-once (most common):** Commit after processing. Risk: duplicate processing if crash occurs before commit.  
- **Exactly-once:** Achieved via Kafka Transactions API or atomic offset + processing commit.

---

## 5. Advanced Architecture & Durability

**min.insync.replicas:** Critical for `acks=all`.  
- Example: `replication.factor=3` and `min.insync.replicas=2`. Tolerates failure of one broker without losing writes.

**Unclean Leader Election (`unclean.leader.election.enable`):**  
- `false` (recommended): Only ISR replicas can become leader → prevents data loss.  
- `true`: Out-of-sync replicas can become leader → improves availability, risks data loss. Never enable for critical data.

---

## 6. Ecosystem & Stream Processing

**Kafka Connect:** Build reliable, scalable pipelines between Kafka & other systems.  
- **Source Connectors:** Ingest data into Kafka (e.g., CDC from PostgreSQL with Debezium).  
- **Sink Connectors:** Export data from Kafka (e.g., Elasticsearch, S3, data warehouse).

**Kafka Streams & ksqlDB:** Libraries for stream processing.  
- **KStream:** Infinite stream of events.  
- **KTable:** Evolving state of a changelog stream (latest snapshot).

---

## 7. The Future: KRaft (KIP-500)

**Problem:** Kafka's dependency on external metadata storage (previously ZooKeeper) added operational complexity and bottleneck.  

**Solution:** KRaft (Kafka Raft metadata mode) uses Raft protocol for metadata management within brokers.  

**Benefits:**
- Simpler architecture: No external metadata service needed.  
- Improved performance: Faster controller failover & leader election.  
- Massive scalability: Millions of partitions supported.

---

## 8. Example Setup

**Topic:** `user-signup` | **Partitions:** 3 | **Replication Factor:** 3 | **min.insync.replicas:** 2

- Tolerates **1 broker failure** without data loss/write unavailability.  
- If a **second broker fails**, writes are rejected (ISR < `min.insync.replicas`), but reads still work.

| Partition | Leader   | Follower (ISR) | Follower (ISR) |
|-----------|---------|----------------|----------------|
| 0         | Broker-1| Broker-2       | Broker-3       |
| 1         | Broker-2| Broker-3       | Broker-1       |
| 2         | Broker-3| Broker-1       | Broker-2       |

> Distribution ensures no single broker is leader for all partitions, spreading load evenly.

## Message (Record) Structure
Each Kafka message (also called a record) has:
- Key → Optional. Used for partitioning and ensuring ordering if present.
- Value → Required. The actual payload (e.g., JSON, Avro, string, binary).
- Timestamp → Event time (set by producer) or log append time (set by broker). Optional if producer doesn’t provide.
- Headers → Optional metadata as key-value pairs.
- Offset → An offset is a unique, sequential ID assigned to each message within a partition it acts like a page number or position indicator for messages

## Producer (Message Publisher)

1. Publishes messages to topics
- The producer is the application or service that creates messages and sends them to Kafka.  
- Messages are sent to a **topic**, which is a logical category or feed name in Kafka.  
**Examples:** `user-signup`, `order-events`.

2. Chooses the partition using
- Kafka topics are split into **partitions** for scalability and parallelism.  
- The producer decides which partition a message goes to using different strategies:

- **Key hash:** If a message has a key, Kafka uses its hash to determine the partition. This ensures that messages with the same key always go to the same partition, preserving **order**.
- **Round-robin:** If no key is provided, Kafka distributes messages evenly across partitions in a round-robin manner.
- **Custom partitioner:** You can define your own logic to choose partitions based on your business requirements.

3. Uses batching, compression, and acknowledgments for performance
- **Batching:** Producer can send multiple messages together in a batch to reduce network overhead.
- **Compression:** Messages can be compressed to save bandwidth and storage.
- **Acknowledgments (acks):**
  - `acks=0`: Fire-and-forget, fastest but no guarantee.
  - `acks=1`: Wait for leader acknowledgment.
  - `acks=all`: Wait for all replicas, ensures maximum durability.

4. Sends required Value, and optionally Key, Timestamp, and Headers
- **Value:** This is the main content of the message. It is **mandatory**.
- **Key:** Optional, used for partitioning and ordering.
- **Timestamp:** Optional; can represent event time (set by producer) or log append time (set by broker).
- **Headers:** Optional metadata for extra context like correlation IDs, tracing info, or custom tags.
