require("dotenv").config();
const path = require('path');
const responseHandler = require("../helpers/responseHandler");
const Message = require("../models/messages");
const ChatThread = require("../models/chats");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");

/****************************************************************************************************/
/*                                   Function to send a message                                     */
/****************************************************************************************************/
exports.sendMessage = async (req, res) => {
    const { from, to, content } = req.body;

    // Handle file upload if present
    let attachments = [];
    const bucketName = process.env.AWS_S3_BUCKET;
    if (req.files && req.files.length > 0) {
        try {
            for (const file of req.files) {
                const url = await handleFileUpload(file, bucketName);
                attachments.push({
                    fileType: file.mimetype,
                    url: url
                });
            }
        } catch (err) {
            return responseHandler(res, 500, `Error uploading file: ${err.message}`);
        }
    }

    try {
        // Create and save a new message
        const newMessage = new Message({
            from,
            to,
            content,
            attachments,
            status: 'sent',
        });
        await newMessage.save();

        // Find or create the chat thread
        let chatThread = await ChatThread.findOne({
            participants: { $all: [from, to] }
        });

        if (!chatThread) {
            chatThread = new ChatThread({
                participants: [from, to],
                lastMessage: newMessage._id,
                unreadCount: {
                    [to]: 1
                }
            });
        } else {
            chatThread.lastMessage = newMessage._id;
            chatThread.unreadCount.set(to, (chatThread.unreadCount.get(to) || 0) + 1);
        }

        await chatThread.save();

        return responseHandler(res, 201, "Message sent successfully!", newMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        return responseHandler(res, 500, 'Internal Server Error');
    }
};


exports.getMessagesBetweenUsers = async (req, res) => {
    const { userId1, userId2 } = req.params;

    try {
        const messages = await Message.find({
            $or: [
                { from: userId1, to: userId2 },
                // { from: userId2, to: userId1 },
            ],
        }).sort({ timestamp: 1 });

        // Mark messages as seen
        await Message.updateMany(
            { from: userId2, to: userId1, status: { $ne: 'seen' } },
            { status: 'seen' }
        );

        // Reset unread count in chat thread
        await ChatThread.updateOne(
            { participants: { $all: [userId1, userId2] } },
            { $set: { [`unreadCount.${userId1}`]: 0 } }
        );

        return responseHandler(res, 200, "Messages retrieved successfully!", messages);
    } catch (error) {
        console.error('Error retrieving messages:', error);
        return responseHandler(res, 500, 'Internal Server Error');
    }
};



exports.getChatThreads = async (req, res) => {
    const { userId } = req.params;
    try {
        const chatThreads = await ChatThread.find({ participants: userId })
            .populate('participants', 'username profilePicture')
            .populate('lastMessage')
            .exec();

        return responseHandler(res, 200, "Chat threads retrieved successfully!", chatThreads);
    } catch (error) {
        console.error('Error retrieving chat threads:', error);
        return responseHandler(res, 500, 'Internal Server Error');
    }
};


exports.markMessagesAsSeen = async (req, res) => {
    const { userId, otherUserId } = req.params;

    try {
        await Message.updateMany(
            {
                from: otherUserId,
                to: userId,
                status: { $ne: 'seen' }
            },
            { status: 'seen' }
        );

        await ChatThread.updateOne(
            { participants: { $all: [userId, otherUserId] } },
            { $set: { [`unreadCount.${userId}`]: 0 } }
        );

        return responseHandler(res, 200, "Messages marked as seen!");
    } catch (error) {
        console.error('Error marking messages as seen:', error);
        return responseHandler(res, 500, 'Internal Server Error');
    }
};



exports.deleteMessage = async (req, res) => {
    const { messageId } = req.params;

    try {
        const message = await Message.findByIdAndDelete(messageId);
        if (!message) {
            return responseHandler(res, 404, "Message not found");
        }

        // If the message has attachments, delete them from S3
        const bucketName = process.env.AWS_S3_BUCKET;
        if (message.attachments && message.attachments.length > 0) {
            for (const attachment of message.attachments) {
                let oldFileKey = path.basename(attachment.url);
                await deleteFile(bucketName, oldFileKey);
            }
        }

        // Update chat thread if the deleted message was the last message
        const chatThread = await ChatThread.findOne({ lastMessage: messageId });
        if (chatThread) {
            // Fetch the previous message in the thread
            const previousMessage = await Message.findOne({
                $or: [
                    { from: chatThread.participants[0], to: chatThread.participants[1] },
                    { from: chatThread.participants[1], to: chatThread.participants[0] },
                ]
            }).sort({ timestamp: -1 });

            chatThread.lastMessage = previousMessage ? previousMessage._id : null;
            await chatThread.save();
        }

        return responseHandler(res, 200, "Message deleted successfully!");
    } catch (err) {
        console.error('Error deleting message:', err);
        return responseHandler(res, 500, `Error deleting message: ${err.message}`);
    }
};




exports.deleteAllMessagesOfUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await Message.deleteMany({
            $or: [
                { from: userId },
                { to: userId }
            ]
        });

        // Remove chat threads involving the user
        await ChatThread.deleteMany({
            participants: userId
        });

        return responseHandler(res, 200, `Deleted ${result.deletedCount} messages successfully!`);
    } catch (error) {
        console.error('Error deleting messages:', error);
        return responseHandler(res, 500, 'Internal Server Error');
    }
};

