const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// UI Element References
const loadBtn = document.getElementById('load-btn');
const submitBtn = document.getElementById('submit-btn');
const noteForm = document.getElementById('note-form');
const titleInput = document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');
const statusP = document.getElementById('status');
const notesList = document.getElementById('notes-list');

// State tracking
let isLoading = false;

/**
 * Reusable helper function to handle fetch requests safely.
 */
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
  }
  // Handle empty responses (e.g., DELETE endpoint)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null;
  }
  return await response.json();
}

/**
 * Updates UI status message and CSS class.
 */
function setStatus(message, type = '') {
  statusP.textContent = message;
  statusP.className = type; // 'loading', 'success', 'error', or ''
}

/**
 * Enables or disables action buttons during async operations.
 */
function setButtonsDisabled(disabled) {
  isLoading = disabled;
  loadBtn.disabled = disabled;
  submitBtn.disabled = disabled;
  const deleteButtons = notesList.querySelectorAll('.delete-btn');
  deleteButtons.forEach(btn => btn.disabled = disabled);
}

/**
 * Renders notes using textContent exclusively to eliminate XSS risks.
 */
function renderNotes(notes) {
  notesList.innerHTML = '';

  if (!notes || notes.length === 0) {
    setStatus('No notes available.', 'success');
    return;
  }

  notes.forEach(note => {
    const li = document.createElement('li');
    li.dataset.id = note.id;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'note-content';

    const h3 = document.createElement('h3');
    h3.textContent = note.title; // Safe text insertion

    const p = document.createElement('p');
    p.textContent = note.body; // Safe text insertion

    contentDiv.appendChild(h3);
    contentDiv.appendChild(p);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteNote(note.id, li));

    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);
    notesList.appendChild(li);
  });
}

/**
 * Fetch and load 10 notes (GET).
 */
async function fetchNotes() {
  setButtonsDisabled(true);
  setStatus('Loading notes...', 'loading');

  try {
    const data = await request(`${API_URL}?_limit=10`);
    renderNotes(data);
    setStatus('Notes loaded successfully.', 'success');
  } catch (err) {
    setStatus(`Failed to load notes: ${err.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

/**
 * Create a new note (POST).
 */
async function createNote(event) {
  event.preventDefault();

  const title = titleInput.value.trim();
  const body = bodyInput.value.trim();

  // Client-side validation
  if (!title) {
    setStatus('Validation Error: Title is required.', 'error');
    return;
  }

  if (title.length > 100) {
    setStatus('Validation Error: Title must be 100 characters or fewer.', 'error');
    return;
  }

  setButtonsDisabled(true);
  setStatus('Creating note...', 'loading');

  try {
    const newNoteData = { title, body, userId: 1 };
    const createdNote = await request(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newNoteData)
    });

    // Append created note locally (JSONPlaceholder yields mock ID)
    const li = document.createElement('li');
    li.dataset.id = createdNote.id;

    const contentDiv = document.createElement('div');
    const h3 = document.createElement('h3');
    h3.textContent = createdNote.title;
    const p = document.createElement('p');
    p.textContent = createdNote.body;
    contentDiv.appendChild(h3);
    contentDiv.appendChild(p);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.className = 'delete-btn';
    deleteBtn.addEventListener('click', () => deleteNote(createdNote.id, li));

    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);
    notesList.prepend(li);

    titleInput.value = '';
    bodyInput.value = '';
    setStatus('Note created successfully!', 'success');
  } catch (err) {
    setStatus(`Failed to create note: ${err.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

/**
 * Remove a note (DELETE).
 */
async function deleteNote(id, element) {
  setButtonsDisabled(true);
  setStatus(`Deleting note #${id}...`, 'loading');

  try {
    await request(`${API_URL}/${id}`, { method: 'DELETE' });
    element.remove();
    setStatus(`Note #${id} deleted successfully.`, 'success');

    if (notesList.children.length === 0) {
      setStatus('No notes left.', 'success');
    }
  } catch (err) {
    setStatus(`Failed to delete note: ${err.message}`, 'error');
  } finally {
    setButtonsDisabled(false);
  }
}

// Event Listeners
loadBtn.addEventListener('click', fetchNotes);
noteForm.addEventListener('submit', createNote);