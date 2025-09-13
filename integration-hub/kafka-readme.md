# Kafka Study Guide

## 1. Kafka Basics

- **Producer** → sends messages to Topics.
- **Topic** → logical category of messages (e.g., user-signup, orders, payments).
- Each topic is divided into:
  - **Partitions** → allow parallelism and scalability.
  - **Replication factor** → ensures fault tolerance and durability.

---

## 2. Topic Example

**Topic:** `user-signup`

- Number of partitions = 3
- Replication factor = 2

This results in **6 replicas**:
- 3 Leaders
- 3 Followers

**Broker Distribution (example):**
- Broker-0 → Leader + Follower
- Broker-1 → Leader + Follower
- Broker-2 → Leader + Follower

---

## 3. Key-Based Partitioning

- Kafka uses a **Key** (e.g., customer ID) to decide which partition a message goes to.
- Messages with the same key always go to the same partition.
- Ensures message ordering per key.

---

## 4. Message Flow & Acknowledgments

- Kafka batches messages before sending (based on size or timeout).
- **Producer** → sends batch → **Partition Leader**.
- Leader sends **acknowledgment (ACK)** back to producer.

### Acknowledgment Modes

- **ACK = 0** → Fire and forget (no guarantee).
- **ACK = 1** → Leader acknowledges (faster, but risk of data loss).
- **ACK = all** → All replicas acknowledge (safe, ideal for financial/mission-critical).

---

## 5. Kafka Message Structure

- **Key** → used for partitioning.
- **Value** → actual business data.
- **Header** → observability / metadata.

---

## 6. Parallelism & Consumers

- Partitions enable parallelism across consumers.

**Example:**

| Partition     | Consumer     |
|---------------|--------------|
| Partition-1   | Consumer-0   |
| Partition-2   | Consumer-1   |
| Partition-3   | Consumer-2   |

**Consumer Load Distribution Example:**
- Order-0 → Consumer-0
- Order-1 → Consumer-1
- Order-2, Order-3, Order-4 → Consumer-2

---

## 7. Durability & Replication

- Every partition has:
  - **1 Leader** (handles reads & writes).
  - **1 or more Followers** (replicate data).
- **In-Sync Replicas (ISR)** → can be promoted to Leader if needed.
- Production clusters commonly use **replication factor = 3**.

---

## 8. Security in Kafka

- **TLS** → Encrypts communication.
- **SASL** → Authentication.
- **ACL** → Access control.
- **Logging** → Audit & traceability.

---

## 9. Observability

**Metrics & Monitoring:**
- **Prometheus + Grafana** → for metrics.
- **Confluent Control Tower** → advanced monitoring & management.