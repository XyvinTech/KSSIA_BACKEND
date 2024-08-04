const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        to: [{ 
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true 
        }],
        subject: { type: String, required: true },
        content: { type: String, required: true },
        media_url: { type: String },
        file_url: { type: String },
        link_url: { type: String },
        type: { type: String},
        sent_status: { type: Boolean, default: false },
        sent_at: { type: Date },
       
      
    },
    {
        timestamps: true
    }
);

const notification = mongoose.model("Notification", notificationSchema);

module.exports = notification;