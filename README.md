# 🚦 Rate Limiter Service

A Redis-backed **distributed rate limiter** implemented using the **Token Bucket algorithm**. This project demonstrates production-grade backend concepts such as request throttling, distributed state management, and middleware-based enforcement.

---

## 📌 Overview

This service limits the number of API requests a client can make within a given time window. It is designed to work correctly across **multiple application instances** using Redis as a shared data store.

**Default policy:**

* 100 requests per minute per identifier
* Identifier = User ID (if provided) or IP address

---

## 🎯 Goals

* Prevent API abuse and traffic spikes
* Demonstrate real-world backend system design
* Provide configurable, reusable rate-limiting middleware

---

## 🧠 Design

### High-Level Architecture

```
Client
  |
  | HTTP Request
  v
API Server (Express)
  |
  | Rate Limiter Middleware
  v
Redis (Shared State)
```

### Why Redis?

* Low latency
* Atomic operations
* Enables horizontal scaling

---

## ⚙️ Rate Limiting Strategy

### Algorithm: Token Bucket

Each client identifier maintains:

* `tokens`: Current available tokens
* `lastRefill`: Timestamp of last refill

**How it works:**

1. Tokens refill continuously over time
2. Each request consumes one token
3. If no tokens are available, the request is rejected

This approach allows **short bursts** while enforcing a long-term rate limit.

---

## 🗄️ Redis Data Model

**Key format:**

```
rate_limiter:{identifier}
```

**Stored as Redis Hash:**

```
tokens       -> number
lastRefill   -> timestamp (ms)
```

---

## 📡 API Endpoints

### Protected Endpoint

```
GET /api/test
```

* Subject to rate limiting
* Returns success response if allowed

### Health Check

```
GET /health
```

* Checks application and Redis connectivity
* Not rate-limited

---

## 📬 HTTP Response Headers

For **all responses**:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: <remaining_tokens>
```

For **blocked requests (429)**:

```
Retry-After: <seconds_until_next_token>
```

---

## 🚫 Error Handling

* Exceeded limit → `429 Too Many Requests`
* Redis failure handling strategy is documented (fail-open or fail-closed)
* Invalid headers do not break request flow

---

## 🔐 Security Considerations

* IP-based limiting is used by default
* User-based limiting assumes prior authentication
* Client-provided headers are not blindly trusted

---

## ⚡ Performance & Scalability

* O(1) Redis operations per request
* Works across multiple API instances
* Stateless application servers

### Concurrency

* In production, rate-limiting logic should be moved to a **Redis Lua script** to ensure full atomicity

---

## 🧪 Testing

You can test rate limiting using `curl`:

```
for i in {1..120}; do
  curl -i http://localhost:3000/api/test
done
```

After exceeding the limit, responses will return `429`.

---

## 🔧 Configuration

The following values can be configured:

* Rate limit
* Time window
* Redis connection details

Configuration is managed via environment variables with sensible defaults.

---

## 📖 Future Improvements

* Redis Lua script for strict atomicity
* Sliding window rate limiting
* Per-route rate limits
* Metrics export (Prometheus)
* Admin dashboard for monitoring

---

## 🚧 Out of Scope

* Authentication system
* Persistent analytics storage
* Multi-region Redis replication
* UI-heavy frontend

---

## ✅ Acceptance Criteria

* Requests are blocked correctly after limit is exceeded
* Rate limit headers reflect accurate state
* System works consistently across restarts
* Documentation clearly explains design decisions

---

## 📝 Summary

This project focuses on **correctness, scalability, and clarity** rather than UI complexity. It demonstrates backend engineering skills commonly expected in production systems and technical interviews.
