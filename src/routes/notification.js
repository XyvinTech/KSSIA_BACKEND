const express = require("express");
const notificationController = require("../controllers/notificationController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const notificationRoute = express.Router();

// Protect all routes with authentication middleware
notificationRoute.use(authVerify);

notificationRoute.post('/notifications/email', asyncHandler(notificationController.saveEmail));
notificationRoute.get('/notifications/email', asyncHandler(notificationController.getUnsentEmails));

notificationRoute.post('/notifications/in-app', asyncHandler(notificationController.saveInApp));
notificationRoute.get('/notifications/in-app/unread', asyncHandler(notificationController.getUnreadNotifications));
notificationRoute.put('/notifications/in-app/read/:id', asyncHandler(notificationController.updateReadStatus));

notificationRoute.post('/notifications/send-email/:id', asyncHandler(notificationController.sendEmail));
module.exports = notificationRoute;
