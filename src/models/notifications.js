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
        type: { type: String, enum: ['email', 'in-app'], required: true },
        readBy: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }]
    },
    {
        timestamps: true
    }
);

notificationSchema.index({ to: 1, type: 1 });

notificationSchema.statics.countUnread = function (userId) {
    return this.countDocuments({ to: userId, readBy: { $ne: userId }, type: 'in-app' });
};

notificationSchema.methods.markAsRead = function (userId) {
    if (!this.readBy.includes(userId)) {
        this.readBy.push(userId);
        return this.save();
    }
    return Promise.resolve(this); // Return the existing document if no change was made.
};

const Notification = mongoose.model("Notification", notificationSchema);

module.exports = Notification;