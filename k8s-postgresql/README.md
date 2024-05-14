# PostgreSQL

Add the Bitnami Helm repository.\
`helm repo add bitnami https://charts.bitnami.com/bitnami`

Create a namespace for PostgreSQL deployment.\
`kubectl create namespace postgresql`

Install PostgreSQL using Helm with custom values.\
`helm install my-postgresql-release bitnami/postgresql --namespace postgresql -f values.yaml -f configmap.yaml -f secret.yaml`

UnInstall helm postgresql.\
`helm uninstall my-postgresql`

`kubectl exec -it aes-postgresql-primary-0 -- bash`

`psql -U postgres -d postgres -h localhost -p 5432`

`psql -U nasir -d init-db -h localhost -p 5432`

`SELECT datname FROM pg_database;`

`SHOW max_wal_size;`