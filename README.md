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

1. **RESTful API Contracts & Client Integration:** Learned how to safely manage asynchronous HTTP requests (`GET`, `POST`, `DELETE`) with unified state handling and defensive DOM insertion using `textContent`.
2. **Relational Database Design at Scale:** Gained deep insights into structuring 1:N and N:M entities with foreign keys, composite primary keys, and partial indexes to optimize performance for 1 million active users.
3. **High-Availability System Architecture:** Understood key trade-offs in cloud systems, such as implementing CDN caching, load balancing, multi-AZ database read replicas, and asynchronous worker queues to eliminate single points of failure.