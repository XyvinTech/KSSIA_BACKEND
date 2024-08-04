const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        to: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true 
        },
        subject: { type: String, required: true },
        content: { type: String, required: true },
        upload_url: { type: String },
        upload_file_url: { type: String },
        url: { type: String },
        type: { type: Boolean },
        sent_status: { type: Boolean, default: false },
        sent_at: { type: Date },
        recived_status: { type: Boolean, default: false },
        read_status: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
);

const notification = mongoose.model("Notification", notificationSchema);

module.exports = notification;