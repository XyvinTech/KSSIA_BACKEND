const mongoose = require("mongoose");

const ChatThreadSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  lastMessage: [{ type: mongoose.Schema.Types.ObjectId, ref: "Message" }],
  unreadCount: { type: Map, of: Number, default: {} }, // Keeps track of unread messages for each participant
}, {
    timestamps: true,
});


const ChatThread = mongoose.model("ChatThread", ChatThreadSchema);
module.exports = ChatThread;
