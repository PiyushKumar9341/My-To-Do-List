document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
 
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
 
    function renderTasks(filter = 'all') {
        taskList.innerHTML = '';
        tasks.forEach((task, index) => {
            if (filter === 'active' && task.completed) return;
            if (filter === 'completed' && !task.completed) return;
 
            const li = document.createElement('li');
            li.className = task.completed ? 'completed' : '';
            li.innerHTML = `
                <span>${task.text}</span>
                <div>
                    <button class="complete-btn">${task.completed ? 'Undo' : 'Complete'}</button>
                    <button class="delete-btn">Delete</button>
                </div>
            `;
            taskList.appendChild(li);
 
            
            li.querySelector('.complete-btn').addEventListener('click', () => toggleComplete(index));
            li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(index));
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
 
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            tasks.push({ text: taskText, completed: false });
            taskInput.value = '';
            renderTasks();
        }
    }
 
    function toggleComplete(index) {
        tasks[index].completed = !tasks[index].completed;
        renderTasks();
    }
 
    function deleteTask(index) {
        tasks.splice(index, 1);
        renderTasks();
    }
 
    addTaskBtn.addEventListener('click', addTask);
 
   
    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            renderTasks(filter);
        });
    });
 
   
    renderTasks();
 });
 

document.addEventListener('DOMContentLoaded', () => {
  

    // Motivational quotes array
    const quotes = [
        "Believe you can and you're halfway there.",
        "Success is not final, failure is not fatal: It is the courage to continue that counts.",
        "Don’t watch the clock; do what it does. Keep going.",
        "The secret of getting ahead is getting started.",
        "It always seems impossible until it’s done.",
        "Dream big and dare to fail.",
        "Start where you are. Use what you have. Do what you can.",
        "Push yourself, because no one else is going to do it for you.",
        "Great things never come from comfort zones.",
        "Little things make big days."
    ];

    // Show a random quote
    const quoteEl = document.getElementById('quote');
    if (quoteEl) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteEl.textContent = randomQuote;
    }

    
});


const darkModeToggle = document.getElementById('darkModeToggle');
darkModeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        darkModeToggle.textContent = ' Light Mode';
    } else {
        darkModeToggle.textContent = ' Dark Mode';
    }
});

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Load tasks from localStorage
function loadTasks() {
    const stored = localStorage.getItem('tasks');
    if (stored) {
        tasks = JSON.parse(stored);
    }
}

// Call loadTasks() when the app starts
document.addEventListener('DOMContentLoaded', () => {
    loadTasks();
    renderTasks();
    // ...rest of your code...
});
// Export tasks
document.getElementById('exportBtn').onclick = function() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", "tasks.json");
    dlAnchor.click();
};

// Import tasks
document.getElementById('importBtn').onclick = function() {
    document.getElementById('importInput').click();
};
document.getElementById('importInput').onchange = function(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            tasks = JSON.parse(e.target.result);
            saveTasks();
            renderTasks();
        } catch {
            alert("Invalid file!");
        }
    };
    reader.readAsText(file);
};
fetch('https://api.quotable.io/random')
    .then(response => response.json())
    .then(data => {
        document.getElementById('quote').textContent = data.content;
    });
 