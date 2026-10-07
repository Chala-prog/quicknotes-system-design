# QuickNotes Data Model Document

## 1. Relational Entity Overview
To support 1,000,000+ active users with strong data integrity, row-level isolation, and flexible text search, QuickNotes uses a relational relational database model consisting of four core entities:

1. **Users (`users`)**: Represents registered account holders storing authentication credentials and account state.
2. **Notes (`notes`)**: Primary content entity storing titles, body text, status flags (e.g., soft-delete), and ownership keys.
3. **Tags (`tags`)**: Categorization labels created by users to group related notes.
4. **Note Tags (`note_tags`)**: Associative junction table enabling many-to-many relationships between notes and tags.

### Entity Relationships
- **Users to Notes:** `1 : N` (One user owns zero or many notes; each note belongs to exactly one user).
- **Users to Tags:** `1 : N` (One user can create multiple tags; tags are scoped per user to ensure multi-tenancy isolation).
- **Notes to Tags:** `N : M` (A note can have multiple tags, and a single tag can be assigned to multiple notes via the `note_tags` junction table).

---

## 2. PostgreSQL Schema Definition (CREATE TABLE)

```sql
-- Enable UUID extension for globally unique IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Notes Table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    body TEXT,
    is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tags Table
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_tag UNIQUE (user_id, name)
);

-- 4. Note Tags Junction Table (Many-to-Many)
CREATE TABLE note_tags (
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (note_id, tag_id)
);
-- Index active user notes ordered by newest first (Supports GET /notes pagination)
CREATE INDEX idx_notes_user_active_created 
ON notes (user_id, created_at DESC) 
WHERE is_deleted = FALSE;

-- Full-text search index for searching note content efficiently
CREATE INDEX idx_notes_fts 
ON notes USING gin(to_tsvector('english', title || ' ' || COALESCE(body, '')));

-- Foreign key lookup optimization on junction table
CREATE INDEX idx_note_tags_tag_id ON note_tags (tag_id);
SELECT id, title, body, created_at, updated_at
FROM notes
WHERE user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  AND is_deleted = FALSE
ORDER BY created_at DESC
LIMIT 20 OFFSET 0;
SELECT 
    n.id AS note_id,
    n.title,
    n.body,
    n.created_at,
    COALESCE(ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') AS tags
FROM notes n
LEFT JOIN note_tags nt ON n.id = nt.note_id
LEFT JOIN tags t ON nt.tag_id = t.id
WHERE n.id = 'd3b07384-d113-424a-a567-d6e3c0428d00'
  AND n.user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
  AND n.is_deleted = FALSE
GROUP BY n.id;
UPDATE notes
SET is_deleted = TRUE, 
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'd3b07384-d113-424a-a567-d6e3c0428d00'
  AND user_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';