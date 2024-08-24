require("dotenv").config();
const nodemailer = require('nodemailer');
const responseHandler = require("../helpers/responseHandler");
const Notification = require("../models/notifications");
const User = require("../models/user");
const {
    emailNotificationSchema,
    inAppNotificationSchema
} = require("../validation");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");

/****************************************************************************************************/
/*                             Function to create in app notification                             */
/****************************************************************************************************/

exports.createInAppNotification = async (req, res) => {

    let data = req.body;

    // Handle file uploads if present
    if (req.file) {
        try {
            const bucketName = process.env.AWS_S3_BUCKET;
            data.file_url = await handleFileUpload(req.file, bucketName);
        } catch (err) {
            return responseHandler(res, 500, `Error uploading file: ${err.message}`);
        }
    }

     // Ensure the `to` field is an array
     if (!Array.isArray(data.to)) {
        data.to = [data.to];
    }

    // Validate the input data
    const {
        error
    } = inAppNotificationSchema.validate(data, {
        abortEarly: true
    });

    // Check if an error exists in the validation
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    try {
        // Create a new in-app notification
        const newNotification = new Notification({
            ...data,
            type: 'in-app'
        });
        await newNotification.save();
        return responseHandler(res, 201, 'Notification saved successfully!', newNotification);
    } catch (err) {
        return responseHandler(res, 500, `Server error: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                           Function to get all in app notification                                */
/****************************************************************************************************/

exports.getallInAppNotifications = async (req, res) => {

    const notifications = await Notification.find({type: 'in-app'});
    if (!notifications){
        return responseHandler(res, 404, 'No notifications found');
    }
    return responseHandler(res, 200, 'Notifications retrieved successfully!', notifications);
};

/****************************************************************************************************/
/*                           Function to get unread in app notification                             */
/****************************************************************************************************/

exports.getUnreadInAppNotifications = async (req, res) => {

    const {
        userId
    } = req.params;

    if (!userId) {
        // If userId is not provided, return a 400 status code with the error message
        // console.log('Invalid request');                                              // Debug line
        return responseHandler(res, 400, `Invalid request`);
    }

    try {
        const notifications = await Notification.find({
            to: userId,
            readBy: {
                $ne: userId
            },
            type: 'in-app'
        });
        for (const notification of notifications){
            await notification.markAsRead(userId);
        }
        return responseHandler(res, 200, 'Unread notifications retrieved successfully!', notifications);
    } catch (err) {
        return responseHandler(res, 500, `Server error: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                          Function to get all read in app notification                          */
/****************************************************************************************************/

exports.getReadInAppNotifications = async (req, res) => {

    const {
        userId
    } = req.params;

    if (!userId) {
        // If userId is not provided, return a 400 status code with the error message
        // console.log('Invalid request');                                              // Debug line
        return responseHandler(res, 400, `Invalid request`);
    }

    try {
        const notifications = await Notification.find({
            to: userId,
            readBy: userId,
            type: 'in-app'
        });
        return responseHandler(res, 200, 'Read notifications retrieved successfully!', notifications);
    } catch (err) {
        return responseHandler(res, 500, `Server error: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                             Function to update in app notification                             */
/****************************************************************************************************/

exports.updateInAppNotification = async (req, res) => {

    const {
        notificationId
    } = req.params;
    const data = req.body;

    if (!notificationId) {
        // If notificationId is not provided, return a 400 status code with the error message
        // console.log('Invalid request');                                              // Debug line
        return responseHandler(res, 400, `Invalid request`);
    }

    // Validate the input data
    const {
        error
    } = inAppNotificationSchema.validate(data, {
        abortEarly: true
    });

    // Check if an error exists in the validation
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const notification = await Notification.findOne(notificationId);

    if (!notification) {
        return responseHandler(res, 404, 'Notification not found.');
    }

    // Handle file upload if present
    let media_url = notification.media_url;
    const bucketName = process.env.AWS_S3_BUCKET;

    if (req.file) {
        try {
            // Delete the existing file from S3 if it exists
            if (notification.media_url) {
                const fileKey = path.basename(notification.media_url);
                await deleteFile(bucketName, fileKey);
            }

            // Upload the new file to S3
            media_url = await handleFileUpload(req.file, bucketName);
        } catch (err) {
            return responseHandler(res, 500, `Error handling file: ${err.message}`);
        }
    }

    Object.assign(notification, data, {
        media_url
    });

    try {
        await notification.save();
        return responseHandler(res, 200, "News article updated successfully!", notification);
    } catch (err) {
        return responseHandler(res, 500, `Error saving news: ${err.message}`);
    }

};

/****************************************************************************************************/
/*                          Function to mark as read in app notifications                          */
/****************************************************************************************************/

exports.updateReadStatus = async (req, res) => {

    const {
        notificationId
    } = req.params;
    const {
        userId
    } = req.params;

    if (!notificationId) {
        // If notificationId is not provided, return a 400 status code with the error message
        // console.log('Invalid request');                                              // Debug line
        return responseHandler(res, 400, `Invalid request`);
    }
    if (!userId) {
        // If userId is not provided, return a 400 status code with the error message
        // console.log('Invalid request');                                              // Debug line
        return responseHandler(res, 400, `Invalid request`);
    }

    try {
        const notification = await Notification.findById(notificationId);
        if (!notification) {
            return responseHandler(res, 404, 'Notification not found.');
        }

        await notification.markAsRead(userId);
        return responseHandler(res, 200, 'Notification read status updated successfully!', notification);
    } catch (err) {
        return responseHandler(res, 500, `Server error: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                          Function to count unread in app notification                          */
/****************************************************************************************************/

exports.getUnreadNotificationCount = async (req, res) => {

    const {
        userId
    } = req.params;

    if (!userId) {
        // If userId is not provided, return a 400 status code with the error message
        // console.log('Invalid request');                                              // Debug line
        return responseHandler(res, 400, `Invalid request`);
    }

    try {
        // Use the static method defined in the Notification model
        const count = await Notification.countUnread(userId);

        if (count === null || count === undefined) {
            return responseHandler(res, 404, 'User not found or no unread notifications.');
        }

        return responseHandler(res, 200, 'Unread notifications count retrieved successfully!', {
            count
        });
    } catch (err) {
        return responseHandler(res, 500, `Server error: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                             Function to delete in app notification                             */
/****************************************************************************************************/

exports.deleteInAppNotification = async (req, res) => {

    const {
        notificationId
    } = req.params;

    if (!notificationId) {
        // If notificationId is not provided, return a 400 status code with the error message
        // console.log('Invalid request');                                              // Debug line
        return responseHandler(res, 400, `Invalid request`);
    }

    try {
        const result = await Notification.findByIdAndDelete(notificationId);
        if (!result) {
            return responseHandler(res, 404, 'Notification not found.');
        }
        
        if (notification.media_url) {
            try {
                const bucketName = process.env.AWS_S3_BUCKET;
                const fileKey = path.basename(notification.media_url);
                await deleteFile(bucketName, fileKey);
            } catch (err) {
                return responseHandler(res, 500, `Error deleting file: ${err.message}`);
            }
        }

        return responseHandler(res, 200, 'Notification deleted successfully.');
    } catch (err) {
        return responseHandler(res, 500, `Server error: ${err.message}`);
    }
};

/*************************************************************************************k***************/
/*                             Function to create email notification                              */
/****************************************************************************************************/

const formatNotificationEmails = async (notification) => {
    try {
        // Populate the `to` field with user data
        const users = await User.find({
            '_id': {
                $in: notification.to
            }
        }).select('email');

        // Extract emails from the user documents
        const emailAddresses = users.map(user => user.email).filter(email => email);

        // Join the emails into a single string separated by commas
        return emailAddresses.join(', ');
    } catch (err) {
        throw new Error(`Error formatting email recipients: ${err.message}`);
    }
};

exports.createAndSendEmailNotification = async (req, res) => {
    
    const data = req.body;

    console.log(data);

    // Ensure the `to` field is an array
    if (!Array.isArray(data.to)) {
        data.to = [data.to];
    }

    console.log(data);

    // Validate the input data
    const {
        error
    } = emailNotificationSchema.validate(data, {
        abortEarly: true
    });

    // Check if an error exists in the validation
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const {
        to,
        subject,
        content,
        media_url,
        file_url,
        link_url
    } = data;

    try {
        // Create email notification
        const newNotification = new Notification({
            to,
            subject,
            content,
            media_url,
            file_url,
            link_url,
            type: 'email'
        });
        await newNotification.save();

        // Format the email addresses
        const formattedEmails = await formatNotificationEmails(newNotification);

        // Send email
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
            
        });
        console.log("Email User:", process.env.EMAIL_USER);
        console.log("Email Pass:", process.env.EMAIL_PASS);
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: formattedEmails,
            subject,
            text: content,
            attachments: [
                media_url ? {
                    path: media_url
                } : null,
                file_url ? {
                    path: file_url
                } : null
            ].filter(Boolean) // Filter out null values
        };

        await transporter.sendMail(mailOptions);

        return responseHandler(res, 201, 'Email notification created and sent successfully!');
    } catch (err) {
        return responseHandler(res, 500, `Server error: ${err.message}`);
    }
};