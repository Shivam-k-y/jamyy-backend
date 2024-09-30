import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

// Establish a connection to the Socket.IO server
const Socket = io('http://localhost:3000'); // Connect to the server


const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');

// Step 2: Listen for form submission and send the message to the server
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        Socket.emit('message', input.value); // Emit the message
        input.value = ''; // Clear the input field
    }
});

// Step 3: Listen for 'chat message' event from the server and display the message
Socket.on('message', (msg, socketId) => {
    const item = document.createElement('div');
    item.className = 'message-item'; // Add a class for styling

    // Create a span for the message
    const messageContent = document.createElement('span');
    messageContent.className = 'message-content'; // Add a class for styling
    messageContent.textContent = msg;

    // Create a div for the socket ID
    const idContainer = document.createElement('div');
    idContainer.className = 'id-container'; // Add a class for styling

    const idContent = document.createElement('span');
    idContent.className = 'socket-id'; // Add a class for styling
    idContent.textContent = `(ID: ${socketId})`;

    // Append the ID to its container
    idContainer.appendChild(idContent);

    // Check if the message is from the current client
    if (Socket.id !== socketId) {
        // This is the current user's message
        item.classList.add('my-message'); // Add a class for styling
        item.appendChild(messageContent); // Add message content to item
        item.appendChild(idContainer); // Add ID container to item
    } else {
        // This is another user's message
        item.classList.add('other-message'); // Add a class for styling
        item.appendChild(idContainer); // Add ID container to item first
        item.appendChild(messageContent); // Add message content to item
    }

    // Append the item to the messages list
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight); // Scroll to the bottom
});



const userc = document.getElementById('usercount');
const welcomeMessage = document.getElementById('welcomeMessage');

// Listen for 'newUserconnect' event
Socket.on('newUserconnect', ({ message, user }) => {
    // Always show the welcome message when a new user connects
    if (message) {
        welcomeMessage.textContent = message; // Display the welcome message
    }

    // Show the current user count immediately, if available
    if (user !== undefined) {
        // Use setTimeout to delay updating the user count display by 3 seconds
        setTimeout(() => {
            userc.textContent = `Current Users: ${user}`; // Update user count display after 3 seconds
        }, 2000); // 2000 milliseconds = 2 seconds
    }
});

// Listen for the 'disconnect' event when the client is disconnected
Socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});

