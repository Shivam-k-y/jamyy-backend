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

// Add body-parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let data = [];
let deleted_rooms = [];
let blocked_users = [];
let banned_users = new Map(); // Map to store banned users and their ban expiration time
let users_count = [
    {
        roomID: "gh",
        user: 2,
        users: [
            { userId: "123", ip: "192.168.0.1" },
        ]
    },
];

// Middleware to check if a user is banned
const checkBan = (req, res, next) => {
    const ip = req.ip;
    if (banned_users.has(ip)) {
        const banExpiration = banned_users.get(ip);
        if (Date.now() < banExpiration) {
            return res.status(403).json({ message: "You are temporarily banned from the chat." });
        } else {
            banned_users.delete(ip);
        }
    }
    next();
};

app.use(checkBan);


app.get('/generate-token', (req, res) => {
    const token = generate_token(user_id, res);
});

// print the user count
app.get('/users', (req, res) => {
    // Return the users_count array with userids and their ips
    res.json([]);
});

// get data
app.get('/data', (req, res) => {
    res.json(data);
});

// Route to delete a room and kick out all users
app.delete('/destroy-room/:roomName', (req, res) => {
    const roomName = req.params.roomName;

    // Find the room in the users_count array
    const roomIndex = users_count.findIndex((room) => room.roomID === roomName);

    if (roomIndex === -1) {
        return res.status(404).json({ message: "Room not found" });
    }

    // Notify users in the room that the room is closing
    io.to(roomName).emit('message', { msg: `Room ${roomName} has been closed, you have been disconnected.` });

    // Remove all users from the room
    io.socketsLeave(roomName);

    // Remove the room from the users_count array
    users_count.splice(roomIndex, 1);

    res.json({ message: `Room ${roomName} deleted and all users kicked out.` });

    // Push the deleted room in deleted_rooms
    deleted_rooms.push(roomName);
});

// Revive room
app.post('/revive-room/:roomName', (req, res) => {
    deleted_rooms = deleted_rooms.filter((room) => room !== req.params.roomName);
    res.json({ message: `Room ${req.params.roomName} revived.` });
});

// Block user by socket ID
app.post('/block-user/:userId', (req, res) => {
    const userId = req.params.userId;

    // Add user to blocked users list
    blocked_users.push(userId);

    // Disconnect the user by socket ID
    const socket = io.sockets.sockets.get(userId);
    if (socket) {
        socket.disconnect(true); // Force disconnect the user
        console.log(`User ${userId} has been blocked and disconnected.`);
    }

    res.json({ message: `User ${userId} blocked and disconnected.` });
});

// New route to ban a user
app.post('/ban-user', (req, res) => {
    try {
        const { ip, duration } = req.body;
        if (!ip || !duration) {
            return res.status(400).json({ message: "IP and duration are required" });
        }
        const banExpiration = Date.now() + duration * 60 * 1000;
        banned_users.set(ip, banExpiration);


        // Disconnect the user by IP address
        const userId = users_count.find((room) => room.users.find((user) => user.ip === ip)).users[0].userId;
        const socket = io.sockets.sockets.get(userId);
        if (socket) {
            socket.disconnect(true); // Force disconnect the user
            console.log(`User ${userId} has been blocked and disconnected.`);
        }
        res.json({ message: `User with IP ${ip} has been banned for ${duration} minutes.` });
    } catch (error) {
        console.error('Error in ban-user route:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Set __dirname to the current directory since we are using ESM (ES6 modules)
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, './public')));

app.use(express.json());
// To handle cookies
app.use(cookieParser());

// Listen for Socket.IO connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    const ip = socket.handshake.address;
    console.log("User's IP:", ip);

    // Check if the user is banned
    if (banned_users.has(ip)) {
        const banExpiration = banned_users.get(ip);
        if (Date.now() < banExpiration) {
            socket.emit('banned', { message: "You are temporarily banned from the chat." });
            socket.disconnect(true);
            return;
        } else {
            banned_users.delete(ip);
        }
    }

    // Store the room the user joins
    let currentRoom = null;

    // Handle joining a room
    socket.on('joinRoom', (roomName) => {

        // Check ban status again when joining a room
        if (banned_users.has(ip)) {
            const banExpiration = banned_users.get(ip);
            if (Date.now() < banExpiration) {
                socket.emit('banned', { message: "You are temporarily banned from the chat." });
                socket.disconnect(true);
                return;
            } else {
                banned_users.delete(ip);
            }
        }

        // Check if the user is blocked
        if (blocked_users.includes(socket.id)) {
            socket.emit('message', { msg: `You are blocked and cannot join room: ${roomName}.` });
            socket.disconnect(); // Disconnect blocked user immediately
            return;
        }

        // Check if the room is deleted
        let roomDeleted = deleted_rooms.find((room) => room === roomName);

        if (roomDeleted) {
            // Notify the user
            socket.emit('message', { msg: `Room ${roomName} has been closed, you have been disconnected.` });
            return;
        } else {
            // Check if the room exists
            let roomExists = users_count.find((room) => room.roomID === roomName);

            if (!roomExists) {
                // Create a new room if it doesn't exist
                roomExists = {
                    roomID: roomName,
                    user: 0,
                    users: [],
                };
                users_count.push(roomExists);
            }

            roomExists.user++;
            //Add user details in the users_count array
            roomExists.users.push({ userId: socket.id, ip: ip });

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
        }
    });

    // Listen for messages from the client
    socket.on('message', ({ room, message }) => {
        // Emit the message to the room
        io.to(room).emit('message', { msg: message, socketId: socket.id });

        // Push the data in data
        data.push({ room: room, message: message, socketId: socket.id });
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

// Start the server
httpServer.listen(3000, '0.0.0.0', () => {
    console.log('Server listening on port 3000');
});
