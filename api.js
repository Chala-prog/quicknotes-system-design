const API_URL = 'https://jsonplaceholder.typicode.com/posts';

// Required Selectors
const loadBtn = document.getElementById('load-btn');
const statusP = document.getElementById('status');
const notesList = document.getElementById('notes-list');
const noteForm = document.getElementById('note-form');
const titleInput = document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');
const submitBtn = document.getElementById('submit-btn');

// --- Reusable Central Request Helper ---
async function request(url, options = {}) {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
  }
  if (response.status === 204) return null;
  return await response.json();
}

// --- Card DOM Builder ---
function createNoteItem(note) {
  const li = document.createElement('li');
  li.className = 'note-card';

  const title = document.createElement('h3');
  title.textContent = note.title;

  const body = document.createElement('p');
  body.textContent = note.body || '';

  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.textContent = 'Delete';
  deleteBtn.addEventListener('click', () => deleteNote(note.id, li));

  li.appendChild(title);
  li.appendChild(body);
  li.appendChild(deleteBtn);

  return li;
}

// --- GET 10 Notes ---
async function loadNotes() {
  notesList.innerHTML = '';
  statusP.textContent = 'Loading notes...';
  statusP.className = 'status loading';
  loadBtn.disabled = true;

  try {
    const notes = await request(`${API_URL}?_limit=10`);

    if (!notes || notes.length === 0) {
      statusP.textContent = 'Loaded 0 notes from the server.';
      statusP.className = 'status success';
      notesList.innerHTML = '<li class="empty-state">No notes found on the server.</li>';
      return;
    }

    notes.forEach((note) => {
      notesList.appendChild(createNoteItem(note));
    });

    statusP.textContent = `Loaded ${notes.length} notes from the server.`;
    statusP.className = 'status success';
  } catch (error) {
    console.error('Failed to load notes:', error);
    statusP.textContent = 'Unable to load notes right now. Please try again.';
    statusP.className = 'status error';
  } finally {
    loadBtn.disabled = false;
  }
}

// --- POST Create Note ---
async function createNote(event) {
  event.preventDefault();
  const titleValue = titleInput.value.trim();
  const bodyValue = bodyInput.value.trim();

  if (!titleValue) {
    statusP.textContent = 'Error: Title is required.';
    statusP.className = 'status error';
    return;
  }

  if (titleValue.length > 100) {
    statusP.textContent = 'Error: Title must be 100 characters or fewer.';
    statusP.className = 'status error';
    return;
  }

  submitBtn.disabled = true;
  statusP.textContent = 'Creating note...';
  statusP.className = 'status loading';

  try {
    const payload = { title: titleValue, body: bodyValue, userId: 1 };
    const createdNote = await request(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      body: JSON.stringify(payload),
    });

    const noteItem = createNoteItem(createdNote);
    notesList.prepend(noteItem);

    statusP.textContent = `Note created (status 201, id ${createdNote.id}).`;
    statusP.className = 'status success';
    noteForm.reset();
  } catch (error) {
    console.error('Failed to create note:', error);
    statusP.textContent = 'Unable to create note. Please try again.';
    statusP.className = 'status error';
  } finally {
    submitBtn.disabled = false;
  }
}

// --- DELETE Note ---
async function deleteNote(noteId, element) {
  statusP.textContent = `Deleting note ${noteId}...`;
  statusP.className = 'status loading';

  if (!noteId || noteId > 100) {
    element.remove();
    statusP.textContent = `Note ${noteId} deleted successfully (local item).`;
    statusP.className = 'status success';
    checkEmpty();
    return;
  }

  try {
    await request(`${API_URL}/${noteId}`, { method: 'DELETE' });
    element.remove();
    statusP.textContent = `Note ${noteId} deleted successfully.`;
    statusP.className = 'status success';
    checkEmpty();
  } catch (error) {
    console.error('Failed to delete note:', error);
    statusP.textContent = `Unable to delete note ${noteId}. Please try again.`;
    statusP.className = 'status error';
  }
}

function checkEmpty() {
  if (notesList.children.length === 0) {
    notesList.innerHTML = '<li class="empty-state">No notes found on the server.</li>';
  }
}

loadBtn.addEventListener('click', loadNotes);
noteForm.addEventListener('submit', createNote);