document.addEventListener('DOMContentLoaded', async function() {
    // --- Core To-Do List Elements ---
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    let tasks = JSON.parse(localStorage.getItem('tasks')) || []; // Initialize tasks array

    // --- AI Welcome Pop-up Elements ---
    const welcomeOverlay = document.getElementById('welcomeOverlay');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const userNameInput = document.getElementById('userNameInput');
    const submitNameBtn = document.getElementById('submitNameBtn');
    const closeWelcomeBtn = document.getElementById('closeWelcomeBtn');
    const storedUserName = localStorage.getItem('todoUserName');

    // --- Copy Email Functionality Elements ---
    const copyEmailBtn = document.getElementById('copyEmailBtn');
    const emailAddressSpan = document.getElementById('email-address'); // Assuming this span holds the email
    const messageBox = document.getElementById('messageBox'); // For success/error messages

    // --- Scroll to Top Button Element ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // --- Section Highlighting Elements ---
    const sections = document.querySelectorAll('section');
    const sectionTitles = document.querySelectorAll('.section-title'); // Assuming these are your nav links/titles

    // --- Skills Hover Effect Elements ---
    const skillItems = document.querySelectorAll('.skill-item');

    // --- Name Hover Effect Element ---
    const userName = document.getElementById('userName');

    // --- Dark Mode Toggle Element ---
    const darkModeToggle = document.getElementById('darkModeToggle');

    // --- Export/Import Elements ---
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importInput = document.getElementById('importInput'); // Hidden file input for import

    // --- Quote Element ---
    const quoteEl = document.getElementById('quote');

    // --- Helper Functions ---

    // Function to display temporary messages (used by copy email)
    function showMessage(message, type) {
        if (!messageBox) {
            console.warn("MessageBox element not found for showMessage.");
            return;
        }
        messageBox.textContent = message;
        messageBox.style.display = 'block';
        messageBox.style.backgroundColor = type === 'success' ? '#d4edda' : '#f8d7da';
        messageBox.style.color = type === 'success' ? '#155724' : '#721c24';
        messageBox.style.borderColor = type === 'success' ? '#c3e6cb' : '#f5c6cb';

        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 3000);
    }

    // Determines time of day for AI greeting
    function getTimeOfDay() {
        const hour = new Date().getHours();
        if (hour < 12) return 'morning';
        if (hour < 18) return 'afternoon';
        return 'evening';
    }

    // Fetches AI welcome message from Netlify Function
    async function fetchAiWelcomeMessage(userName, timeOfDay) {
        try {
            const response = await fetch('/.netlify/functions/get-ai-welcome', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ userName: userName, timeOfDay: timeOfDay })
            });
            const data = await response.json();
            if (response.ok) {
                return data.message;
            } else {
                console.error('AI API Error:', data.error);
                return `Hello ${userName}, something went wrong getting your AI message.`;
            }
        } catch (error) {
            console.error('Error fetching AI message:', error);
            return `Hello ${userName}, I'm here to help you get organized!`; // Fallback message
        }
    }

    // Manages the display of the welcome overlay
    async function showWelcomeOverlay(userName, isNewUser) {
        if (!welcomeOverlay || !modalTitle || !modalMessage || !userNameInput || !submitNameBtn || !closeWelcomeBtn) {
            console.warn("Welcome overlay elements not found. Skipping welcome pop-up.");
            return;
        }

        const timeOfDay = getTimeOfDay();
        modalTitle.textContent = isNewUser ? "Welcome to your Advanced TODO!" : `Welcome back, ${userName}!`;
        userNameInput.style.display = 'none'; // Hide input field
        submitNameBtn.style.display = 'none'; // Hide submit button
        closeWelcomeBtn.style.display = 'block'; // Show close button

        modalMessage.textContent = 'Generating a personalized message...'; // Loading message

        const aiMessage = await fetchAiWelcomeMessage(userName, timeOfDay);
        modalMessage.textContent = aiMessage;

        welcomeOverlay.style.display = 'flex'; // Show the overlay
    }

    // Saves tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    // Loads tasks from localStorage
    function loadTasks() {
        const stored = localStorage.getItem('tasks');
        if (stored) {
            tasks = JSON.parse(stored);
        }
    }

    // Renders tasks to the DOM based on filter
    function renderTasks(filter = 'all') {
        if (!taskList) {
            console.warn("Task list element not found for rendering.");
            return;
        }
        taskList.innerHTML = ''; // Clear existing tasks
        let filteredTasks = tasks;

        if (filter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `flex justify-between items-center p-2 mb-2 rounded-md ${task.completed ? 'completed' : ''}`; // Add your styling classes

            // Use innerHTML for simplicity here, but be mindful of XSS if task.text comes from untrusted sources
            li.innerHTML = `
                <span class="flex-grow">${task.text}</span>
                <div class="flex space-x-2">
                    <button class="complete-btn bg-green-500 text-white px-3 py-1 rounded-md">${task.completed ? 'Undo' : 'Complete'}</button>
                    <button class="delete-btn bg-red-500 text-white px-3 py-1 rounded-md">Delete</button>
                </div>
            `;
            taskList.appendChild(li);

            // Attach event listeners to the buttons within the newly created li
            // Use 'tasks.indexOf(task)' to ensure correct index after filtering/re-rendering
            const originalIndex = tasks.indexOf(task); // Find original index in the 'tasks' array
            li.querySelector('.complete-btn').addEventListener('click', () => toggleComplete(originalIndex));
            li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(originalIndex));
        });
        saveTasks(); // Save tasks after rendering
    }

    // Adds a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            tasks.push({ text: taskText, completed: false });
            taskInput.value = '';
            renderTasks(); // Re-render to show new task
        }
    }

    // Toggles task completion status
    function toggleComplete(index) {
        if (tasks[index]) { // Ensure task exists
            tasks[index].completed = !tasks[index].completed;
            renderTasks(); // Re-render to reflect change
        }
    }

    // Deletes a task
    function deleteTask(index) {
        if (tasks[index]) { // Ensure task exists
            tasks.splice(index, 1); // Remove task at index
            renderTasks(); // Re-render to reflect change
        }
    }

    // Highlights active section in navigation
    function highlightActiveSection() {
        let currentActive = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            // Check if the section is in the viewport, considering a buffer
            if (window.pageYOffset >= sectionTop - sectionHeight / 3) {
                currentActive = section.getAttribute('id');
            }
        });

        sectionTitles.forEach(title => {
            title.classList.remove('active');
            // Find the corresponding title for the active section
            // This assumes section-title's parent has the section ID
            if (title.parentElement && title.parentElement.getAttribute('id') === currentActive) {
                title.classList.add('active');
            }
        });
    }


    // --- Event Listeners and Initial Calls ---

    // AI Welcome Pop-up Logic
    if (!storedUserName) {
        // First time user, show name input
        if (welcomeOverlay) welcomeOverlay.style.display = 'flex';
        if (modalTitle) modalTitle.textContent = "Welcome to your Advanced TODO!";
        if (modalMessage) modalMessage.textContent = "What should I call you?";
        if (userNameInput) userNameInput.style.display = 'block';
        if (submitNameBtn) submitNameBtn.style.display = 'block';
        if (closeWelcomeBtn) closeWelcomeBtn.style.display = 'none';
    } else {
        // Returning user, directly show AI welcome
        showWelcomeOverlay(storedUserName, false);
    }

    if (submitNameBtn) {
        submitNameBtn.addEventListener('click', async function() {
            const name = userNameInput.value.trim();
            if (name) {
                localStorage.setItem('todoUserName', name);
                await showWelcomeOverlay(name, true);
            } else {
                // Use showMessage for better UX instead of alert
                showMessage('Please enter your name!', 'error');
            }
        });
    }

    if (closeWelcomeBtn) {
        closeWelcomeBtn.addEventListener('click', function() {
            if (welcomeOverlay) welcomeOverlay.style.display = 'none';
        });
    }

    // To-Do List Event Listeners
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', addTask);
    }
    if (taskInput) {
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                addTask();
            }
        });
    }

    document.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.getAttribute('data-filter');
            renderTasks(filter);
        });
    });

    // Copy Email Functionality
    if (copyEmailBtn && emailAddressSpan && messageBox) {
        copyEmailBtn.addEventListener('click', function() {
            const email = emailAddressSpan.textContent;
            const tempInput = document.createElement('textarea');
            tempInput.value = email;
            document.body.appendChild(tempInput);
            tempInput.select();
            try {
                document.execCommand('copy');
                showMessage('Email copied to clipboard!', 'success');
            } catch (err) {
                showMessage('Failed to copy email. Please copy manually.', 'error');
                console.error('Copy command failed:', err);
            }
            document.body.removeChild(tempInput);
        });
    }

    // Scroll to Top Button Functionality
    if (scrollToTopBtn) {
        window.onscroll = function() {
            if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
                scrollToTopBtn.style.display = "block";
            } else {
                scrollToTopBtn.style.display = "none";
            }
        };
        scrollToTopBtn.addEventListener('click', function() {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        });
    }

    // Section Highlighting
    window.addEventListener('scroll', highlightActiveSection);
    highlightActiveSection(); // Call on load to set initial active section

    // Skills Hover Effect (placeholder as per original)
    skillItems.forEach(item => {
        // Tailwind's hover classes are usually sufficient, but if more complex JS interaction is needed,
        // you would add mouseenter/mouseleave listeners here.
    });

    // Name Hover Effect
    if (userName) {
        userName.addEventListener('mouseenter', function() {
            userName.classList.add('hovered');
        });
        userName.addEventListener('mouseleave', function() {
            userName.classList.remove('hovered');
        });
    }

    // Export tasks
    if (exportBtn) {
        exportBtn.onclick = function() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(tasks));
            const dlAnchor = document.createElement('a');
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", "tasks.json");
            dlAnchor.click();
        };
    }

    // Import tasks
    if (importBtn && importInput) {
        importBtn.onclick = function() {
            importInput.click();
        };
        importInput.onchange = function(event) {
            const file = event.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    tasks = JSON.parse(e.target.result);
                    saveTasks(); // Save after import
                    renderTasks(); // Re-render after import
                } catch (error) {
                    showMessage("Invalid file format! Please import a valid JSON file.", 'error');
                    console.error("Import error:", error);
                }
            };
            reader.readAsText(file);
        };
    }

    // Initial load and render of tasks
    loadTasks();
    renderTasks();

    // Fetch random quote from API
    // Ensure the 'quote' element exists before trying to set its textContent
    if (quoteEl) {
        fetch('https://api.quotable.io/random')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                quoteEl.textContent = data.content;
            })
            .catch(error => {
                console.error('Error fetching quote:', error);
                // Fallback to a local quote if API fails
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
                quoteEl.textContent = quotes[Math.floor(Math.random() * quotes.length)];
            });
    }
});
