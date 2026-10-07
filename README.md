# QuickNotes System Design & API Integration

Welcome to the **QuickNotes** engineering repository. This project demonstrates the evolution of QuickNotes from a client-side, browser-only web application to a production-ready online service designed to support 1,000,000+ active users.

---

## 📌 Project Overview

This repository encompasses two primary deliverables:
1. **Frontend API Integration (Proof of Concept):** Vanilla JavaScript interface demonstrating complete CRUD integration (GET, POST, DELETE) against the practice REST API (`JSONPlaceholder`).
2. **Backend Engineering & System Design Documentation:** Production specs and architectural blueprints created for the backend team to build the scalable service.

---

## 🛠️ Repository Structure

```text
.
├── index.html            # Main UI container for QuickNotes
├── style.css             # Application styling and status indicators
├── api.js                # Frontend API fetch, rendering, and state handlers
└── docs/                 # Backend system design specifications
    ├── api-design.md     # Production REST API specs & JSON schemas
    ├── data-model.md     # PostgreSQL schema, DDL, indexes & SQL choices
    └── architecture.md   # Capacity estimates, C4 diagrams, and SPOF analysis

## 💡 What I Learned

1. **RESTful API Client Architecture:** Gained experience in building resilient asynchronous HTTP wrappers around `fetch` calls, handling HTTP status codes, and manipulating the DOM safely using `textContent`.
2. **Relational Database Design for High Concurrency:** Modeled 1:N and N:M schemas using PostgreSQL with primary/foreign key constraints, partial indexes, and GIN full-text search fields optimized for 1M users.
3. **High-Availability Cloud Systems:** Designed multi-tier architectures featuring CDN edge protection, load balancing across redundant app instances, multi-AZ database read replicas, and asynchronous task queues to eliminate single points of failure.  