import { io } from "https://cdn.socket.io/4.7.5/socket.io.esm.min.js";

// Establish a connection to the Socket.IO server
const Socket = io('http://localhost:3000'); // Connect to the server

const name = prompt("what is your name");

// Listen for the 'welcome' event from the server
Socket.on('welcome', (message) => {
    console.log(message); // Logs the welcome message sent from the server
});

// Emit a 'message' event to the server
Socket.emit('message', `Hello, my name is ${name}`);

// Listen for the 'disconnect' event when the client is disconnected
Socket.on('disconnect', () => {
    console.log('Disconnected from the server');
});

