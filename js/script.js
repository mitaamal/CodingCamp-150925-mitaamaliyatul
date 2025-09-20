// Menyiapkan elemen-elemen DOM yang akan digunakan
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoDate = document.getElementById('todo-date');
const todoList = document.getElementById('todo-list');
const deleteAllBtn = document.getElementById('delete-all-btn');
const filterBtn = document.getElementById('filter-btn');

// Array untuk menyimpan data To-Do. Data diambil dari localStorage jika ada.
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let isFilterActive = false;

// Fungsi untuk menyimpan data ke localStorage browser
function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

// Fungsi untuk menampilkan (render) semua To-Do ke layar
function displayTodos() {
    todoList.innerHTML = ""; // Kosongkan list sebelum menampilkan yang baru

    let todosToDisplay = isFilterActive ? todos.filter(todo => !todo.completed) : todos;

    if (todosToDisplay.length === 0) {
        todoList.innerHTML = '<p class="no-task">No task found</p>';
        return;
    }

    todosToDisplay.forEach(todo => {
        const todoItem = document.createElement('div');
        todoItem.classList.add('todo-item');
        if (todo.completed) {
            todoItem.classList.add('completed');
        }
        
        const noteContent = (todo.note && todo.note.trim() !== '') 
            ? `<span class="note-text">${todo.note}</span>` 
            // --- DIUBAH DI SINI: Menambahkan onchange ---
            // Sekarang input akan memanggil fungsi saat 'Enter' ditekan ATAU saat fokus hilang (klik di luar)
            : `<input 
                type="text" 
                class="note-input" 
                placeholder="Add a note..." 
                onkeydown="handleNoteKeyPress(event, ${todo.id})"
                onchange="handleNoteChange(event, ${todo.id})">`;

        todoItem.innerHTML = `
            <div class="task-text">${todo.task}</div>
            <div class="due-date">${todo.date}</div>
            <div>
                <span class="status-badge ${todo.completed ? 'completed' : 'pending'}">
                    ${todo.completed ? 'Completed' : 'Pending'}
                </span>
            </div>
            <div class="action-buttons">
                <button class="toggle-btn" data-id="${todo.id}"><i class="fas fa-check"></i></button>
                <button class="delete-btn" data-id="${todo.id}"><i class="fas fa-trash"></i></button>
                ${noteContent}
            </div>
        `;
        todoList.appendChild(todoItem);
    });
}

// Fungsi untuk MENAMBAHKAN To-Do baru
function addTodo(event) {
    event.preventDefault();
    const task = todoInput.value.trim();
    const date = todoDate.value;

    if (!validateInput(task, date)) return;

    const newTodo = {
        id: Date.now(),
        task: task,
        date: date,
        completed: false,
        note: ""
    };
    todos.push(newTodo);
    saveTodos();
    displayTodos();
    todoInput.value = "";
    todoDate.value = "";
}

// Fungsi untuk menangani tombol 'Enter' pada input note
function handleNoteKeyPress(event, id) {
    if (event.key === 'Enter') {
        event.preventDefault();
        const newNote = event.target.value;
        saveNote(id, newNote);
    }
}

// --- FUNGSI BARU: Menangani event saat fokus hilang (klik di luar) ---
function handleNoteChange(event, id) {
    const newNote = event.target.value;
    saveNote(id, newNote);
}

// Fungsi untuk MENYIMPAN NOTE (dipanggil oleh kedua fungsi di atas)
function saveNote(id, newNote) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            todo.note = newNote;
        }
        return todo;
    });
    saveTodos();
    displayTodos(); // Tampilkan ulang list agar input berubah jadi teks
}

// Fungsi untuk MENGUBAH STATUS (pending/completed)
function toggleStatus(id) {
    todos = todos.map(todo => {
        if (todo.id === id) { todo.completed = !todo.completed; }
        return todo;
    });
    saveTodos();
    displayTodos();
}

// Fungsi untuk MENGHAPUS SATU To-Do
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveTodos();
    displayTodos();
}

// Fungsi untuk MENGHAPUS SEMUA To-Do
function deleteAllTodos() {
    if (todos.length > 0 && confirm("Are you sure you want to delete ALL tasks?")) {
        todos = [];
        saveTodos();
        displayTodos();
    }
}

// Fungsi untuk FILTER (hanya tampilkan yang 'pending')
function filterTodos() {
    isFilterActive = !isFilterActive;
    filterBtn.style.backgroundColor = isFilterActive ? '#4299e1' : '#4a5568';
    displayTodos();
}

// Fungsi untuk VALIDASI input form
function validateInput(todo, date) {
    if (todo === "" || date === "") {
        alert("Please fill in both the task and the date.");
        return false;
    }
    return true;
}

// Menjalankan fungsi-fungsi saat ada interaksi dari user
todoForm.addEventListener('submit', addTodo);
deleteAllBtn.addEventListener('click', deleteAllTodos);
filterBtn.addEventListener('click', filterTodos);

// Listener untuk tombol-tombol di dalam list (toggle dan delete)
todoList.addEventListener('click', function(event) {
    const element = event.target;
    const toggleButton = element.closest('.toggle-btn');
    const deleteButton = element.closest('.delete-btn');

    if (toggleButton) {
        const id = toggleButton.dataset.id;
        toggleStatus(Number(id));
    }
    if (deleteButton) {
        const id = deleteButton.dataset.id;
        deleteTodo(Number(id));
    }
});

// Tampilkan To-Do yang sudah ada saat halaman pertama kali dimuat
displayTodos();