// Import required modules and set up your environment
import express from 'express';
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: ['http://localhost:5173', 'http://localhost:5174', 'https://jamyy-client.onrender.com', 'https://spyboysg.com', 'https://www.spyboysg.com'],
        credentials: true,
    }
});

// Middleware configuration
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'https://jamyy-client.onrender.com', 'https://spyboysg.com', 'https://www.spyboysg.com'],
    credentials: true,
};
app.use(cors(corsOptions));

let data = {};
let deleted_rooms = [];
let blocked_users = [];
let banned_users = new Map(); // Store banned users with ban expiration time
let users_count = [
    {
        roomID: "gh",
        user: 2,
        users: [
            { userId: "123", token: "someToken" },
        ]
    },
];

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Middleware to check if a user is banned
const checkBan = (req, res, next) => {
    const token = req.cookies.token;
    if (token && banned_users.has(token)) {
        const banExpiration = banned_users.get(token);
        if (Date.now() < banExpiration) {
            return res.status(403).json({ message: "You are temporarily banned from the chat." });
        } else {
            banned_users.delete(token);
        }
    }
    next();
};

app.use(checkBan);

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1d' });
};

// Verify JWT token
const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};

// Endpoint to generate and set JWT token in the cookie
app.get('/generate-token', (req, res) => {
    if (!req.cookies.token) {
        const userId = Math.random().toString(36).slice(2, 11);
        const token = generateToken(userId);
        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            secure: process.env.NODE_ENV === 'production', // Send the cookie only over HTTPS when in production
            sameSite: 'None', // Required for cross-origin requests
        });
        res.json({ message: "Token generated and set in cookie", token });
    } else {
        res.json({ message: "Token already exists" });
    }
});

// Get users count
app.get('/users', (req, res) => {
    res.json(users_count);
});

// Get all stored messages
app.get('/data', (req, res) => {
    try {
        // send data to the client
        res.json(data);
    }
    catch (error) {
        console.error('Error in get data route:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Delete a room and kick out all users
app.delete('/destroy-room/:roomName', (req, res) => {
    const roomName = req.params.roomName;
    const roomIndex = users_count.findIndex((room) => room.roomID === roomName);

    if (roomIndex === -1) {
        return res.status(404).json({ message: "Room not found" });
    }

    io.to(roomName).emit('message', { msg: `Room ${roomName} has been closed, you have been disconnected.` });
    io.socketsLeave(roomName);
    users_count.splice(roomIndex, 1);
    res.json({ message: `Room ${roomName} deleted and all users kicked out.` });
    deleted_rooms.push(roomName);
});

// Revive a deleted room
app.post('/revive-room/:roomName', (req, res) => {
    deleted_rooms = deleted_rooms.filter((room) => room !== req.params.roomName);
    res.json({ message: `Room ${req.params.roomName} revived.` });
});

// Block a user by user ID
app.post('/block-user/:userId', (req, res) => {
    const userId = req.params.userId;
    blocked_users.push(userId);
    const socket = io.sockets.sockets.get(userId);
    if (socket) {
        socket.disconnect(true);
        console.log(`User ${userId} has been blocked and disconnected.`);
    }
    res.json({ message: `User ${userId} blocked and disconnected.` });
});

// Ban a user using their user ID
app.post('/ban-user', (req, res) => {
    try {
        const { userId, duration } = req.body;
        // Duration in minutes
        if (!userId || !duration) {
            return res.status(400).json({ message: "User ID and duration are required" });
        }

        // Find the user by their userId and retrieve their token
        let userToken;
        users_count.forEach((room) => {
            const user = room.users.find(u => u.userId === userId);
            if (user) {
                userToken = user.token;
            }
        });

        if (!userToken) {
            return res.status(404).json({ message: "User not found" });
        }

        const banExpiration = Date.now() + duration * 60 * 1000;
        banned_users.set(userToken, banExpiration);

        // Disconnect the user by their userId
        // send ban event for user
        const socket = io.sockets.sockets.get(userId);
        socket.emit('banned', { message: "You are temporarily banned from the chat." });
        if (socket) {
            socket.disconnect(true);
            console.log(`User ${userId} has been banned and disconnected.`);
        }

        res.json({ message: `User with ID ${userId} has been banned for ${duration} minutes.` });
    } catch (error) {
        console.error('Error in ban-user route:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));
app.use(express.static(path.join(__dirname, './public')));

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);

    // Extract token from user's cookies
    const token = socket.handshake.headers.cookie?.split('; ').find(row => row.startsWith('token=')).split('=')[1];
    console.log("User's token:", token);

    // Check if the user is banned
    if (token && banned_users.has(token)) {
        const banExpiration = banned_users.get(token);
        if (Date.now() < banExpiration) {
            socket.emit('banned', { message: "You are temporarily banned from the chat." });
            socket.disconnect(true);
            return;
        } else {
            banned_users.delete(token);
        }
    }

    let currentRoom = null;

    socket.on('joinRoom', (roomName) => {
        const token = socket.handshake.headers.cookie?.split('; ').find(row => row.startsWith('token=')).split('=')[1];

        if (token && banned_users.has(token)) {
            const banExpiration = banned_users.get(token);
            if (Date.now() < banExpiration) {
                socket.emit('banned', { message: "You are temporarily banned from the chat." });
                socket.disconnect(true);
                return;
            } else {
                banned_users.delete(token);
            }
        }

        if (blocked_users.includes(socket.id)) {
            socket.emit('message', { msg: `You are blocked and cannot join room: ${roomName}.` });
            socket.disconnect();
            return;
        }

        let roomDeleted = deleted_rooms.find((room) => room === roomName);

        if (roomDeleted) {
            socket.emit('message', { msg: `Room ${roomName} has been closed, you have been disconnected.` });
            return;
        } else {
            let roomExists = users_count.find((room) => room.roomID === roomName);

            if (!roomExists) {
                roomExists = {
                    roomID: roomName,
                    user: 0,
                    users: [],
                };
                data[roomName] = [];
                users_count.push(roomExists);
            }

            roomExists.user++;
            roomExists.users.push({ userId: socket.id, token: token });

            currentRoom = roomName;
            socket.join(roomName);
            console.log(`${socket.id} joined room: ${roomName}`);

            socket.emit('message', { msg: `Welcome to room: ${roomName}`, socketId: socket.id });
            socket.to(roomName).emit('message', { msg: `${socket.id} has joined the room`, socketId: socket.id });
            socket.emit('newUserconnect', { message: 'Hi! Welcome To Anonymous Chat Room', user: roomExists.user });
            io.to(roomName).emit('newUserconnect', { user: roomExists.user });
        }
    });

    socket.on('message', ({ room, message, replyTo }) => {
        try {
            console.log(`Message received in room: ${room}, from socket: ${socket.id}, message: ${message}, replyTo: ${replyTo}`);
    
            // Store the message with replyTo information
            const newMessage = { id: uuidv4(),  msg: message, socketId: socket.id, replyTo: replyTo || null }; // Include replyTo if provided
            if (!data[room]) {
                data[room] = []; // Initialize room if it doesn't exist
            }
            data[room].push(newMessage);
    
            // Emit the message to all clients in the room, including replyTo information
            io.to(room).emit('message', newMessage);
        } catch (error) {
            console.error('Error storing message:', error);
        }
    });
    

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        if (currentRoom) {
            let roomExists = users_count.find((room) => room.roomID === currentRoom);
            if (roomExists) {
                roomExists.user--;
                roomExists.users = roomExists.users.filter(user => user.userId !== socket.id);

                if (roomExists.user <= 0) {
                    users_count = users_count.filter(room => room.roomID !== currentRoom);
                }
            }
            io.to(currentRoom).emit('newUserconnect', { user: roomExists ? roomExists.user : 0 });
        }
    });
});

// Server listening
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
