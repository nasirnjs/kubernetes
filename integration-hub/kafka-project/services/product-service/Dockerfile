# syntax=docker/dockerfile:1.6

FROM golang:1.22-alpine AS builder
WORKDIR /src

RUN apk add --no-cache git ca-certificates

COPY go.mod go.sum* ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o /out/product-service ./cmd/server

# ---- runtime ----
FROM gcr.io/distroless/static-debian12

WORKDIR /app
COPY --from=builder /out/product-service /app/product-service

USER 1000:1000

EXPOSE 8080
ENTRYPOINT ["/app/product-service"]