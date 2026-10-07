# QuickNotes API Specification

## 1. Overview & Architecture Standards
This document specifies the RESTful API contract for the QuickNotes backend service, designed to support 1,000,000+ active users.

- **Base URL:** `https://api.quicknotes.com/v1`
- **Data Format:** JSON (`Content-Type: application/json; charset=UTF-8`)
- **Protocol:** HTTPS (TLS 1.3 enforced)
- **Authentication:** Bearer Tokens via HTTP Authorization header (`Authorization: Bearer <jwt_access_token>`)
- **Rate Limiting:** 120 requests/minute per authenticated user (enforced via Redis token bucket algorithm). Standard headers returned:
  - `X-RateLimit-Limit`: Maximum allowed requests per window.
  - `X-RateLimit-Remaining`: Remaining requests in current window.
  - `X-RateLimit-Reset`: Unix timestamp when the limit resets.

---

## 2. API Endpoint Table

| Method | Endpoint | Description | Auth Required | Success Status |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/auth/login` | Authenticate user and obtain JWT tokens | No | `200 OK` |
| `GET` | `/notes` | List paginated notes for the authenticated user | Yes | `200 OK` |
| `POST` | `/notes` | Create a new note | Yes | `201 Created` |
| `GET` | `/notes/{id}` | Retrieve a specific note by UUID | Yes | `200 OK` |
| `PUT` | `/notes/{id}` | Update an existing note (full update) | Yes | `200 OK` |
| `DELETE` | `/notes/{id}` | Soft-delete a note by UUID | Yes | `204 No Content` |

---

## 3. Request & Response Examples

### 3.1 List Notes (`GET /notes`)
**Query Parameters:**
- `page` (integer, optional, default: 1): Page index.
- `limit` (integer, optional, default: 20, max: 100): Items per page.

**Request Header:**
```http
GET /v1/notes?page=1&limit=2 HTTP/1.1
Host: api.quicknotes.com
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "System Design Overview",
      "body": "Architecture breakdown for 1M users scaling.",
      "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "created_at": "2026-10-07T14:30:00Z",
      "updated_at": "2026-10-07T14:30:00Z"
    },
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "title": "Grocery List",
      "body": "Milk, eggs, oats, coffee.",
      "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      "created_at": "2026-10-06T09:15:00Z",
      "updated_at": "2026-10-06T09:15:00Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 2,
    "total_items": 42,
    "total_pages": 21
  }
}
POST /v1/notes HTTP/1.1
Host: api.quicknotes.com
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
Content-Type: application/json

{
  "title": "API Specification Guidelines",
  "body": "Ensure all endpoints follow standard REST contracts."
}
{
  "id": "d3b07384-d113-424a-a567-d6e3c0428d00",
  "title": "API Specification Guidelines",
  "body": "Ensure all endpoints follow standard REST contracts.",
  "user_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
  "created_at": "2026-10-07T16:00:00Z",
  "updated_at": "2026-10-07T16:00:00Z"
}
DELETE /v1/notes/d3b07384-d113-424a-a567-d6e3c0428d00 HTTP/1.1
Host: api.quicknotes.com
Authorization: Bearer eyJhbGciOiJIUzI1Ni...
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The request payload failed validation checks.",
    "details": [
      {
        "field": "title",
        "issue": "Title is required and must not exceed 100 characters."
      }
    ],
    "timestamp": "2026-10-07T16:05:00Z"
  }
}