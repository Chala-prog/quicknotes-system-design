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

// --- Helper Functions ---

function createNoteCard(note) {
  const card = document.createElement('article');
  card.className = 'note-card';

  const title = document.createElement('h3');
  title.textContent = note.title;

  const body = document.createElement('p');
  body.textContent = note.body || '';

  card.appendChild(title);
  card.appendChild(body);
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

  // 1. Validation
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

  // 2. Set UI loading state
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

    // 3. Prepend newly created note to top of list
    const noteCard = createNoteCard(createdNote);
    notesList.prepend(noteCard);

    // 4. Update status message
    statusMessage.textContent = `Note created (status ${response.status}, id ${createdNote.id}).`;
    statusMessage.className = 'status success';

    // 5. Clear form after success
    createNoteForm.reset();
  } catch (error) {
    console.error('Failed to create note:', error);
    statusMessage.textContent = 'Unable to create note. Please try again.';
    statusMessage.className = 'status error';
  } finally {
    // 6. Re-enable button
    submitNoteBtn.disabled = false;
  }
}

// Event Listeners
loadNotesBtn.addEventListener('click', fetchNotes);
createNoteForm.addEventListener('submit', handleCreateNote);