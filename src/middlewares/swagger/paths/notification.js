/**
 * @swagger
 * notification/notifications/email:
 *   post:
 *     summary: Save a new email notification
 *     tags:
 *       - Notifications
 *     requestBody:
 *       description: Email notification object that needs to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user to receive the notification
 *               subject:
 *                 type: string
 *                 description: Subject of the email
 *               content:
 *                 type: string
 *                 description: Content of the email
 *               upload_url:
 *                 type: string
 *                 format: uri
 *                 description: URL of the attachment
 *               upload_file_url:
 *                 type: string
 *                 format: uri
 *                 description: URL of another attachment
 *               url:
 *                 type: string
 *                 description: URL to include in the email
 *               type:
 *                 type: boolean
 *                 description: Type of notification (false for email)
 *     responses:
 *       201:
 *         description: Email notification saved successfully
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
 * notification/notifications/email:
 *   get:
 *     summary: Retrieve all unsent email notifications
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: List of unsent email notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * notification/notifications/in-app:
 *   post:
 *     summary: Save a new in-app notification
 *     tags:
 *       - Notifications
 *     requestBody:
 *       description: In-app notification object that needs to be created
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               to:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the user to receive the notification
 *               subject:
 *                 type: string
 *                 description: Subject of the notification
 *               content:
 *                 type: string
 *                 description: Content of the notification
 *               upload_url:
 *                 type: string
 *                 format: uri
 *                 description: URL of the attachment (optional)
 *               upload_file_url:
 *                 type: string
 *                 format: uri
 *                 description: URL of another attachment (optional)
 *               url:
 *                 type: string
 *                 description: URL to include in the notification (optional)
 *               type:
 *                 type: boolean
 *                 description: Type of notification (true for in-app)
 *     responses:
 *       201:
 *         description: In-app notification saved successfully
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
 * notification/notifications/in-app/unread:
 *   get:
 *     summary: Retrieve unread notifications for the authenticated user
 *     tags:
 *       - Notifications
 *     responses:
 *       200:
 *         description: List of unread notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Unauthorized request
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * notification/notifications/in-app/read/{id}:
 *   put:
 *     summary: Update the read status of a notification by ID
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the notification to update
 *     responses:
 *       200:
 *         description: Notification read status updated successfully
 *       401:
 *         description: Unauthorized request
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * notification/notifications/send-email/{id}:
 *   post:
 *     summary: Send an email notification by ID
 *     tags:
 *       - Notifications
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the email notification to send
 *     responses:
 *       200:
 *         description: Email sent successfully
 *       400:
 *         description: Email already sent or invalid ID
 *       404:
 *         description: Notification not found
 *       500:
 *         description: Internal server error
 */
