const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        to: { 
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" 
        },
        subject: { type: String },
        content: { type: String },
        upload_url: { type: String },
        upload_file_url: { type: String },
        url: { type: String },
        type: { type: Boolean },
        read_status: { type: Boolean, default: false }
    },
    {
        timestamps: true
    }
);

const notification = mongoose.model("Products", notificationSchema);

module.exports = notification;