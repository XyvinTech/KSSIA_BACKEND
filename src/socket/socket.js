const { Server } = require("socket.io");

const userSocketMap = {}; // { userId: socketId }

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: ["http://localhost:3000"],
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        const userId = socket.handshake.query.userId;
        if (userId && userId !== "undefined") {
            userSocketMap[userId] = socket.id;
            console.log(`User ${userId} mapped to socket ${socket.id}`);
        }

        // Emit the list of online users
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        // Message receiving and sending logic
        socket.on("sendMessage", (message) => {
            console.log("Message received:", message); // Log the incoming message

            const { to } = message; // Assuming you send 'to' field in the message
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("message", message); // Emit to the specific user
                console.log(`Message sent to ${to}:`, message);
            } else {
                console.log(`No socket found for user ${to}. Online users:`, Object.keys(userSocketMap));
            }
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            delete userSocketMap[userId];
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });

    return io;
}

function getReceiverSocketId(to) {
    return userSocketMap[to]; // Return the socket ID for the receiver
}

module.exports = { initializeSocket, getReceiverSocketId };
