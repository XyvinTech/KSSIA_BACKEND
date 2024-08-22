const http = require("http");
const { Server } = require("socket.io");
const express = require("express");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://43.205.89.79"],
    methods: ["GET", "POST"],
  },
});
// Use a namespace for your chat
const chatNamespace = io.of("/api/v1/chats");

// Map to store user IDs and their corresponding socket IDs
const userSocketMap = {}; // {userId: socketId}

// Function to get the receiver's socket ID based on user ID
const getReceiverSocketId = (receiverId) => {
  return userSocketMap[receiverId];
};

// Socket.io connection event
chatNamespace.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId && userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} mapped to socket ${socket.id}`);
  }

  // Emit online users to all connected clients
  chatNamespace.emit("getOnlineUsers", Object.keys(userSocketMap));

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    delete userSocketMap[userId];
    chatNamespace.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// Export the server and io instances
module.exports = { app, server, io, getReceiverSocketId };
