// RoomManager.js
class RoomManager {
  constructor(io) {
    this.io = io;
    this.rooms = {}; // Store room data
    this.history_chat = {}; // Store chat messages
  }

  createRoom(socket, roomID, user_id, user_name) {
    socket.user_id = user_id; // Store the user ID in the socket object
    socket.user_name = user_name; // Store the user name in the socket object
    if (this.rooms[roomID]) {
      socket.emit('room-exists', roomID);
      return;
    }
    this.rooms[roomID] = [{ Socket_id: socket.id, Socket_userId: user_id, Socket_userName: user_name }];
    this.history_chat[roomID] = []; // Initialize chat history for the room
    socket.join(roomID);
    socket.emit('room-created', roomID);
  }

  joinRoom(socket, roomID, user_id, user_name) {
    socket.user_id = user_id;
    socket.user_name = user_name;
    if (this.rooms[roomID]) {
      // Disconnect all previous sockets with the same user_id
      const previousSockets = this.rooms[roomID].filter(
        (user) => user.Socket_userId === user_id
      );

      previousSockets.forEach((user) => {
        const previousSocket = this.io.sockets.sockets.get(user.Socket_id);
        if (previousSocket) {
          previousSocket.emit('forced-disconnect');
          previousSocket.disconnect();
        }
      });

      // Remove all previous connections of the same user_id from the room
      this.rooms[roomID] = this.rooms[roomID].filter(
        (user) => user.Socket_userId !== user_id
      );

      // Add the new connection for the user
      this.rooms[roomID].push({ Socket_id: socket.id, Socket_userId: user_id, Socket_userName: user_name });
      socket.join(roomID);
      socket.emit('room-joined', roomID);
      socket.to(roomID).emit('user-connected', { Socket_id: socket.id, Socket_userName: user_name });
      socket.emit('all-users', this.rooms[roomID].filter((user) => user.Socket_id !== socket.id));

      // Send the chat history to the user
      socket.emit('chat-history', this.history_chat[roomID]);
    } else {
      socket.emit('room-not-found', roomID);
    }
  }

  leaveRoom(socket, roomID) {
    if (this.rooms[roomID]) {
      this.rooms[roomID] = this.rooms[roomID].filter(
        (user) => user.Socket_id !== socket.id
      );
      socket.leave(roomID);
      socket.to(roomID).emit('user-left', { Socket_id: socket.id, Socket_userName: socket.user_name }); // Notify others that the user left

      // If no users are left in the room, delete the room and its chat history
      if (this.rooms[roomID].length === 0) {
        delete this.rooms[roomID];
        delete this.history_chat[roomID];
      }
    }
  }

  handleDisconnect(socket) {
    for (const roomID in this.rooms) {
      this.leaveRoom(socket, roomID);
    }
  }

  handleSignalingEvent(event, data) {
    // Forward all signaling data as 'signal' event
    this.io.to(data.target).emit('signal', { ...data, sender: data.sender });
  }

  // New method to handle chat messages
  handleChatMessage(socket, roomID, message) {
    if (this.rooms[roomID]) {
      // Broadcast the message to everyone in the room except the sender
      socket.to(roomID).emit('chat-message', { sender: socket.user_name, senderId: socket.user_id, message });

      // Save the message in the room's chat history
      this.history_chat[roomID].push({ sender: socket.user_name, senderId: socket.user_id, message, timestamp: new Date() });
    } else {
      socket.emit('room-not-found', roomID);
    }
  }
}

module.exports = RoomManager;
