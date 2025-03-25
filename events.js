// Function to load XML file and process events
function loadEvents(callback, params = {}) {
    // Determine which XML file to load based on the page type
    let xmlFile = 'upcoming-events.xml';
    
    if (params.eventType === 'past') {
        xmlFile = 'past-events.xml';
    } else if (params.eventType === 'all') {
        // Load both files for pages that need all events
        loadBothEventFiles(callback, params);
        return;
    }
    
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            const events = parseXmlEvents(this.responseXML);
            callback(events, params);
        }
    };
    xhr.open("GET", xmlFile, true);
    xhr.send();
}

// Function to load both event files and combine them
function loadBothEventFiles(callback, params = {}) {
    let upcomingEvents = [];
    let pastEvents = [];
    let filesLoaded = 0;
    
    // Load upcoming events
    const xhrUpcoming = new XMLHttpRequest();
    xhrUpcoming.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            upcomingEvents = parseXmlEvents(this.responseXML);
            filesLoaded++;
            if (filesLoaded === 2) {
                // Both files loaded, combine and callback
                const allEvents = [...upcomingEvents, ...pastEvents];
                callback(allEvents, params);
            }
        }
    };
    xhrUpcoming.open("GET", "upcoming-events.xml", true);
    xhrUpcoming.send();
    
    // Load past events
    const xhrPast = new XMLHttpRequest();
    xhrPast.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            pastEvents = parseXmlEvents(this.responseXML);
            filesLoaded++;
            if (filesLoaded === 2) {
                // Both files loaded, combine and callback
                const allEvents = [...upcomingEvents, ...pastEvents];
                callback(allEvents, params);
            }
        }
    };
    xhrPast.open("GET", "past-events.xml", true);
    xhrPast.send();
}

// Function to parse XML data
function parseXmlEvents(xmlDoc) {
    const eventNodes = xmlDoc.getElementsByTagName("event");
    const events = [];
    
    for (let i = 0; i < eventNodes.length; i++) {
        const event = eventNodes[i];
        events.push({
            id: parseInt(event.getElementsByTagName("id")[0].textContent),
            title: event.getElementsByTagName("title")[0].textContent,
            date: event.getElementsByTagName("date")[0].textContent,
            location: event.getElementsByTagName("location")[0].textContent,
            description: event.getElementsByTagName("description")[0].textContent,
            image: event.getElementsByTagName("image")[0].textContent,
            department: event.getElementsByTagName("department")[0].textContent
        });
    }
    
    return events;
}

// Function to format date
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

// Function to create event card HTML
function createEventCard(event, isPast) {
    return `
        <div class="event-card ${isPast ? 'past-event' : ''}">
            <div class="event-img" style="background-image: url('${event.image}')"></div>
            <div class="event-info">
                <div class="event-date">${formatDate(event.date)}</div>
                <h3 class="event-title">${event.title}</h3>
                <div class="event-location">📍 ${event.location}</div>
                <p class="event-desc">${event.description}</p>
                <a href="event-details.html?id=${event.id}" class="event-link">Learn More</a>
            </div>
        </div>
    `;
}

// Function to populate events on homepage (limit to 2 events each)
function populateHomeEvents(eventsData) {
    const upcomingGrid = document.getElementById('upcoming-events-grid');
    const pastGrid = document.getElementById('past-events-grid');
    const now = new Date();
    
    if (!upcomingGrid || !pastGrid) return; // Not on homepage
    
    let upcomingEvents = [];
    let pastEvents = [];
    
    eventsData.forEach(event => {
        const eventDate = new Date(event.date);
        if (eventDate > now) {
            upcomingEvents.push(event);
        } else {
            pastEvents.push(event);
        }
    });
    
    // Sort upcoming events by date (nearest first)
    upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    // Sort past events by date (most recent first)
    pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Limit to 2 events for homepage
    upcomingEvents = upcomingEvents.slice(0, 3);
    pastEvents = pastEvents.slice(0, 3);
    
    // Populate upcoming events
    upcomingGrid.innerHTML = '';
    if (upcomingEvents.length > 0) {
        upcomingEvents.forEach(event => {
            upcomingGrid.innerHTML += createEventCard(event, false);
        });
    } else {
        upcomingGrid.innerHTML = '<p>No upcoming events at this time. Check back soon!</p>';
    }
    
    // Populate past events
    pastGrid.innerHTML = '';
    if (pastEvents.length > 0) {
        pastEvents.forEach(event => {
            pastGrid.innerHTML += createEventCard(event, true);
        });
    } else {
        pastGrid.innerHTML = '<p>No past events to display.</p>';
    }
}

// Function to populate all upcoming events page
function populateAllUpcomingEvents(eventsData) {
    const eventsGrid = document.getElementById('all-upcoming-events-grid');
    if (!eventsGrid) return; // Not on upcoming events page
    
    // Upcoming events are already loaded from upcoming-events.xml
    // Sort upcoming events by date (nearest first)
    eventsData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    eventsGrid.innerHTML = '';
    if (eventsData.length > 0) {
        eventsData.forEach(event => {
            eventsGrid.innerHTML += createEventCard(event, false);
        });
    } else {
        eventsGrid.innerHTML = '<p>No upcoming events at this time. Check back soon!</p>';
    }
}

// Function to populate all past events page
function populateAllPastEvents(eventsData) {
    const eventsGrid = document.getElementById('all-past-events-grid');
    if (!eventsGrid) return; // Not on past events page
    
    // Past events are already loaded from past-events.xml
    // Sort past events by date (most recent first)
    eventsData.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    eventsGrid.innerHTML = '';
    if (eventsData.length > 0) {
        eventsData.forEach(event => {
            eventsGrid.innerHTML += createEventCard(event, true);
        });
    } else {
        eventsGrid.innerHTML = '<p>No past events to display.</p>';
    }
}

// Function to populate department events page
function populateDepartmentEvents(eventsData, params) {
    const upcomingGrid = document.getElementById('dept-upcoming-events-grid');
    const pastGrid = document.getElementById('dept-past-events-grid');
    const deptHeading = document.getElementById('department-heading');
    
    if (!upcomingGrid || !pastGrid) return; // Not on department page
    
    const department = params.department;
    if (deptHeading) {
        deptHeading.textContent = `${department} Department Events`;
    }
    
    const now = new Date();
    const departmentEvents = eventsData.filter(event => event.department === department);
    
    const upcomingEvents = departmentEvents.filter(event => new Date(event.date) > now);
    const pastEvents = departmentEvents.filter(event => new Date(event.date) < now);
    
    // Sort upcoming events by date (nearest first)
    upcomingEvents.sort((a, b) => new Date(a.date) - new Date(b.date));
    // Sort past events by date (most recent first)
    pastEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Populate upcoming events
    upcomingGrid.innerHTML = '';
    if (upcomingEvents.length > 0) {
        upcomingEvents.forEach(event => {
            upcomingGrid.innerHTML += createEventCard(event, false);
        });
    } else {
        upcomingGrid.innerHTML = `<p>No upcoming events for ${department} at this time. Check back soon!</p>`;
    }
    
    // Populate past events
    pastGrid.innerHTML = '';
    if (pastEvents.length > 0) {
        pastEvents.forEach(event => {
            pastGrid.innerHTML += createEventCard(event, true);
        });
    } else {
        pastGrid.innerHTML = `<p>No past events for ${department} to display.</p>`;
    }
}

// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to handle event detail page
function populateEventDetails(eventsData) {
    const eventId = parseInt(getUrlParameter('id'));
    if (!eventId) return; // No event ID specified
    
    const event = eventsData.find(e => e.id === eventId);
    if (!event) {
        document.body.innerHTML = `<div class="error-container">
            <h1>Event Not Found</h1>
            <p>The requested event could not be found.</p>
            <a href="index.html">Return to Homepage</a>
        </div>`;
        return;
    }
    
    // Populate event details
    document.getElementById('eventTitle').textContent = event.title;
    document.getElementById('eventVenue').textContent = event.location;
    document.getElementById('eventDate').textContent = formatDate(event.date).split('at')[0]; // Just the date part
    document.getElementById('eventTime').textContent = formatDate(event.date).split('at')[1]; // Just the time part
    document.getElementById('eventPlace').textContent = event.department + ' Department';
    document.getElementById('eventDescription').textContent = event.description;
    
    // Set image if available
    const eventImage = document.getElementById('eventImage');
    if (eventImage) {
        eventImage.src = event.image;
        eventImage.alt = event.title;
    }
    
    // Update page title
    document.title = `${event.title} - XIMConnect`;
}

// Initialize page based on current URL
function initPage() {
    const currentPath = window.location.pathname;
    
    if (currentPath.includes('upcoming-events.html')) {
        loadEvents(populateAllUpcomingEvents, { eventType: 'upcoming' });
    } else if (currentPath.includes('past-events.html')) {
        loadEvents(populateAllPastEvents, { eventType: 'past' });
    } else if (currentPath.includes('department.html')) {
        const department = getUrlParameter('dept');
        if (department) {
            loadEvents(populateDepartmentEvents, { department: department, eventType: 'all' });
        }
    } else if (currentPath.includes('event-details.html')) {
        loadEvents(populateEventDetails, { eventType: 'all' });
    } else {
        // Assume it's the homepage
        loadEvents(populateHomeEvents, { eventType: 'all' });
    }
}

// Run initialization when DOM is fully loaded
document.addEventListener('DOMContentLoaded', initPage);