What we'll do:
Install kube-prometheus-stack (includes Prometheus, Grafana, Alertmanager).

Configure Alertmanager to send alerts to your Discord webhook.

Access Grafana dashboard.

Test an alert to verify Discord notifications.



## Step 1: Add Helm repo & update

```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update

```


## Step 2: Create a config file to set up Alertmanager with Discord

```
alertmanager:
  alertmanagerSpec:
    configSecret: alertmanager-monitoring

# Enable necessary components
grafana:
  enabled: true
  adminPassword: "admin123"  # Change this later!
  service:
    type: LoadBalancer

kubeStateMetrics:
  enabled: true

nodeExporter:
  enabled: true

```

## Step 3: Create the Alertmanager config file

```
global:
  resolve_timeout: 5m

route:
  receiver: discord-webhook
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h

receivers:
- name: discord-webhook
  webhook_configs:
  - url: "https://discord.com/api/webhooks/YOUR_DISCORD_WEBHOOK_URL"
    send_resolved: true
```

## Step 4: Create the secret with Alertmanager config

```
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
kubectl -n monitoring create secret generic alertmanager-monitoring --from-file=alertmanager.yaml=./alertmanager.yaml
```

## Step 5: Install kube-prometheus-stack with your config
`helm install monitoring prometheus-community/kube-prometheus-stack -n monitoring -f monitoring-values.yaml --create-namespace`

