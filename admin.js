// Check if user is logged in
function checkLogin() {
    // If on admin dashboard, verify login status
    if (window.location.pathname.includes('admin-dashboard.html')) {
        const loggedIn = sessionStorage.getItem('adminLoggedIn');
        if (!loggedIn || loggedIn !== 'true') {
            // Redirect to login page if not logged in
            window.location.href = 'admin-login.html';
        }
    }
}

// Handle login form submission
function setupLoginForm() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const messageDiv = document.getElementById('loginMessage');
            
            // Load admin users XML
            const xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    const users = this.responseXML.getElementsByTagName('user');
                    let authenticated = false;
                    
                    for (let i = 0; i < users.length; i++) {
                        const user = users[i];
                        const xmlUsername = user.getElementsByTagName('username')[0].textContent;
                        const xmlPassword = user.getElementsByTagName('password')[0].textContent;
                        
                        if (username === xmlUsername && password === xmlPassword) {
                            authenticated = true;
                            break;
                        }
                    }
                    
                    if (authenticated) {
                        // Set session storage to remember login
                        sessionStorage.setItem('adminLoggedIn', 'true');
                        sessionStorage.setItem('adminUsername', username);
                        
                        // Show success message
                        messageDiv.textContent = 'Login successful! Redirecting...';
                        messageDiv.className = 'login-message success';
                        
                        // Redirect to admin dashboard
                        setTimeout(function() {
                            window.location.href = 'admin-dashboard.html';
                        }, 1000);
                    } else {
                        // Show error message
                        messageDiv.textContent = 'Invalid username or password';
                        messageDiv.className = 'login-message';
                    }
                }
            };
            xhr.open("GET", "admin-users.xml", true);
            xhr.send();
        });
    }
}

// Handle logout
function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            // Clear session storage
            sessionStorage.removeItem('adminLoggedIn');
            sessionStorage.removeItem('adminUsername');
            
            // Redirect to login page
            window.location.href = 'index.html';
        });
    }
}

// Setup admin dashboard tabs
function setupTabs() {
    const tabs = document.querySelectorAll('.admin-tab');
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Show corresponding content
                const tabId = this.getAttribute('data-tab');
                const tabContents = document.querySelectorAll('.tab-content');
                
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === tabId) {
                        content.classList.add('active');
                    }
                });
            });
        });
    }
}

// Load events for management
function loadEventsForManagement() {
    // Load both upcoming and past events
    loadEvents(populateEventsTable, { eventType: 'all' });
}

// Populate events table in admin dashboard
function populateEventsTable(events) {
    const upcomingTable = document.getElementById('upcomingEventsTable');
    const pastTable = document.getElementById('pastEventsTable');
    
    if (!upcomingTable || !pastTable) return;
    
    const now = new Date();
    const upcomingEvents = events.filter(event => new Date(event.date) > now);
    const pastEvents = events.filter(event => new Date(event.date) < now);
    
    // Sort upcoming events by date (nearest first)
    upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    // Sort past events by date (most recent first)
    pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Populate upcoming events table
    upcomingTable.innerHTML = '<tr>' +
        '<th>ID</th>' +
        '<th>Title</th>' +
        '<th>Date</th>' +
        '<th>Department</th>' +
        '<th>Actions</th>' +
        '</tr>';
    
    upcomingEvents.forEach(event => {
        upcomingTable.innerHTML += `
            <tr>
                <td>${event.id}</td>
                <td>${event.title}</td>
                <td>${formatDate(event.date)}</td>
                <td>${event.department}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${event.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${event.id}">Delete</button>
                    <button class="action-btn move-btn" data-id="${event.id}">Move to Past</button>
                </td>
            </tr>
        `;
    });
    
    // Populate past events table
    pastTable.innerHTML = '<tr>' +
        '<th>ID</th>' +
        '<th>Title</th>' +
        '<th>Date</th>' +
        '<th>Department</th>' +
        '<th>Actions</th>' +
        '</tr>';
    
    pastEvents.forEach(event => {
        pastTable.innerHTML += `
            <tr>
                <td>${event.id}</td>
                <td>${event.title}</td>
                <td>${formatDate(event.date)}</td>
                <td>${event.department}</td>
                <td>
                    <button class="action-btn edit-btn" data-id="${event.id}">Edit</button>
                    <button class="action-btn delete-btn" data-id="${event.id}">Delete</button>
                </td>
            </tr>
        `;
    });
    
    // Setup event buttons
    setupEventActions();
}

// Setup event action buttons (edit, delete, move)
function setupEventActions() {
    // Edit buttons
    const editButtons = document.querySelectorAll('.edit-btn');
    editButtons.forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.getAttribute('data-id');
            // Redirect to edit page
            window.location.href = `edit-event.html?id=${eventId}`;
        });
    });
    
    // Delete buttons
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.getAttribute('data-id');
            if (confirm('Are you sure you want to delete this event?')) {
                deleteEvent(eventId);
            }
        });
    });
    
    // Move buttons
    const moveButtons = document.querySelectorAll('.move-btn');
    moveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const eventId = this.getAttribute('data-id');
            if (confirm('Move this event to past events?')) {
                moveEventToPast(eventId);
            }
        });
    });
}

// Handle event deletion
function deleteEvent(eventId) {
    alert('Delete functionality would connect to server to remove event ID: ' + eventId);
    // In a real implementation, this would send a request to the server
    // to delete the event from the XML file
}

// Handle moving event to past
function moveEventToPast(eventId) {
    alert('Move functionality would update event date to make it a past event: ' + eventId);
    // In a real implementation, this would update the event date
    // to make it appear in past events
}

// Handle add event form submission
function setupAddEventForm() {
    const addEventForm = document.getElementById('addEventForm');
    if (addEventForm) {
        addEventForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const title = document.getElementById('eventTitle').value;
            const date = document.getElementById('eventDate').value;
            const time = document.getElementById('eventTime').value;
            const location = document.getElementById('eventLocation').value;
            const department = document.getElementById('eventDepartment').value;
            const description = document.getElementById('eventDescription').value;
            const image = document.getElementById('eventImage').value;
            
            // Combine date and time
            const eventDateTime = `${date}T${time}:00`;
            
            // Generate ID (would be handled server-side in real implementation)
            const eventId = Date.now();
            
            const formMessage = document.getElementById('formMessage');
            
            // Simulate saving event
            formMessage.textContent = 'Event added successfully!';
            formMessage.className = 'form-message success-message';
            
            // Reset form
            addEventForm.reset();
            
            // In a real implementation, this would send data to the server
            // to add the event to the XML file
        });
    }
}

// Initialize admin dashboard functions
document.addEventListener('DOMContentLoaded', function() {
    checkLogin();
    setupLoginForm();
    setupLogout();
    setupTabs();
    
    // If on dashboard page, load events
    if (window.location.pathname.includes('admin-dashboard.html')) {
        loadEventsForManagement();
    }
    
    // Setup add event form
    setupAddEventForm();
});