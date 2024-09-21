const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    attachments: [
        {
            fileType: { type: String, required: false },
            url: { type: String, required: false },
        }
    ],
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: false },
    requirement: { type: mongoose.Schema.Types.ObjectId, ref: 'Requirements', required: false },
    status: { type: String, enum: ['sent', 'delivered', 'seen'], default: 'sent' },
    timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);
module.exports = Message;
