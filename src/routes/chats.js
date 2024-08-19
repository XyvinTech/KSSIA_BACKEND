const express = require('express');
const chatController = require('../controllers/chatController');
const upload = require('../middlewares/uploads');
const asyncHandler = require("../utils/asyncHandler");
const authVerify = require('../middlewares/authVerify'); 
const chatRoute = express.Router();

chatRoute.post('/send', upload.array('attachments', 10), asyncHandler(chatController.sendMessage));
chatRoute.get('/messages/:userId1/:userId2', authVerify, asyncHandler(chatController.getMessagesBetweenUsers));
chatRoute.get('/threads/:userId', authVerify, asyncHandler(chatController.getChatThreads));
chatRoute.get('/notifications/:userId', authVerify, asyncHandler(chatController.getUnreadNotifications));
chatRoute.patch('/update-status', authVerify, asyncHandler(chatController.updateMessageStatus));
chatRoute.delete('/delete/:messageId', authVerify, asyncHandler(chatController.deleteMessage));
chatRoute.delete('/delete-all/:userId', authVerify, asyncHandler(chatController.deleteAllMessagesOfUser));

module.exports = chatRoute;
