// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const RoomManager = require('./RoomManager'); // Import RoomManager

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Serve static files from the 'public' directory
app.use(express.static('public'));

const roomManager = new RoomManager(io); // Create a new RoomManager instance

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Room management events
  socket.on('create-room', (roomID, user_id, user_name) => roomManager.createRoom(socket, roomID, user_id, user_name));
  socket.on('join-room', (roomID, user_id, user_name) => roomManager.joinRoom(socket, roomID, user_id, user_name));
  socket.on('disconnect', () => roomManager.handleDisconnect(socket));

  // Signaling events - unified as 'signal'
  socket.on('signal', (data) => roomManager.handleSignalingEvent('signal', { ...data, sender: socket.id }));

  // Chat message event
  socket.on('chat-message', ({ roomID, message }) => roomManager.handleChatMessage(socket, roomID, message));
});

server.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});
