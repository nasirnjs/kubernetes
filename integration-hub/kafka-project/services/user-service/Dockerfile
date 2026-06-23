# syntax=docker/dockerfile:1.6

FROM golang:1.22-alpine AS builder
WORKDIR /src

RUN apk add --no-cache git ca-certificates

COPY go.mod go.sum* ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o /out/user-service ./cmd/server

FROM gcr.io/distroless/static-debian12:nonroot
WORKDIR /app
COPY --from=builder /out/user-service /app/user-service
USER nonroot:nonroot
EXPOSE 8080
ENTRYPOINT ["/app/user-service"]
