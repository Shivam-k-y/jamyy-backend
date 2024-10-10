import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import generate_token from './jsonwebtoken.js';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        allowedHeaders: '*'
    }
});


let data = []

app.get('/generate-token', (req, res) => {
    const token = generate_token(user_id, res);
});

// get data
app.get('/data', (req, res) => {
    res.json(data);
});


// Set __dirname to the current directory since we are using ESM (ES6 modules)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, './public')));

app.use(express.json());
// To handling the cookies
app.use(cookieParser());

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
        socket.emit('newUserconnect', { message: 'Hi! Welcome To Anonymous Chat Room', user: roomExists.user });

        // Emit the current user count only to the users in this room
        io.to(roomName).emit('newUserconnect', { user: roomExists.user });
    });

    // Listen for messages from the client
    socket.on('message', ({ room, message }) => {
        // Emit the message to the room
        io.to(room).emit('message', { msg: message, socketId: socket.id });

        // Push the data in data
        data.push({ room: room, message: message, socketId: socket.id })
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        if (currentRoom) {
            let room = users_count.find((room) => room.roomID === currentRoom);
            if (room) {
                room.user--;

                io.to(currentRoom).emit('message', { msg: `${socket.id} has left the room`, socketId: socket.id });


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

