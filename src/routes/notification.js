// routes/notificationRoutes.js
const express = require("express");
const notificationController = require("../controllers/notificationController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");

const notificationRoute = express.Router();

// Middleware for authentication
notificationRoute.use(authVerify);

// Routes for saving email notifications and in-app notifications
notificationRoute
  .route("/notifications/email")
  .post(asyncHandler(notificationController.saveEmail))
  .get(asyncHandler(notificationController.getUnsentEmails));

notificationRoute
  .route("/notifications/in-app")
  .post(asyncHandler(notificationController.saveInApp));

// Route for sending email notifications
notificationRoute
  .route("/notifications/send-email/:id")
  .post(asyncHandler(notificationController.sendEmail));

// Route for retrieving unread notifications and updating read status
notificationRoute
  .route("/notifications/unread")
  .get(asyncHandler(notificationController.getUnreadNotifications));

notificationRoute
  .route("/notifications/read/:id")
  .put(asyncHandler(notificationController.updateReadStatus));

module.exports = notificationRoute;
