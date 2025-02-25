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
 