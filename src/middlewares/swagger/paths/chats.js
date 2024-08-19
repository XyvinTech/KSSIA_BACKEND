/**
 * @swagger
 * /chats/send:
 *   post:
 *     summary: Send a new message
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               from:
 *                 type: string
 *                 description: ID of the sender
 *               to:
 *                 type: string
 *                 description: ID of the receiver
 *               content:
 *                 type: string
 *                 description: The message content
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                   description: File to be uploaded
 *     responses:
 *       201:
 *         description: Successfully sent the message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 from:
 *                   type: string
 *                   description: ID of the sender
 *                 to:
 *                   type: string
 *                   description: ID of the receiver
 *                 content:
 *                   type: string
 *                   description: The message content
 *                 attachments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fileType:
 *                         type: string
 *                         description: MIME type of the file
 *                       url:
 *                         type: string
 *                         description: URL of the uploaded file
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   description: The time the message was sent
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /chats/messages/{userId1}/{userId2}:
 *   get:
 *     summary: Retrieve messages between two users
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: userId1
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the first user
 *       - in: path
 *         name: userId2
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the second user
 *     responses:
 *       200:
 *         description: Successfully retrieved messages
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                     description: ID of the sender
 *                   to:
 *                     type: string
 *                     description: ID of the receiver
 *                   content:
 *                     type: string
 *                     description: The message content
 *                   attachments:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         fileType:
 *                           type: string
 *                           description: MIME type of the attachment
 *                         url:
 *                           type: string
 *                           description: URL of the attachment
 *                   status:
 *                     type: string
 *                     enum: ['sent', 'delivered', 'seen']
 *                     description: Status of the message
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: The time the message was sent
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /chats/threads/{userId}:
 *   get:
 *     summary: Retrieve chat threads for a user
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to retrieve chat threads for
 *     responses:
 *       200:
 *         description: Successfully retrieved chat threads
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   participants:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         userId:
 *                           type: string
 *                           description: ID of the participant
 *                         name:
 *                           type: string
 *                           description: Username of the participant
 *                         profile_picture:
 *                           type: string
 *                           description: Profile picture URL of the participant
 *                   lastMessage:
 *                     type: object
 *                     description: Details of the last message in the thread
 *                   unreadCount:
 *                     type: integer
 *                     description: Number of unread messages in the thread
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /chats/notifications/{userId}:
 *   get:
 *     summary: Get unread message notifications
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID of the user to retrieve notifications for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved unread notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   chatThreadId:
 *                     type: string
 *                     description: ID of the chat thread
 *                   lastMessage:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: ID of the last message
 *                       content:
 *                         type: string
 *                         description: Content of the last message
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                         description: Timestamp of the last message
 *                   unreadCount:
 *                     type: integer
 *                     description: Number of unread messages in the chat thread
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /chats/delete/{messageId}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Chats]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the message to delete
 *     responses:
 *       200:
 *         description: Successfully deleted the message
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /chats/delete-all/{userId}:
 *   delete:
 *     summary: Delete all messages of a user
 *     tags: [Chats]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user whose messages should be deleted
 *     responses:
 *       200:
 *         description: Successfully deleted all messages of the user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Confirmation message
 *       500:
 *         description: Internal server error
 */
