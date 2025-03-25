// Contact Form XML Storage Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Collect form data
        const name = document.getElementById('contact-name').value;
        const email = document.getElementById('contact-email').value;
        const message = document.getElementById('contact-message').value;
        
        // Create XML entry
        const contactEntry = createContactXML(name, email, message);
        
        // Save to XML file
        saveContactToXML(contactEntry);
        
        // Optional: Show success message
        alert('Your message has been submitted successfully!');
        contactForm.reset();
    });
    
    function createContactXML(name, email, message) {
        const timestamp = new Date().toISOString();
        return `
        <contact>
            <id>${generateUniqueId()}</id>
            <name>${escapeXml(name)}</name>
            <email>${escapeXml(email)}</email>
            <message>${escapeXml(message)}</message>
            <timestamp>${timestamp}</timestamp>
        </contact>
        `;
    }
    
    function saveContactToXML(newContactXml) {
        // In a real-world scenario, this would typically be done server-side
        // This is a client-side simulation
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/save-contact', true);
        xhr.setRequestHeader('Content-Type', 'application/xml');
        xhr.send(newContactXml);
    }
    
    function generateUniqueId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    function escapeXml(unsafe) {
        return unsafe.replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case '\'': return '&apos;';
                case '"': return '&quot;';
            }
        });
    }
});