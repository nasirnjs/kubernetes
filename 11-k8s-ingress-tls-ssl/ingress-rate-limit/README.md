

[References](https://github.com/kubernetes/ingress-nginx/blob/main/docs/user-guide/nginx-configuration/annotations.md#rate-limiting)


The annotations you provided are used to configure rate limiting for requests to your Kubernetes Ingress resources using the NGINX Ingress Controller. Here’s a breakdown of each annotation and what it does:

1. nginx.ingress.kubernetes.io/limit-connections
Description: Limits the number of concurrent connections from a single IP address.
Value: "10" means that a single IP address can have a maximum of 10 concurrent connections to the backend service.
Effect: If an IP address tries to open more than 10 connections simultaneously, it will receive a 503 Service Unavailable response until it closes some of its connections.

2. nginx.ingress.kubernetes.io/limit-rps
Description: Limits the number of requests per second from a single IP address.
Value: "5" means that a single IP address can make up to 5 requests per second.
Effect: If an IP address exceeds this rate, it will receive a 503 Service Unavailable response. The limit-burst-multiplier can affect how many requests are allowed in a burst before this limit kicks in.

3. nginx.ingress.kubernetes.io/limit-rpm
Description: Limits the number of requests per minute from a single IP address.
Value: "300" means that a single IP address can make up to 300 requests per minute.
Effect: If an IP address exceeds this rate, it will receive a 503 Service Unavailable response. Similar to limit-rps, bursts are considered based on limit-burst-multiplier.
4. nginx.ingress.kubernetes.io/limit-burst-multiplier
Description: Multiplier for the burst size, which defines how many requests are allowed above the limit-rps or limit-rpm during a burst period.
Value: "10" means that the burst size is the rate limit multiplied by 10. So if limit-rps is 5, the burst size would be 50 requests.
Effect: Allows temporary spikes in traffic before the rate limit is enforced. For instance, if you allow 5 requests per second and the burst multiplier is 10, up to 50 requests can be handled in a short burst.

5. nginx.ingress.kubernetes.io/limit-rate-after
Description: Limits the rate of data sent to a connection after a specified amount of data has been transmitted.
Value: "1000k" means that after 1000 kilobytes of data have been sent, further transmission will be rate limited.
Effect: This helps to control bandwidth usage. If a connection sends more than 1000 KB, further data transmission is limited to the rate specified by limit-rate.

6. nginx.ingress.kubernetes.io/limit-rate
Description: Limits the rate of data transmission per connection.
Value: "500k" means that the rate of data transmission is limited to 500 kilobytes per second.
Effect: Controls the speed of data delivery to prevent clients from consuming too much bandwidth. If limit-rate-after is set, the limit-rate applies only after the specified amount of data.

7. nginx.ingress.kubernetes.io/limit-whitelist
Description: Specifies IP addresses or CIDR ranges that are excluded from rate limiting.
Value: "192.168.1.0/24" means that all IP addresses within the 192.168.1.0/24 subnet are excluded from rate limiting.
Effect: Requests from the specified IP addresses or ranges will bypass the rate limits and be allowed through without restriction.


Summary:
- Connection Limits: Control how many connections an IP can have.
- Request Limits: Control how many requests per second or minute are allowed.
- Burst Size: Allows for temporary spikes in traffic.
- Rate Limits: Control the speed of data transmission.
- Whitelist: Excludes certain IPs from rate limiting.
