require("dotenv").config();
const nodemailer = require("nodemailer");
const responseHandler = require("../helpers/responseHandler");
const Notification = require("../models/notifications");
const User = require("../models/user");
const {
  emailNotificationSchema,
  inAppNotificationSchema,
} = require("../validation");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const sendInAppNotification = require("../utils/sendInAppNotification");

/****************************************************************************************************/
/*                             Function to create in app notification                             */
/****************************************************************************************************/

exports.createInAppNotification = async (req, res) => {
  let data = req.body;

  // Handle file uploads if present
  // if (req.file) {
  //   try {
  //     const bucketName = process.env.AWS_S3_BUCKET;
  //     data.file_url = await handleFileUpload(req.file, bucketName);
  //   } catch (err) {
  //     return responseHandler(res, 500, `Error uploading file: ${err.message}`);
  //   }
  // }

  // // Ensure the `to` field is an array
  // if (!Array.isArray(data.to)) {
  //   data.to = [data.to];
  // }

  // Validate the input data
  const { error } = inAppNotificationSchema.validate(data, {
    abortEarly: true,
  });

  // Check if an error exists in the validation
  if (error) {
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  let userFCM = [];

  if (data.to[0] == "*") {
    let userIds = [];
    const users = await User.find().select("_id fcm").exec();
    users.forEach((user) => {
      userIds.push(user._id);
      if (user.fcm != "" && user.fcm != undefined) {
        userFCM.push(user.fcm);
      }
    });
    data.to = userIds;
  } else {
    if (data.to.length > 0) {
      for (let i = 0; i < data.to.length; i++) {
        const id = data.to[i];
        const findUser = await User.findById(id);
        if (findUser) {
          userFCM.push(findUser.fcm);
        }
      }
    }
  }

  try {
    await sendInAppNotification(
      userFCM,
      data.subject,
      data.content,
      data.file_url,
      "in-app"
    );

    // Create a new in-app notification
    const newNotification = new Notification({
      ...data,
      type: "in-app",
    });

    await newNotification.save();

    return responseHandler(
      res,
      201,
      "Notification saved successfully!",
      newNotification
    );
  } catch (err) {
    return responseHandler(res, 500, `Server error: ${err.message}`);
  }
};

/****************************************************************************************************/
/*                           Function to get all in app notification                                */
/****************************************************************************************************/

exports.getallInAppNotifications = async (req, res) => {
  const { pageNo = 1, limit = 10 } = req.query;
  const skipCount = limit * (pageNo - 1);
  const filter = {};

  const totalCount = await Notification.countDocuments(filter);
  const notifications = await Notification.find(filter)
    .skip(skipCount)
    .limit(limit)
    .sort({
      createdAt: -1,
    })
    .lean();

  if (!notifications) {
    return responseHandler(res, 404, "No notifications found");
  }
  return responseHandler(
    res,
    200,
    "Notifications retrieved successfully!",
    notifications,
    totalCount
  );
};

/****************************************************************************************************/
/*                           Function to get unread in app notification                             */
/****************************************************************************************************/

exports.getUnreadInAppNotifications = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    // If userId is not provided, return a 400 status code with the error message
    // console.log('Invalid request');                                              // Debug line
    return responseHandler(res, 400, `Invalid request`);
  }

  try {
    const notifications = await Notification.find({
      to: userId,
      type: "in-app",
    }).sort({ createdAt: -1 });
    const response = await Notification.find({
      to: userId,
      type: "in-app",
    });
    for (const notification of notifications) {
      await notification.markAsRead(userId);
    }
    return responseHandler(
      res,
      200,
      "Unread notifications retrieved successfully!",
      response
    );
  } catch (err) {
    return responseHandler(res, 500, `Server error: ${err.message}`);
  }
};

/****************************************************************************************************/
/*                          Function to get all read in app notification                          */
/****************************************************************************************************/

exports.getReadInAppNotifications = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    // If userId is not provided, return a 400 status code with the error message
    // console.log('Invalid request');                                              // Debug line
    return responseHandler(res, 400, `Invalid request`);
  }

  try {
    const notifications = await Notification.find({
      to: userId,
      readBy: userId,
      type: "in-app",
    }).sort({ createdAt: -1 });
    return responseHandler(
      res,
      200,
      "Read notifications retrieved successfully!",
      notifications
    );
  } catch (err) {
    return responseHandler(res, 500, `Server error: ${err.message}`);
  }
};

/****************************************************************************************************/
/*                             Function to update in app notification                             */
/****************************************************************************************************/

exports.updateInAppNotification = async (req, res) => {
  const { notificationId } = req.params;
  const data = req.body;

  if (!notificationId) {
    // If notificationId is not provided, return a 400 status code with the error message
    // console.log('Invalid request');                                              // Debug line
    return responseHandler(res, 400, `Invalid request`);
  }

  // Validate the input data
  const { error } = inAppNotificationSchema.validate(data, {
    abortEarly: true,
  });

  // Check if an error exists in the validation
  if (error) {
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  const notification = await Notification.findOne(notificationId);

  if (!notification) {
    return responseHandler(res, 404, "Notification not found.");
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

  let userFCM = [];
  if (data.to.length > 0) {
    for (let i = 0; i < data.to.length; i++) {
      const id = data.to[i];
      const findUser = await User.findById(id);
      if (findUser) {
        userFCM.push(findUser.fcm);
      }
    }
  }

  Object.assign(notification, data, {
    media_url,
  });

  try {
    await sendInAppNotification(
      userFCM,
      data.subject,
      data.content,
      data.file_url
    );
    await notification.save();
    return responseHandler(
      res,
      200,
      "Notifiaction updated successfully!",
      notification
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error saving notification: ${err.message}`
    );
  }
};

/****************************************************************************************************/
/*                          Function to mark as read in app notifications                          */
/****************************************************************************************************/

exports.updateReadStatus = async (req, res) => {
  const { notificationId } = req.params;
  const { userId } = req.params;

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
      return responseHandler(res, 404, "Notification not found.");
    }

    await notification.markAsRead(userId);
    return responseHandler(
      res,
      200,
      "Notification read status updated successfully!",
      notification
    );
  } catch (err) {
    return responseHandler(res, 500, `Server error: ${err.message}`);
  }
};

/****************************************************************************************************/
/*                          Function to count unread in app notification                          */
/****************************************************************************************************/

exports.getUnreadNotificationCount = async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    // If userId is not provided, return a 400 status code with the error message
    // console.log('Invalid request');                                              // Debug line
    return responseHandler(res, 400, `Invalid request`);
  }

  try {
    // Use the static method defined in the Notification model
    const count = await Notification.countUnread(userId);

    if (count === null || count === undefined) {
      return responseHandler(
        res,
        404,
        "User not found or no unread notifications."
      );
    }

    return responseHandler(
      res,
      200,
      "Unread notifications count retrieved successfully!",
      {
        count,
      }
    );
  } catch (err) {
    return responseHandler(res, 500, `Server error: ${err.message}`);
  }
};

/****************************************************************************************************/
/*                             Function to delete in app notification                             */
/****************************************************************************************************/

exports.deleteInAppNotification = async (req, res) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    // If notificationId is not provided, return a 400 status code with the error message
    // console.log('Invalid request');                                              // Debug line
    return responseHandler(res, 400, `Invalid request`);
  }

  try {
    const notification = await Notification.findByIdAndDelete(notificationId);
    if (!notification) {
      return responseHandler(res, 404, "Notification not found.");
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

    return responseHandler(res, 200, "Notification deleted successfully.");
  } catch (err) {
    return responseHandler(res, 500, `Server error: ${err.message}`);
  }
};

/*************************************************************************************k***************/
/*                             Function to create email notification                              */
/****************************************************************************************************/

const formatNotificationEmails = async (notification) => {
  try {
    const users = await User.find({
      _id: {
        $in: notification.to,
      },
    }).select("email");

    // Extract emails from the user documents
    const emailAddresses = users
      .map((user) => user.email)
      .filter((email) => email);

    return emailAddresses;
  } catch (err) {
    throw new Error(`Error formatting email recipients: ${err.message}`);
  }
};

exports.createAndSendEmailNotification = async (req, res) => {
  const data = req.body;

  // // Ensure the `to` field is an array
  // if (!Array.isArray(data.to)) {
  //   data.to = [data.to];
  // }

  // Validate the input data
  const { error } = emailNotificationSchema.validate(data, {
    abortEarly: true,
  });
  if (error) {
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  // const mediaFile = req.files["media_url"] ? req.files["media_url"][0] : null;
  // const bucketName = process.env.AWS_S3_BUCKET;
  // let mediaImage = "";

  // if (mediaFile) {
  //   try {
  //     mediaImage = await handleFileUpload(mediaFile, bucketName);
  //   } catch (err) {
  //     return responseHandler(res, 500, `Error uploading file: ${err.message}`);
  //   }
  // }

  if (data.to[0] === "*") {
    const users = await User.find().select("_id email").exec();
    data.to = users.map((user) => user._id);
  }

  const { to, subject, content, link_url, media_url } = data;

  try {
    // Create email notification
    const newNotification = new Notification({
      to,
      subject,
      content,
      media_url,
      link_url,
      type: "email",
    });
    await newNotification.save();

    // Get individual email addresses
    const emailAddresses = await formatNotificationEmails(newNotification);

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.NODE_MAILER_USER,
        pass: process.env.NODE_MAILER_PASS,
      },
    });

    for (const email of emailAddresses) {
      const attachments = media_url
        ? [
            {
              filename: media_url.split("/").pop(),
              path: media_url,
            },
          ]
        : [];
      const mailOptions = {
        from: process.env.NODE_MAILER_USER,
        to: email,
        subject,
        text: `${content}${link_url ? `\nExternal Link: ${link_url}` : ""}`,
        attachments: attachments,
      };

      try {
        await transporter.sendMail(mailOptions);
      } catch (error) {
        console.log(`Error sending email to ${email}:`, error);
      }
    }

    return responseHandler(
      res,
      201,
      "Email notifications created and sent successfully to all recipients!"
    );
  } catch (err) {
    return responseHandler(res, 500, `Server error: ${err.message}`);
  }
};

/*************************************************************************************k***************/
/*                                Function to get notification by ID                                 */
/****************************************************************************************************/

exports.getNotificationByID = async (req, res) => {
  const { notificationId } = req.params;

  if (!notificationId) {
    return responseHandler(res, 400, `Invalid request`);
  }

  try {
    const notification = await Notification.findById(notificationId).populate(
      "to",
      "name"
    );

    if (!notification) {
      return responseHandler(res, 404, "Notification not found.");
    }

    return responseHandler(
      res,
      200,
      "Notification fetched successfully!",
      notification
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error fetching notification: ${err.message}`
    );
  }
};
