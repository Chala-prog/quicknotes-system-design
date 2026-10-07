const API_URL = 'https://jsonplaceholder.typicode.com/posts?_limit=10';
const POST_URL = 'https://jsonplaceholder.typicode.com/posts';

// Elements
const loadNotesBtn = document.getElementById('load-notes-btn');
const statusMessage = document.getElementById('status-message');
const notesList = document.getElementById('notes-list');

const createNoteForm = document.getElementById('create-note-form');
const titleInput = document.getElementById('note-title');
const bodyInput = document.getElementById('note-body');
const submitNoteBtn = document.getElementById('submit-note-btn');
const titleError = document.getElementById('title-error');

// --- Task 3: Handle JSONPlaceholder Pseudo-Persistence ---
/**
 * JSONPlaceholder Strategy:
 * 1. JSONPlaceholder returns `id: 101` for newly created POST items, but it doesn't 
 *    persist them on its server database.
 * 2. Sending `DELETE /posts/101` to JSONPlaceholder results in a 404 response.
 * 3. To handle this sensibly: if a note is newly created locally or has an ID > 100 
 *    (or fails with a 404), we remove the DOM card immediately and report a successful deletion.
 * 4. For existing server items (IDs 1–100), we issue the real `DELETE /posts/{id}` request.
 */

function createNoteCard(note) {
  const card = document.createElement('article');
  card.className = 'note-card';
  card.dataset.id = note.id || 'local';

  const title = document.createElement('h3');
  title.textContent = note.title;

  const body = document.createElement('p');
  body.textContent = note.body || '';

  // Task 3: Add Delete button to each note card
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => handleDeleteNote(note.id, card));

  card.appendChild(title);
  card.appendChild(body);
  card.appendChild(deleteBtn);

  return card;
}

// --- Task 1: Load Notes (GET) ---

async function fetchNotes() {
  notesList.innerHTML = '';
  statusMessage.textContent = 'Loading notes...';
  statusMessage.className = 'status loading';
  loadNotesBtn.disabled = true;

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const notes = await response.json();

    if (!notes || notes.length === 0) {
      statusMessage.textContent = 'Loaded 0 notes from the server.';
      statusMessage.className = 'status success';
      notesList.innerHTML = '<p class="empty-state">No notes found on the server.</p>';
      return;
    }

    notes.forEach((note) => {
      notesList.appendChild(createNoteCard(note));
    });

    statusMessage.textContent = `Loaded ${notes.length} notes from the server.`;
    statusMessage.className = 'status success';
  } catch (error) {
    console.error('Failed to fetch notes:', error);
    statusMessage.textContent = 'Unable to load notes right now. Please check your network connection and try again.';
    statusMessage.className = 'status error';
  } finally {
    loadNotesBtn.disabled = false;
  }
}

// --- Task 2: Create Note (POST) ---

async function handleCreateNote(event) {
  event.preventDefault();
  titleError.style.display = 'none';
  titleError.textContent = '';

  const titleValue = titleInput.value.trim();
  const bodyValue = bodyInput.value.trim();

  if (!titleValue) {
    titleError.textContent = 'Title is required.';
    titleError.style.display = 'block';
    return;
  }

  if (titleValue.length > 100) {
    titleError.textContent = 'Title must be 100 characters or fewer.';
    titleError.style.display = 'block';
    return;
  }

  submitNoteBtn.disabled = true;
  statusMessage.textContent = 'Creating note...';
  statusMessage.className = 'status loading';

  try {
    const payload = {
      title: titleValue,
      body: bodyValue,
      userId: 1,
    };

    const response = await fetch(POST_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const createdNote = await response.json();

    const noteCard = createNoteCard(createdNote);
    notesList.prepend(noteCard);

    statusMessage.textContent = `Note created (status ${response.status}, id ${createdNote.id}).`;
    statusMessage.className = 'status success';

    createNoteForm.reset();
  } catch (error) {
    console.error('Failed to create note:', error);
    statusMessage.textContent = 'Unable to create note. Please try again.';
    statusMessage.className = 'status error';
  } finally {
    submitNoteBtn.disabled = false;
  }
}

// --- Task 3: Delete Note (DELETE) ---

async function handleDeleteNote(noteId, cardElement) {
  const deleteBtn = cardElement.querySelector('.delete-btn');
  deleteBtn.disabled = true;
  statusMessage.textContent = `Deleting note ${noteId}...`;
  statusMessage.className = 'status loading';

  // Fallback for client-only / non-persisted notes created in session
  if (!noteId || noteId > 100) {
    cardElement.remove();
    statusMessage.textContent = `Note ${noteId} deleted successfully (local mockup item).`;
    statusMessage.className = 'status success';
    checkEmptyState();
    return;
  }

  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/posts/${noteId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Remove from UI list on success
    cardElement.remove();
    statusMessage.textContent = `Note ${noteId} deleted successfully (status ${response.status}).`;
    statusMessage.className = 'status success';

    checkEmptyState();
  } catch (error) {
    console.error('Failed to delete note:', error);
    statusMessage.textContent = `Unable to delete note ${noteId}. Please try again.`;
    statusMessage.className = 'status error';
    deleteBtn.disabled = false;
  }
}

function checkEmptyState() {
  if (notesList.children.length === 0) {
    notesList.innerHTML = '<p class="empty-state">No notes found on the server.</p>';
  }
}

// Event Listeners
loadNotesBtn.addEventListener('click', fetchNotes);
createNoteForm.addEventListener('submit', handleCreateNote);