# Redis Cluster Production Setup

**Redis Single-Threaded Model**
- Redis is single-threaded for command execution.
- All commands are executed sequentially, which avoids race conditions and makes it extremely predictable.
- Network I/O and persistence (AOF rewriting, RDB snapshots) can use background threads or OS threads, but the core command execution is single-threaded.
- Implication: scale vertically with CPU speed; horizontal scaling is done via Redis Cluster or replication.

**Redis In-Memory Data**
- Redis primarily stores all data in RAM for extremely fast read/write operations.
- Because it’s in-memory, it’s super fast (microseconds to milliseconds), but volatile if not persisted to disk.
- By default, if Redis crashes or the server reboots, all data is lost unless persistence is enabled.

**RDB (Redis Database Snapshot)**
- Takes point-in-time snapshots of the dataset and saves to disk (e.g., dump-6381.rdb).
- Snapshots can be scheduled based on time and number of changes.

**AOF (Append Only File)**
- Logs every write operation to disk (e.g., appendonly-6381.aof).
-  Fsync options control durability:
- always → safest, slowest
- everysec → good compromise (default recommended)
- no → fastest, relies on OS, risky


## Steps 1: Install Redis 8.x binary (build from source) — run on each node

```bash
# install build deps (one-time)
sudo apt update
sudo apt install -y build-essential tcl wget ca-certificates

# download and build (adjust version if newer)
cd /tmp
wget https://download.redis.io/releases/redis-8.0.0.tar.gz
tar xzf redis-8.0.0.tar.gz
cd redis-8.0.0
make -j$(nproc)
sudo make install

# create redis user & directories
sudo useradd -r -s /usr/sbin/nologin redis || true
sudo mkdir -p /etc/redis /var/lib/redis/6380 /var/lib/redis/6381 /var/log/redis
sudo chown -R redis:redis /var/lib/redis /var/log/redis /etc/redis
```

## Steps 2: OS Tuning (Run on Each Node)

```bash
# sysctl tuning
sudo tee /etc/sysctl.d/90-redis.conf > /dev/null <<'EOF'
vm.overcommit_memory = 1
net.core.somaxconn = 65535
net.ipv4.tcp_max_syn_backlog = 4096
net.core.netdev_max_backlog = 5000
EOF
sudo sysctl --system

# disable THP immediately
echo never | sudo tee /sys/kernel/mm/transparent_hugepage/enabled

# persist disable THP via tmpfiles
sudo tee /etc/tmpfiles.d/disable-thp.conf > /dev/null <<'EOF'
w /sys/kernel/mm/transparent_hugepage/enabled - - - - never
w /sys/kernel/mm/transparent_hugepage/defrag - - - - never
EOF

# ulimits via /etc/security/limits.conf
sudo tee -a /etc/security/limits.conf > /dev/null <<'EOF'
redis soft nofile 200000
redis hard nofile 200000
EOF
```
## Steps 3: Per-node Redis instance configurations
**Node A (192.168.61.121)**, **Redis 6380** 


```bash
vim /etc/redis/redis-6380.conf
```

```bash
# Instance: 192.168.61.121:6380
port 6380
bind 192.168.61.121
protected-mode yes

# Persistence / durability
appendonly yes
appendfsync everysec
dir /var/lib/redis/6380
dbfilename dump-6380.rdb
appendfilename appendonly-6380.aof
stop-writes-on-bgsave-error yes

# Cluster
cluster-enabled yes
cluster-config-file nodes-6380.conf
cluster-node-timeout 5000
cluster-announce-ip 192.168.61.121
cluster-announce-port 6380
cluster-announce-bus-port 16380

# Memory & eviction - ADJUST to host RAM
maxmemory 60gb
maxmemory-policy allkeys-lru

# Logging / process
daemonize no
pidfile /var/run/redis_6380.pid
#logfile /var/log/redis/redis-server-6380.log

# Security - use ACLs (see users.acl) or legacy requirepass
aclfile /etc/redis/users.acl


# Recommended command lock-downs
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""
rename-command CONFIG ""

# Performance
tcp-backlog 511
tcp-keepalive 60
```

**Node A (192.168.61.121)**, **Redis 6381**

```
vim /etc/redis/redis-6381.conf
```

```bash
# Instance: 192.168.61.121:6381
port 6381
bind 192.168.61.121               
protected-mode yes                 

# -----------------------
# Persistence / Durability
# -----------------------
appendonly yes                     
appendfsync everysec               
dir /var/lib/redis/6381            
dbfilename dump-6381.rdb           
appendfilename appendonly-6381.aof 
stop-writes-on-bgsave-error yes    

# -----------------------
# Cluster Settings
# -----------------------
cluster-enabled yes
cluster-config-file nodes-6381.conf
cluster-node-timeout 5000          
cluster-announce-ip 192.168.61.121 
cluster-announce-port 6381
cluster-announce-bus-port 16381

# -----------------------
# Memory Management
# -----------------------
maxmemory 50gb                     
maxmemory-policy allkeys-lru    

# -----------------------
# Process & Logging
# -----------------------
daemonize no                        
pidfile /var/run/redis_6381.pid
#logfile /var/log/redis/redis-server-6381.log

# -----------------------
# Security
# -----------------------
aclfile /etc/redis/users.acl      

# -----------------------
# Networking / Performance
# -----------------------
tcp-backlog 511                    
tcp-keepalive 60                  
```

**Node B (192.168.61.133)**, **Redis 6380** 

```
vim /etc/redis/redis-6380.conf
```

```bash
# Instance: 192.168.61.133:6380
port 6380
bind 192.168.61.133
protected-mode yes

# Persistence / durability
appendonly yes
appendfsync everysec
dir /var/lib/redis/6380
dbfilename dump-6380.rdb
appendfilename appendonly-6380.aof
stop-writes-on-bgsave-error yes

# Cluster
cluster-enabled yes
cluster-config-file nodes-6380.conf
cluster-node-timeout 5000
cluster-announce-ip 192.168.61.133
cluster-announce-port 6380
cluster-announce-bus-port 16380

# Memory & eviction - ADJUST to host RAM
maxmemory 60gb
maxmemory-policy allkeys-lru

# Logging / process
daemonize no
pidfile /var/run/redis_6380.pid
#logfile /var/log/redis/redis-server-6380.log

# Security - use ACLs (see users.acl) or legacy requirepass
aclfile /etc/redis/users.acl


# Recommended command lock-downs
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""
rename-command CONFIG ""

# Performance
tcp-backlog 511
tcp-keepalive 60
```

**Node B (192.168.61.121)**, **Redis 6381**

```bash
vim /etc/redis/redis-6381.conf
```

```bash
# Instance: 192.168.61.133:6381
port 6381
bind 192.168.61.133 
protected-mode yes

# -----------------------
# Persistence / Durability
# -----------------------
appendonly yes
appendfsync everysec 
dir /var/lib/redis/6381       
dbfilename dump-6381.rdb       
appendfilename appendonly-6381.aof
stop-writes-on-bgsave-error yes

# -----------------------
# Cluster Settings
# -----------------------
cluster-enabled yes
cluster-config-file nodes-6381.conf
cluster-node-timeout 5000
cluster-announce-ip 192.168.61.133  
cluster-announce-port 6381
cluster-announce-bus-port 16381

# -----------------------
# Memory Management
# -----------------------
maxmemory 50gb                 
maxmemory-policy allkeys-lru 

# -----------------------
# Process & Logging
# -----------------------
daemonize no 
pidfile /var/run/redis_6381.pid
#logfile /var/log/redis/redis-server-6381.log

# -----------------------
# Security
# -----------------------
aclfile /etc/redis/users.acl

# -----------------------
# Networking / Performance
# -----------------------
tcp-backlog 511              
tcp-keepalive 60
```

**Node C (192.168.61.132)**, **Redis 6380** 

```bash
vim /etc/redis/redis-6380.conf
```

```bash
# Instance: 192.168.61.132:6380
port 6380
bind 192.168.61.132
protected-mode yes

# Persistence / durability
appendonly yes
appendfsync everysec
dir /var/lib/redis/6380
dbfilename dump-6380.rdb
appendfilename appendonly-6380.aof
stop-writes-on-bgsave-error yes

# Cluster
cluster-enabled yes
cluster-config-file nodes-6380.conf
cluster-node-timeout 5000
cluster-announce-ip 192.168.61.132
cluster-announce-port 6380
cluster-announce-bus-port 16380

# Memory & eviction - ADJUST to host RAM
maxmemory 60gb
maxmemory-policy allkeys-lru

# Logging / process
daemonize no
pidfile /var/run/redis_6380.pid
#logfile /var/log/redis/redis-server-6380.log

# Security - use ACLs (see users.acl) or legacy requirepass
aclfile /etc/redis/users.acl
# requirepass <PLACEHOLDER_REQUIREPASS>

# Recommended command lock-downs
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""
rename-command CONFIG ""

# Performance
tcp-backlog 511
tcp-keepalive 60
```

**Node C (192.168.61.132)**, **Redis 6381**

```bash
vim /etc/redis/redis-6381.conf
```

```bash
# Instance: 192.168.61.132:6381
port 6381
bind 192.168.61.132 
protected-mode yes

# Persistence
appendonly yes          
appendfsync everysec 
dir /var/lib/redis/6381
dbfilename dump-6381.rdb 
appendfilename appendonly-6381.aof
stop-writes-on-bgsave-error yes

# Cluster
cluster-enabled yes
cluster-config-file nodes-6381.conf
cluster-node-timeout 5000
cluster-announce-ip 192.168.61.132
cluster-announce-port 6381
cluster-announce-bus-port 16381

# Memory
maxmemory 50gb
maxmemory-policy allkeys-lru

# Process & Logging
daemonize no
pidfile /var/run/redis_6381.pid
#logfile /var/log/redis/redis-server-6381.log

# Security
aclfile /etc/redis/users.acl

# Networking
tcp-backlog 511
tcp-keepalive 60
```

## Steps 4: ACL file (preferred over single password)

```bash
user default off
user app on >Asdf1234 ~* +@all -CONFIG -SHUTDOWN -FLUSHALL -FLUSHDB
user readonly on >Asdf1234 ~* +@read -@write
```

`chown root:root /etc/redis/users.acl`

## Steps 5: Systemd units (create on each node)

```bash
[Unit]
Description=Redis 6380
After=network.target

[Service]
User=redis
Group=redis
ExecStart=/usr/local/bin/redis-server /etc/redis/redis-6380.conf
ExecStop=/usr/local/bin/redis-cli -p 6380 shutdown
Restart=always
LimitNOFILE=200000
ProtectSystem=full

[Install]
WantedBy=multi-user.target
```

```bash
[Unit]
Description=Redis 6381
After=network.target

[Service]
User=redis
Group=redis
ExecStart=/usr/local/bin/redis-server /etc/redis/redis-6381.conf
ExecStop=/usr/local/bin/redis-cli -p 6381 shutdown
Restart=always
LimitNOFILE=200000
ProtectSystem=full

[Install]
WantedBy=multi-user.target
```


## Steps 6: Start services and verify locally (run on each node)

```bash
/usr/local/bin/redis-server /etc/redis/redis-6380.conf

sudo systemctl daemon-reload
sudo systemctl enable redis-6380 redis-6381
sudo systemctl start redis-6380 redis-6381
sudo systemctl status redis-6380
sudo systemctl stro redis-6380 redis-6381

# check listening
ss -tlnp | grep redis
# test local connection
redis-cli -p 6380 ping
redis-cli -p 6381 ping
```


## Steps 7: Create the cluster (run from any node that can reach all others)

```bash
redis-cli --user app --pass Asdf1234 --cluster create \
192.168.61.121:6380 192.168.61.133:6380 192.168.61.132:6380 \
192.168.61.121:6381 192.168.61.133:6381 192.168.61.132:6381 \
--cluster-replicas 1
```
List Cluster Nodes: Displays all nodes in the cluster along with their roles (master/slave), IDs, IPs, ports, and current state.

```bash
redis-cli -c -h 192.168.61.121 -p 6380 --user app --pass Asdf1234 cluster nodes
```
**How Cross-Master Replication Works**

Master → Replica Relationship Each master node has a replica on a different physical server. This is important for high availability:


| Master              | Replica             |
|---------------------|---------------------|
| 192.168.61.121:6380 | 192.168.61.133:6381 |
| 192.168.61.133:6380 | 192.168.61.132:6381 |
| 192.168.61.132:6380 | 192.168.61.121:6381 |

Check Cluster Info
```bash
redis-cli -c -h 192.168.61.121 -p 6380 --user app --pass Asdf1234 cluster info
```

Test Key-Value Operations

```bash
redis-cli -c -h 192.168.61.121 -p 6380 --user app --pass Asdf1234 set testkey 123
redis-cli -c -h 192.168.61.121 -p 6380 --user app --pass Asdf1234 get testkey

```

## Steps 8: Tunning

1. Memory Tuning

```bash
maxmemory = ~70-80% of host RAM
maxmemory-policy = allkeys-lru (or volatile-lru if needed)
```

