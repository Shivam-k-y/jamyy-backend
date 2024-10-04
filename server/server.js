import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from 'url';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        allowedHeaders: '*'
    }
});

// Set __dirname to the current directory since we are using ESM (ES6 modules)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, './public')));

let users_count = [
    {
        roomID: "gh",
        user: 2
    },
];

// Listen for Socket.IO connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Store the room the user joins
    let currentRoom = null;

    // Handle joining a room
    socket.on('joinRoom', (roomName) => {
        // Check if the room exists
        let roomExists = users_count.find((room) => room.roomID === roomName);

        if (!roomExists) {
            // Create a new room if it doesn't exist
            roomExists = {
                roomID: roomName,
                user: 0
            };
            users_count.push(roomExists);
        }

        roomExists.user++;
        currentRoom = roomName; // Store the room for later use
        socket.join(roomName); // Join the specified room
        console.log(`${socket.id} joined room: ${roomName}`);

        // Notify the user
        socket.emit('message', { msg: `Welcome to room: ${roomName}`, socketId: socket.id });

        // Notify others in the room
        socket.to(roomName).emit('message', { msg: `${socket.id} has joined the room`, socketId: socket.id });

        // Emit a welcome message to the newly connected user with the user count
        socket.emit('newUserconnect', { message: 'Hi! Welcome Dear', user: roomExists.user });

        // Emit the current user count only to the users in this room
        io.to(roomName).emit('newUserconnect', { user: roomExists.user });
    });

    // Listen for messages from the client
    socket.on('message', ({ room, message }) => {
        // Emit the message to the room
        io.to(room).emit('message', { msg: message, socketId: socket.id });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        if (currentRoom) {
            if (room) {
                room.user--;

                // Emit the updated user count to the room
                io.to(currentRoom).emit('newUserconnect', { user: room.user });
            }
        }
    });
});

// print the user count
app.get('/users', (req, res) => {
    res.json(users_count);
});


// Start the server
httpServer.listen(3000, '0.0.0.0', () => {
    console.log('Server listening on port 3000');
});

