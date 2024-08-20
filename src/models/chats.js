const mongoose = require('mongoose');

const ChatThreadSchema = new mongoose.Schema({
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }],
    lastMessage: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: false }],
    unreadCount: { type: Map, of: Number, default: {} }, // Keeps track of unread messages for each participant
    createdAt: { type: Date, default: Date.now }
});

const ChatThread = mongoose.model('ChatThread', ChatThreadSchema);
module.exports = ChatThread;
