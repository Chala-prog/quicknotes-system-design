# QuickNotes System Architecture Document

## 1. System Requirements & Capacity Estimates

### Functional Requirements
- **Authentication:** Secure user signup, login, and JWT token management.
- **Note Management:** Create, read, update, list (paginated), and soft-delete notes.
- **Search & Tagging:** Tag notes and perform search queries across titles and content.

### Non-Functional Requirements
- **Scale:** Support 1,000,000 daily active users (DAU).
- **Availability:** 99.9% uptime (max ~8.7 hours downtime/year).
- **Latency:** Read operations < 50ms (p95), write operations < 100ms (p95).
- **Security:** Encrypted transport (TLS 1.3), data at rest encryption (AES-256), strict row-level authorization.

---

### Traffic & Capacity Estimates

#### Load Assumptions
- **Daily Active Users (DAU):** 1,000,000
- **Average Read Requests / User / Day:** 20 (Note views, list fetches)
- **Average Write Requests / User / Day:** 4 (Note creations, updates, deletes)

#### Queries Per Second (QPS)
- **Total Read Queries / Day:** $1,000,000 \times 20 = 20,000,000$ reads/day
- **Average Read QPS:** $20,000,000 / 86,400 \approx 231$ QPS
- **Peak Read QPS (2x multiplier):** $\sim 462$ QPS
- **Total Write Queries / Day:** $1,000,000 \times 4 = 4,000,000$ writes/day
- **Average Write QPS:** $4,000,000 / 86,400 \approx 46$ QPS
- **Peak Write QPS (2x multiplier):** $\sim 92$ QPS

#### Storage Calculations
- **Average Note Size:** 2 KB (Title + Body + Metadata)
- **New Notes / Day:** $4,000,000$ notes/day
- **Daily Data Ingestion:** $4,000,000 \times 2\text{ KB} = 8\text{ GB / day}$
- **Annual Data Growth:** $8\text{ GB} \times 365 \approx 2.92\text{ TB / year}$

---

## 2. System Architecture Diagram

[ Client Applications ]
│ (Web / Mobile)
▼
[ Cloudflare CDN & DDoS Protection ]
│
▼
[ AWS Application Load Balancer (ALB) ]
│
├───▶ [ API Gateway / Rate Limiter (Envoy) ]
│       │
│       ▼
├───▶ [ QuickNotes Stateless API Service (EKS Container Fleet) ]
│       │                      │                      │
│       ▼                      ▼                      ▼
│  [ Redis Cluster ]    [ Primary PostgreSQL ]  [ Read Replicas ]
│  (Session & Caching)    (Writes)               (Reads)
│                              │
└──────────────────────────────┴──────────────▶ [ ElasticSearch / OpenSearch ]
(Full-Text Indexing)

---

## 3. Core Component Explanations

1. **Client Applications (SPA Frontend):** Responsive Web app built with vanilla HTML/JS communicating over HTTPS/JSON.
2. **Cloudflare CDN / Edge:** Terminates TLS 1.3, caches static frontend assets, suppresses DDoS attacks, and provides Web Application Firewall (WAF) filtering.
3. **Application Load Balancer (ALB):** Distributes incoming API traffic across health-checked container instances in multiple Availability Zones (AZs).
4. **Stateless API Gateway & Node.js/Go Microservices:** Scalable, containerized service instances deployed on Kubernetes (EKS). Autoscaled horizontally based on CPU/memory usage.
5. **Redis Cache Cluster:** In-memory distributed store caching frequently accessed note lists (`TTL: 15m`) and enforcing user rate limits (120 req/min).
6. **PostgreSQL Database Cluster:**
   - **Primary Node:** Handles write transactions, enforces foreign key constraints, and replicates synchronously to standby replicas.
   - **Read Replicas:** Distributed read instances scaling GET workloads across multiple AZs.
7. **OpenSearch / ElasticSearch Cluster:** Asynchronous consumer indexing note content for multi-field search queries.

---

## 4. End-to-End Request Flows

### 4.1 Write Path (`POST /v1/notes`)
1. **Client Request:** User submits the note form; request hits Cloudflare and ALB.
2. **Authentication & Rate Check:** API Gateway validates JWT signature and checks Redis token bucket rate limit.
3. **Validation & Persist:** Stateless API container validates input (max 100 char title) and issues `INSERT INTO notes` to PostgreSQL Primary.
4. **Cache Invalidation:** Server invalidates cached list keys for `user_id` in Redis.
5. **Response:** Server returns `201 Created` with generated note UUID to the client.
6. **Async Event:** Database CDC (Change Data Capture) pushes new note data to OpenSearch for background indexing.

### 4.2 Read Path (`GET /v1/notes`)
1. **Client Request:** Web app requests user's note list (`GET /v1/notes?page=1`).
2. **Cache Lookup:** API server checks Redis using key `user:{id}:notes:page:1`.
3. **Cache Hit:** If cached, return JSON directly (latency < 5ms).
4. **Cache Miss:** If not cached, execute query on PostgreSQL Read Replica, populate Redis cache with a 15-minute TTL, and return JSON payload (latency < 35ms).

---

## 5. Key System Trade-Offs

- **Relational Integrity vs. Multi-Region Multi-Master:** Selected a single-region Primary PostgreSQL database with Read Replicas over Multi-Region Cassandra.
  - *Trade-off:* Accepts slightly higher latency for cross-continent users in exchange for strict ACID guarantees, multi-table JOINs for tags, and elimination of distributed lock complexity.
- **Cache Invalidation (Write-Through / Eviction) vs. Stale Reads:** Chosen aggressive cache key eviction on note mutation instead of long-lived polling caches.
  - *Trade-off:* Marginally higher DB read load immediately following writes, ensuring users never see stale note edits.

---

## 6. Single Point of Failure (SPOF) Analysis & Mitigations

| System Component | Potential Failure Mode | Prevention & Mitigation Strategy |
| :--- | :--- | :--- |
| **Load Balancer (ALB)** | Regional AWS datacenter outage | AWS ALB natively deploys across multiple Availability Zones with automatic failover. |
| **Primary PostgreSQL DB** | Hardware failure or corrupt disk on primary node | Amazon RDS Multi-AZ deployment with automatic failover to hot standby within 60 seconds; daily automated snapshots. |
| **Redis Cache Cluster** | Cache node crash / OOM | Redis Replication Groups with Multi-AZ failover enabled. In total failure, app gracefully falls back directly to DB read replicas. |
| **Stateless API Fleet** | Instance crash or high traffic burst | Kubernetes (EKS) Horizontal Pod Autoscaler (HPA) automatically provisions instances across AZs based on 70% CPU target threshold. |