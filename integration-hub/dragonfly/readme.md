# Production-Ready Dragonfly Installation (Binary + Systemd)

## Key Advantages of Dragonfly vs Redis

## Multi-threaded / High Throughput

* Unlike Redis (mostly single-threaded), Dragonfly is optimized to take advantage of **multiple CPU cores** for parallel operations.
* Source: [GitHub](https://github.com/dragonflydb/dragonfly)

## Efficient Replication

* Supports **replication and high availability**.
* Replication algorithm uses **multi-threading** for snapshotting and syncing.
* Lower memory overhead during replication compared to Redis.
* Source: [Dragonfly](https://www.dragonflydb.io/blog/replication-for-high-availability)

## Memory Efficiency

* Memory model designed for **less fragmentation** and more efficient usage.
* Snapshotting is faster and more predictable in memory usage.
* Source: [en.linuxadictos.com](https://en.linuxadictos.com/dragonfly-a-ram-data-caching-system.html)

## API Compatibility

* Supports **Redis and Memcached protocols**; minimal to no code changes required for migration.
* Supported SDKs include: `redis-py`, `ioredis`, `go-redis`, `Jedis`, etc.
* Source: [Dragonfly](https://www.dragonflydb.io/docs/integrations)

## Caching Use Cases

* Well-suited for **high-throughput caching**, real-time data, AI inference caches, etc.
* Vertical scaling allows **fewer instances** compared to a large Redis cluster, simplifying operations.
* Source: [Dragonfly](https://www.dragonflydb.io/use-case/caching)



## Steps 1: Download Dragonfly Binary
```bash
wget https://github.com/dragonflydb/dragonfly/releases/download/v1.35.0/dragonfly-x86_64.tar.gz
tar -xvf dragonfly-x86_64.tar.gz
mv dragonfly-x86_64 dragonfly
mv dragonfly /usr/local/bin/
chmod +x /usr/local/bin/dragonfly
dragonfly --version
```

```bash
/usr/local/bin/dragonfly --version
```

## Steps 2: Create Dragonfly User and Directories

```bash
sudo useradd --system --no-create-home --shell /usr/sbin/nologin dragonfly

sudo mkdir -p /etc/dragonfly
sudo echo "YourVeryStrongPasswordHere" | sudo tee /etc/dragonfly/password > /dev/null
sudo chmod 600 /etc/dragonfly/password
sudo chown dragonfly:dragonfly /etc/dragonfly/password

sudo mkdir -p /var/lib/dragonfly
sudo mkdir -p /var/log/dragonfly
sudo touch /var/log/dragonfly/dragonfly.log
sudo chown -R dragonfly:dragonfly /var/lib/dragonfly /var/log/dragonfly
```

## Steps 3: Configure Systemd Service for Dragonfly
```bash
vim /etc/systemd/system/dragonfly.service
```

```bash
[Unit]
Description=Dragonfly In-Memory Database
After=network.target

[Service]
Type=simple
User=dragonfly
Group=dragonfly

ExecStart=/usr/local/bin/dragonfly \
    --bind=127.0.0.1 \
    --port=6379 \
    --requirepass=YourVeryStrongPasswordHere \
    --dir=/var/lib/dragonfly \
    --dbnum=16 \
    --maxmemory=24gb \
    --cache_mode=true \
    --snapshot_cron="*/30 * * * *"

WorkingDirectory=/var/lib/dragonfly
Restart=always
RestartSec=3

# Resource limits
LimitNOFILE=100000
TasksMax=infinity

# Security hardening
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=strict
ReadWritePaths=/var/lib/dragonfly /var/log/dragonfly
MemoryDenyWriteExecute=true

# Logging (systemd handles it)
StandardOutput=append:/var/log/dragonfly/dragonfly.log
StandardError=append:/var/log/dragonfly/dragonfly.log

[Install]
WantedBy=multi-user.target
```

## Steps 4: Ensure Logs Directory Exists

```bash
sudo mkdir -p /var/log/dragonfly
sudo touch /var/log/dragonfly/dragonfly.log
sudo chown -R dragonfly:dragonfly /var/log/dragonfly
```
## Steps 5: Enable and Start Dragonfly Service
```bash
sudo systemctl daemon-reload
sudo systemctl enable dragonfly
sudo systemctl start dragonfly
sudo systemctl status dragonfly
```
## Steps 6: Install Redis CLI Tools

```bash
sudo apt install redis-tools -y
```
## Steps 7: Test Dragonfly
```bash
redis-cli -a YourVeryStrongPasswordHere ping
```

```bash
redis-cli -p 6379 -a YourVeryStrongPasswordHere

# Then directly run:
127.0.0.1:6379> SET mykey "hello"
127.0.0.1:6379> GET mykey
```

## References
[Download](https://github.com/dragonflydb/dragonfly/releases)
