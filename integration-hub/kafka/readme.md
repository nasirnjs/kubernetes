
```bash
kafka/
├── kafka-readme.md                 # Documentation for general Kafka info
├── kafka-setup.md                  # Step-by-step setup guide
├── kafka1-server.properties        # Node 1 configuration
├── kafka2-server.properties        # Node 2 configuration
├── kafka3-server.properties        # Node 3 configuration
└── web-ui/                         # Dashboard (Kafdrop) related files
    ├── docker-compose.yaml         # Compose file for dashboard + nginx
    ├── nginx/
    │   ├── kafdrop.htpasswd        # Auth credentials for NGINX basic auth
    │   └── nginx.conf              # Reverse proxy config for Kafdrop
    └── readme.md                   # Optional notes about dashboard setup
```