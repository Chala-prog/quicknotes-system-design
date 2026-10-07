# QuickNotes System Design & API Integration

Welcome to the **QuickNotes** engineering repository. This project demonstrates the evolution of QuickNotes from a client-side, browser-only web application to a production-ready online service designed to support 1,000,000+ active users.

---

## 📌 Project Overview

This repository encompasses two primary deliverables:
1. **Frontend API Integration (Proof of Concept):** A vanilla JavaScript interface demonstrating complete CRUD integration (GET, POST, DELETE) against the practice REST API (`JSONPlaceholder`).
2. **Backend Engineering & System Design Documentation:** Production specs and architectural blueprints created for the backend engineering team to build the scalable service.

---

## 🛠️ Repository Structure

```text
.
├── index.html            # Main UI container for QuickNotes
├── style.css             # Application styling and status indicators
├── api.js                # Frontend API fetch, rendering, and state handlers
├── README.md             # Project documentation and setup guide
└── docs/                 # Backend system design specifications
    ├── api-design.md     # Production REST API specs & JSON schemas
    ├── data-model.md     # PostgreSQL schema, DDL, indexes & SQL choices
    └── architecture.md   # Capacity estimates, C4 diagrams, and SPOF analysis
```


---

   ## How to Run the API Client

1. **Clone the Repository:**
   
   git clone [https://github.com/Chala-prog/quicknotes-system-design.git](https://github.com/Chala-prog/quicknotes-system-design.git)
cd quicknotes-system-design  


---
## What I Learned

1. **RESTful API Integration & Client State:** Learned how to structure reusable asynchronous wrappers around `fetch` requests and present clear visual feedback across loading, error, success, and empty state events.
2. **Relational Data Modeling:** Gained hands-on experience designing normalized $1:N$ and $N:M$ SQL schemas with primary keys, foreign key constraints, partial indexes, and full-text search capabilities.
3. **Distributed System Architecture:** Deepened my understanding of scaling web services to 1M daily active users through CDN edge caching, load balancing, multi-AZ database read replication, and asynchronous message queue processing.