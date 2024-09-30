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

var user = 0;
// Listen for Socket.IO connections
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    user++;
    // Emit a welcome message to the newly connected user
    socket.emit('newUserconnect', { message: 'Hi! Welcome Dear', user: user }); // Send both message and user count

    // Emit the current user count to all clients except the new user
    socket.broadcast.emit('newUserconnect', { user: user }); // Send user count to all other users

    // Listen for custom events from the client
    socket.on('message', (data) => {
        console.log(`Message from client ${socket.id} :`, data);

        io.emit('message', data, socket.id);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        user--;
        // Emit the current user count to all clients except the new user
        socket.broadcast.emit('newUserconnect', { user: user }); // Send user count to all other users
    });
});

// Start the server
httpServer.listen(3000, () => {
    console.log('Server listening on port 3000');
});
