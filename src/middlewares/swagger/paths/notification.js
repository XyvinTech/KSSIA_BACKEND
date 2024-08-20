/**
 * @swagger
 * tags:
 *   name: Notifications
 *   description: API endpoints for managing notifications
 */

/**
 * @swagger
 * /notification/in-app:
 *   get:
 *     summary: Retrieve all in-app notifications
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all in-app notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       404:
 *         description: No in-app notifications found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * /notification/in-app:
 *   post:
 *     summary: Create a new in-app notification
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: In-app notification object that needs to be added to the system. Includes optional file uploads for media.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *               media_url:
 *                 type: string
 *               link_url:
 *                 type: string
 *               file_url:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: In-app notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /notification/in-app/unread/{userId}:
 *   get:
 *     summary: Retrieve unread in-app notifications for a user
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the user to retrieve unread notifications for
 *     responses:
 *       200:
 *         description: Unread in-app notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /notification/in-app/read/{userId}:
 *   get:
 *     summary: Retrieve read in-app notifications for a user
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the user to retrieve read notifications for
 *     responses:
 *       200:
 *         description: Read in-app notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /notification/in-app/{notificationId}:
 *   put:
 *     summary: Update an existing in-app notification
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the notification to update
 *     requestBody:
 *       description: In-app notification object that needs to be updated. Includes optional file uploads for media.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *               media_url:
 *                 type: string
 *               link_url:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: In-app notification updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /notification/in-app/{notificationId}/read/{userId}:
 *   put:
 *     summary: Mark an in-app notification as read
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the notification to mark as read
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the user marking the notification as read
 *     responses:
 *       200:
 *         description: Notification read status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /notification/in-app/unread-count/{userId}:
 *   get:
 *     summary: Count unread in-app notifications for a user
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the user to count unread notifications for
 *     responses:
 *       200:
 *         description: Count of unread notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *       400:
 *         description: Invalid request
 *       404:
 *         description: User not found or no unread notifications
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /notification/in-app/{notificationId}:
 *   delete:
 *     summary: Delete an in-app notification
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *         description: The ID of the notification to delete
 *     responses:
 *       200:
 *         description: In-app notification deleted successfully
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /notification/email:
 *   post:
 *     summary: Create and send an email notification
 *     tags:
 *       - Notifications
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Email notification object that needs to be created and sent. Includes optional file uploads for attachments.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: email
 *               subject:
 *                 type: string
 *               content:
 *                 type: string
 *               media_url:
 *                 type: string
 *               file_url:
 *                 type: string
 *               link_url:
 *                 type: string
 *               attachment:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Email notification created and sent successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the notification
 *         to:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         subject:
 *           type: string
 *         content:
 *           type: string
 *         media_url:
 *           type: string
 *         file_url:
 *           type: string
 *         link_url:
 *           type: string
 *         type:
 *           type: string
 *           enum: [email, in-app]
 *         readBy:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the notification was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the notification was last updated
 */
