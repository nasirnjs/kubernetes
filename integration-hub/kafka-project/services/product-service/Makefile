SERVICE := product-service
IMAGE   := nasirnjs/$(SERVICE)
TAG     ?= v1

.PHONY: tidy build run docker-build docker-push migrate-up migrate-down

tidy:
	go mod tidy

build:
	CGO_ENABLED=0 go build -o bin/$(SERVICE) ./cmd/server

run:
	go run ./cmd/server

docker-build:
	docker build -t $(IMAGE):$(TAG) .

docker-push: docker-build
	docker push $(IMAGE):$(TAG)

migrate-up:
	migrate -path migrations -database "$$DATABASE_URL" up

migrate-down:
	migrate -path migrations -database "$$DATABASE_URL" down 1
