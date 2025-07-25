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
    const closeWelcomeBtn = document.getElementById('closeWelcomeBtn'); // Still reference, but will hide/remove listeners
    const storedUserName = localStorage.getItem('todoUserName');

    // --- Copy Email Functionality Elements (UPDATED IDs FOR FOOTER) ---
    const copyEmailBtn = document.getElementById('copyEmailBtnFooter'); // New ID for footer button
    const emailAddressSpan = document.getElementById('emailAddressFooter'); // New ID for footer email text
    const messageBox = document.getElementById('messageBox'); // For success/error messages

    // --- Scroll to Top Button Element ---
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    // --- Section Highlighting Elements ---
    const sections = document.querySelectorAll('section');
    const sectionTitles = document.querySelectorAll('.section-title');

    // --- Skills Hover Effect Elements ---
    const skillItems = document.querySelectorAll('.skill-item');

    // --- Name Hover Effect Element ---
    const userNameDisplay = document.getElementById('userName'); // This is the span element for "Piyush Kumar" / user's name


    // --- Dark Mode Toggle Element ---
    const darkModeToggle = document.getElementById('darkModeToggle');

    // --- Export/Import Elements ---
    const exportBtn = document.getElementById('exportBtn');
    const importBtn = document.getElementById('importBtn');
    const importInput = document.getElementById('importInput');

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

        // Dark mode specific colors for messageBox
        if (document.body.classList.contains('dark-mode')) {
             messageBox.style.backgroundColor = type === 'success' ? '#3A3A3A' : '#4A2A2A';
             messageBox.style.color = type === 'success' ? '#A8DADC' : '#FFC1CC';
             messageBox.style.borderColor = type === 'success' ? '#555' : '#7A3A3A';
        }


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
    async function fetchAiWelcomeMessage(userName) {
        try {
            const response = await fetch('/.netlify/functions/get-ai-welcome', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userName: userName, timeOfDay: getTimeOfDay() })
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
            return `Hello ${userName}, I'm here to help you get organized!`;
        }
    }

    // Manages the display of the welcome overlay
    async function showWelcomeOverlay(userName, isNewUser) {
        if (!welcomeOverlay || !modalTitle || !modalMessage || !userNameInput || !submitNameBtn || !closeWelcomeBtn) {
            console.warn("Welcome overlay elements not found. Skipping welcome pop-up.");
            return;
        }

        // Set the greeting text for the main page
        if (userNameDisplay) {
            userNameDisplay.textContent = userName;
        }

        const timeOfDay = getTimeOfDay();
        modalTitle.textContent = isNewUser ? "Welcome to your Advanced TODO!" : `Welcome back, ${userName}!`;
        userNameInput.style.display = 'none'; // Always hide input after initial interaction
        submitNameBtn.style.display = 'none'; // Always hide submit after initial interaction

        modalMessage.textContent = 'Generating a personalized message...'; // Loading message

        const aiMessage = await fetchAiWelcomeMessage(userName);
        modalMessage.textContent = aiMessage;

        welcomeOverlay.style.display = 'flex'; // Show the overlay

        // Auto-close the pop-up after AI message is displayed
        setTimeout(() => {
            welcomeOverlay.style.display = 'none';
        }, 3000); // Close after 3 seconds
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
        taskList.innerHTML = '';
        let filteredTasks = tasks;

        if (filter === 'active') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.className = `flex justify-between items-center p-2 mb-2 rounded-md ${task.completed ? 'completed' : ''}`;

            li.innerHTML = `
                <div class="flex flex-col items-start flex-grow">
                    <span>${task.text}</span>
                </div>
                <div class="flex space-x-2">
                    <button class="complete-btn bg-green-500 text-white px-3 py-1 rounded-md">${task.completed ? 'Undo' : 'Complete'}</button>
                    <button class="delete-btn bg-red-500 text-white px-3 py-1 rounded-md">Delete</button>
                </div>
            `;
            taskList.appendChild(li);

            const originalIndex = tasks.indexOf(task);
            li.querySelector('.complete-btn').addEventListener('click', () => toggleComplete(originalIndex));
            li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(originalIndex));
        });
        saveTasks();
    }

    // Adds a new task
    function addTask() {
        const taskText = taskInput.value.trim();
        if (taskText) {
            tasks.push({ text: taskText, completed: false });
            taskInput.value = '';
            renderTasks();
        }
    }

    // Toggles task completion status
    function toggleComplete(index) {
        if (tasks[index]) {
            tasks[index].completed = !tasks[index].completed;
            renderTasks();
        }
    }

    // Deletes a task
    function deleteTask(index) {
        if (tasks[index]) {
            tasks.splice(index, 1);
            renderTasks();
        }
    }

    // Highlights active section in navigation
    function highlightActiveSection() {
        let currentActive = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= sectionTop - sectionHeight / 3) {
                currentActive = section.getAttribute('id');
            }
        });

        sectionTitles.forEach(title => {
            title.classList.remove('active');
            if (title.parentElement && title.parentElement.getAttribute('id') === currentActive) {
                title.classList.add('active');
            }
        });
    }


    // --- Event Listeners and Initial Calls ---

    // Personalized Greeting Element (p tag)
    const personalizedGreeting = document.getElementById('personalizedGreeting');
    if (!personalizedGreeting) {
        console.warn("Personalized greeting element (p#personalizedGreeting) not found. Skipping dynamic name display.");
    }


    // AI Welcome Pop-up Logic - Initial Display
    if (welcomeOverlay) {
        if (!storedUserName) {
            // First time user: show name input, hide close button
            welcomeOverlay.style.display = 'flex';
            if (modalTitle) modalTitle.textContent = "Welcome to your Advanced TODO!";
            if (modalMessage) modalMessage.textContent = "What should I call you?";
            if (userNameInput) userNameInput.style.display = 'block';
            if (submitNameBtn) submitNameBtn.style.display = 'block';
            if (closeWelcomeBtn) closeWelcomeBtn.style.display = 'none'; // Hide close button
        } else {
            // Returning user: set name, show AI message, auto-close
            if (userNameDisplay) {
                userNameDisplay.textContent = storedUserName;
            }
            await showWelcomeOverlay(storedUserName, false);
        }
    } else {
        console.warn("Welcome overlay element not found. AI welcome pop-up will not function.");
    }


    // Event listener for the "Let's Go!" button (submitNameBtn)
    if (submitNameBtn) {
        submitNameBtn.addEventListener('click', async function() {
            const name = userNameInput.value.trim();
            if (name) {
                localStorage.setItem('todoUserName', name);
                // Update the main page greeting with the entered name
                if (userNameDisplay) {
                    userNameDisplay.textContent = name;
                }
                // Show AI message and auto-close
                await showWelcomeOverlay(name, true);
            } else {
                showMessage('Please enter your name!', 'error');
            }
        });
    }

    // Ensure the "Close" button is initially hidden and its listener is removed if not used
    if (closeWelcomeBtn) {
        closeWelcomeBtn.style.display = 'none'; // Ensure it's hidden by default for this flow
        // Remove any existing click listeners if they were attached
        closeWelcomeBtn.removeEventListener('click', function() {}); // Dummy function to remove all listeners
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
    } else {
        console.warn("Email copy button or email address span not found. Email copy feature will not function.");
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
    } else {
        console.warn("Scroll to top button not found. Scroll to top feature will not function.");
    }


    // Section Highlighting
    if (sections.length > 0 && sectionTitles.length > 0) {
        window.addEventListener('scroll', highlightActiveSection);
        highlightActiveSection();
    } else {
        console.warn("Sections or section titles not found for highlighting. Skipping feature.");
    }


    // Skills Hover Effect (placeholder as per original)
    skillItems.forEach(item => {
        // Tailwind's hover classes are usually sufficient, but if more complex JS interaction is needed,
        // you would add mouseenter/mouseleave listeners here.
    });

    // Name Hover Effect (Attached once, outside conditional logic)
    if (userNameDisplay) {
        userNameDisplay.addEventListener('mouseenter', function() {
            userNameDisplay.classList.add('hovered');
        });
        userNameDisplay.addEventListener('mouseleave', function() {
            userNameDisplay.classList.remove('hovered');
        });
    } else {
        console.warn("User name display element not found for hover effect. Skipping feature.");
    }


    // Dark Mode Toggle
    if (darkModeToggle) {
        // Function to apply/remove dark mode class and update button text
        const applyDarkMode = (isEnabled) => {
            if (isEnabled) {
                document.body.classList.add('dark-mode');
                darkModeToggle.textContent = 'Light Mode';
                localStorage.setItem('darkMode', 'enabled');
            } else {
                document.body.classList.remove('dark-mode');
                darkModeToggle.textContent = 'Dark Mode';
                localStorage.setItem('darkMode', 'disabled');
            }
        };

        // Event listener for the toggle button
        darkModeToggle.addEventListener('click', function() {
            const isCurrentlyDarkMode = document.body.classList.contains('dark-mode');
            applyDarkMode(!isCurrentlyDarkMode); // Toggle the state
        });

        // Apply dark mode preference on initial load
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode === 'enabled') {
            applyDarkMode(true);
        } else {
            applyDarkMode(false); // Ensure light mode is applied if not explicitly enabled
        }
    } else {
        console.warn("Dark mode toggle button not found. Dark mode feature will not function.");
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
    } else {
        console.warn("Export button not found. Export feature will not function.");
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
    } else {
        console.warn("Import button or input not found. Import feature will not function.");
    }


    // Initial load and render of tasks
    loadTasks();
    renderTasks();

    // Fetch random quote from API
    if (quoteEl) {
        const placeholderQuotes = [
            "Loading a fresh dose of motivation...",
            "The secret of getting ahead is getting started.",
            "Little things make big days."
        ];
        quoteEl.textContent = placeholderQuotes[Math.floor(Math.random() * placeholderQuotes.length)];


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
    } else {
        console.warn("Quote element not found. Quote feature will not function.");
    }
});
