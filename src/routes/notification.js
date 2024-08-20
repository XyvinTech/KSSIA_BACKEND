const express = require("express");
const notificationController = require("../controllers/notificationController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middlewares/uploads");
const notificationRoute = express.Router();

// Protect all routes with authentication middleware
notificationRoute.use(authVerify);

// Route to retrive all in-app notifications
notificationRoute.get(
    '/in-app',  
    asyncHandler(notificationController.getallInAppNotifications)
);

// Route to create in-app notifications with an optional image upload
notificationRoute.post(
    '/in-app',
    upload.single('file_url'),
    asyncHandler(notificationController.createInAppNotification)
);

// Route to get unread in-app notifications for a user
notificationRoute.get(
    '/in-app/unread/:userId', 
    asyncHandler(notificationController.getUnreadInAppNotifications)
);

// Route to get read in-app notifications for a user
notificationRoute.get(
    '/in-app/read/:userId', 
    asyncHandler(notificationController.getReadInAppNotifications)
);

// Route to update an in-app notification (e.g., adding a new media URL)
notificationRoute.put(
    '/in-app/:notificationId', 
    upload.single('file_url'),
    asyncHandler(notificationController.updateInAppNotification)
);

// Route to mark a notification as read
notificationRoute.put(
    '/in-app/:notificationId/read/:userId', 
    asyncHandler(notificationController.updateReadStatus)
);

// Route to count unread in-app notifications for a user
notificationRoute.get(
    '/in-app/unread-count/:userId', 
    asyncHandler(notificationController.getUnreadNotificationCount)
);

// Route to delete an in-app notification
notificationRoute.delete(
    '/in-app/:notificationId', 
    asyncHandler(notificationController.deleteInAppNotification)
);

// Route to create and send email notifications
notificationRoute.post(
    '/email', 
    upload.fields(
        [
            { name: 'file_url', maxCount: 1 },
            { name: 'attachments', maxCount: 10 }
          ]
    ),
    asyncHandler(notificationController.createAndSendEmailNotification)
);

module.exports = notificationRoute;
