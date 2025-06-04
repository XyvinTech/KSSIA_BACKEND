require("dotenv").config();
const path = require("path");
const responseHandler = require("../helpers/responseHandler");
const Message = require("../models/messages");
const ChatThread = require("../models/chats");
const User = require("../models/user.js");
const Product = require("../models/products.js");
const Requirements = require("../models/requirements.js");
const sendInAppNotification = require("../utils/sendInAppNotification");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const {
  getReceiverSocketId,
  io,
  chatNamespace,
} = require("../socket/socket.js"); // Import the socket utility

/****************************************************************************************************/
/*                                   Function to send a message                                     */
/****************************************************************************************************/
exports.sendMessage = async (req, res) => {
  const { content, requirement, product } = req.body;
  const to = req.params.id;
  const from = req.userId;

  console.log("🚀 ~ exports.sendMessage= ~ from:", from);

  let attachments = [];
  const bucketName = process.env.AWS_S3_BUCKET;

  if (req.files && req.files.length > 0) {
    try {
      for (const file of req.files) {
        const url = await handleFileUpload(file, bucketName);
        attachments.push({
          fileType: file.mimetype,
          url,
        });
      }
    } catch (err) {
      return responseHandler(res, 500, `Error uploading file: ${err.message}`);
    }
  }

  try {
    let chatThread = await ChatThread.findOne({
      participants: {
        $all: [from, to],
      },
    });

    const newMessage = new Message({
      from,
      to,
      content,
      attachments,
      status: "sent",
    });

    let product_sent = "";
    let requirement_sent = "";
    let user;

    if (product) {
      newMessage.product = product;
      product_sent = await Product.findById(product);
    }

    if (requirement) {
      newMessage.requirement = requirement;
      requirement_sent = await Requirements.findById(requirement);
    }

    if (!chatThread) {
      chatThread = new ChatThread({
        participants: [from, to],
        lastMessage: newMessage._id,
        unreadCount: {
          [to]: 1,
        },
      });
    } else {
      chatThread.lastMessage = newMessage._id;
      chatThread.unreadCount.set(to, (chatThread.unreadCount.get(to) || 0) + 1);
    }

    await Promise.all([chatThread.save(), newMessage.save()]);

    const receiverSocketId = getReceiverSocketId(to);
    console.log("Receiver Socket ID:", receiverSocketId);

    if (receiverSocketId) {
      chatNamespace.to(receiverSocketId).emit("message", newMessage);
    } else {
      console.log("Receiver is not online.");
    }

    let NotificationSubject = "New Message";

    let validAttachments = attachments.filter(
      (att) => att && att.startsWith("http")
    );
    let imageUrl = validAttachments.length > 0 ? validAttachments[0].url : null;

    try {
      user = await User.findById(from);
      if (!user) {
        return responseHandler(res, 404, "User not found");
      }
      let full_name = `${user.name}`.trim();
      NotificationSubject = `${full_name} sent you a message`;

      if (product_sent != "") {
        NotificationSubject = `${full_name} sent you a message about product ${product_sent.name}`;
        imageUrl = product_sent.image;
      }

      if (requirement_sent != "") {
        NotificationSubject = `${full_name} sent you a message about requirement ${requirement_sent.content}`;
        imageUrl = requirement_sent.image;
      }
    } catch (error) {
      console.log(error);
    }

    try {
      const to_user = await User.findById(to);
      let userFCM = [];
      userFCM.push(to_user.fcm);
      const uniqueTag = `chat`;

      console.log(userFCM);
      console.log(NotificationSubject);
      console.log(newMessage.content);
      console.log(imageUrl);

      if (!user.blocked_users.includes(to)) {
        await sendInAppNotification(
          userFCM,
          NotificationSubject,
          newMessage.content,
          imageUrl,
          uniqueTag,
          user._id.toString()
        );
      }
      // If the user is blocked, do nothing (no notification sent)
    } catch (error) {
      console.log(`error creating notification : ${error}`);
    }

    return responseHandler(res, 201, "Message sent successfully!", newMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return responseHandler(res, 500, "Internal Server Error");
  }
};

/****************************************************************************************************/
/*                                   Function to get messages between users                         */
/****************************************************************************************************/
exports.getMessagesBetweenUsers = async (req, res) => {
  const { userId1, userId2 } = req.params;

  try {
    const messages = await Message.find({
      $or: [
        {
          from: userId1,
          to: userId2,
        },
        {
          from: userId2,
          to: userId1,
        },
      ],
    })
      .sort({
        timestamp: 1,
      })
      .populate("product", "name price offer_price image") // Populating product
      .populate("requirement", "content image"); // Populating requirement

    // Mark messages as seen
    await Message.updateMany(
      {
        from: userId2,
        to: userId1,
        status: {
          $ne: "seen",
        },
      },
      {
        status: "seen",
      }
    );

    // Reset unread count in chat thread
    await ChatThread.updateOne(
      {
        participants: {
          $all: [userId1, userId2],
        },
      },
      {
        $set: {
          [`unreadCount.${userId1}`]: 0,
        },
      }
    );

    return responseHandler(
      res,
      200,
      "Messages retrieved successfully!",
      messages
    );
  } catch (error) {
    console.error("Error retrieving messages:", error);
    return responseHandler(res, 500, "Internal Server Error");
  }
};

/****************************************************************************************************/
/*                                   Function to get chat threads                                   */
/****************************************************************************************************/
exports.getChatThreads = async (req, res) => {
  try {
    const currentUser = await User.findById(req.userId).select("blocked_users");

    const blockedUserIds = currentUser.blocked_users.map((user) => user.userId);

    const chatThreads = await ChatThread.find({
      $and: [
        { participants: req.userId },
        { participants: { $nin: blockedUserIds } },
      ],
    })
      .populate("participants", "name profile_picture")
      .populate("lastMessage")
      .sort({
        lastMessage: -1,
        _id: 1,
      })
      .exec();

    return responseHandler(
      res,
      200,
      "Chat threads retrieved successfully!",
      chatThreads
    );
  } catch (error) {
    console.error("Error retrieving chat threads:", error);
    return responseHandler(res, 500, "Internal Server Error");
  }
};

/****************************************************************************************************/
/*                                   Function to mark message seen                                  */
/****************************************************************************************************/
exports.markMessagesAsSeen = async (req, res) => {
  const { userId, otherUserId } = req.params;

  try {
    await Message.updateMany(
      {
        from: otherUserId,
        to: userId,
        status: {
          $ne: "seen",
        },
      },
      {
        status: "seen",
      }
    );

    await ChatThread.updateOne(
      {
        participants: {
          $all: [userId, otherUserId],
        },
      },
      {
        $set: {
          [`unreadCount.${userId}`]: 0,
        },
      }
    );

    // Emit a socket event to notify the sender that messages have been seen
    io.to(otherUserId.toString()).emit("messagesSeen", userId);

    return responseHandler(res, 200, "Messages marked as seen!");
  } catch (error) {
    console.error("Error marking messages as seen:", error);
    return responseHandler(res, 500, "Internal Server Error");
  }
};

/****************************************************************************************************/
/*                                   Function to delete message                                     */
/****************************************************************************************************/
exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;

  try {
    const message = await Message.findByIdAndDelete(messageId);
    if (!message) {
      return responseHandler(res, 404, "Message not found");
    }

    // Emit message deletion to both users
    io.to(message.from).emit("messageDeleted", messageId);
    io.to(message.to).emit("messageDeleted", messageId);

    // If the message has attachments, delete them from S3
    // const bucketName = process.env.AWS_S3_BUCKET;
    // if (message.attachments && message.attachments.length > 0) {
    //   for (const attachment of message.attachments) {
    //     let oldFileKey = path.basename(attachment.url);
    //     await deleteFile(bucketName, oldFileKey);
    //   }
    // }

    // Update chat thread if the deleted message was the last message
    const chatThread = await ChatThread.findOne({
      lastMessage: messageId,
    });
    if (chatThread) {
      // Fetch the previous message in the thread
      const previousMessage = await Message.findOne({
        $or: [
          {
            from: chatThread.participants[0],
            to: chatThread.participants[1],
          },
          {
            from: chatThread.participants[1],
            to: chatThread.participants[0],
          },
        ],
      }).sort({
        timestamp: -1,
      });

      chatThread.lastMessage = previousMessage ? previousMessage._id : null;
      await chatThread.save();
    }

    return responseHandler(res, 200, "Message deleted successfully!");
  } catch (err) {
    console.error("Error deleting message:", err);
    return responseHandler(res, 500, `Error deleting message: ${err.message}`);
  }
};

/****************************************************************************************************/
/*                                   Function to delete chats                                       */
/****************************************************************************************************/
exports.deleteAllMessagesOfUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Add userId to the deletedBy array for all messages where the user is a participant
    const messages = await Message.updateMany(
      {
        $or: [
          {
            from: userId,
          },
          {
            to: userId,
          },
        ],
      },
      {
        $addToSet: {
          deletedBy: userId,
        },
      }
    );

    // Remove chat threads only for the current user
    const chatThreads = await ChatThread.updateMany(
      {
        participants: userId,
      },
      {
        $pull: {
          participants: userId,
        },
      }
    );

    return responseHandler(
      res,
      200,
      `Deleted messages and chat threads successfully for current user!`
    );
  } catch (error) {
    console.error("Error deleting messages and chat threads:", error);
    return responseHandler(res, 500, "Internal Server Error");
  }
};

/****************************************************************************************************/
/*                                   Function to get unread notification                            */
/****************************************************************************************************/
exports.getUnreadNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const chatThreads = await ChatThread.find({
      participants: userId,
    })
      .populate("participants", "username profilePicture")
      .populate("lastMessage")
      .exec();

    // Filter chat threads to include only those with unread messages
    const notifications = chatThreads
      .filter((thread) => thread.unreadCount.get(userId) > 0)
      .map((thread) => ({
        chatThreadId: thread._id,
        lastMessage: thread.lastMessage,
        unreadCount: thread.unreadCount.get(userId),
      }));

    return responseHandler(
      res,
      200,
      "Unread notifications retrieved successfully!",
      notifications
    );
  } catch (error) {
    console.error("Error retrieving unread notifications:", error);
    return responseHandler(res, 500, "Internal Server Error");
  }
};
