/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Operations related to payments
 */

/**
 * @swagger
 * /payments:
 *   post:
 *     summary: Create a new payment
 *     tags: 
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Payment object that needs to be added to the system
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               member:
 *                 type: string
 *                 description: ID of the user making the payment
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the payment
 *               time:
 *                 type: string
 *                 format: date-time
 *                 description: Time of the payment
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Amount of the payment
 *               mode_of_payment:
 *                 type: string
 *                 description: Payment mode
 *               category:
 *                 type: string
 *                 description: Payment category
 *               status:
 *                 type: string
 *                 description: Status of the payment
 *               invoice_url:
 *                 type: string
 *                 format: uri
 *                 description: URL of the invoice
 *               remarks:
 *                 type: string
 *                 description: Additional remarks
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Invoice file
 *     responses:
 *       201:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /payments/{paymentID}:
 *   put:
 *     summary: Update an existing payment
 *     tags: 
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentID
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the payment to update
 *     requestBody:
 *       description: Payment object that needs to be updated
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               member:
 *                 type: string
 *                 description: ID of the user making the payment
 *               date:
 *                 type: string
 *                 format: date
 *                 description: Date of the payment
 *               time:
 *                 type: string
 *                 format: date-time
 *                 description: Time of the payment
 *               amount:
 *                 type: number
 *                 format: float
 *                 description: Amount of the payment
 *               mode_of_payment:
 *                 type: string
 *                 description: Payment mode
 *               category:
 *                 type: string
 *                 description: Payment category
 *               status:
 *                 type: string
 *                 description: Status of the payment
 *               invoice_url:
 *                 type: string
 *                 format: uri
 *                 description: URL of the invoice
 *               remarks:
 *                 type: string
 *                 description: Additional remarks
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Invoice file
 *     responses:
 *       200:
 *         description: Payment updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /payments/{paymentID}:
 *   delete:
 *     summary: Delete a payment
 *     tags: 
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentID
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the payment to delete
 *     responses:
 *       200:
 *         description: Payment deleted successfully
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /payments/{paymentID}/status:
 *   patch:
 *     summary: Update the status of a payment
 *     tags: 
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentID
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the payment to update
 *     requestBody:
 *       description: Status update for the payment
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, resubmit, rejected]
 *                 description: New status of the payment
 *               reason:
 *                 type: string
 *                 description: Reason for the status update
 *     responses:
 *       200:
 *         description: Payment status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /payments/{userId}:
 *   get:
 *     summary: Retrieve payment history for a user by userId
 *     tags: 
 *       - Payments
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user whose payment history is to be retrieved
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid request, missing or invalid userId
 *       404:
 *         description: User or payments not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         member:
 *           type: string
 *           description: The ID of the user associated with the payment
 *         date:
 *           type: string
 *           format: date
 *           description: Date of the payment
 *         time:
 *           type: string
 *           format: date-time
 *           description: Time of the payment
 *         amount:
 *           type: number
 *           description: Amount paid
 *         mode_of_payment:
 *           type: string
 *           description: Method of payment (e.g., credit card, bank transfer)
 *         category:
 *           type: string
 *           description: Payment category (e.g., membership, event fees)
 *         status:
 *           type: string
 *           enum:
 *             - pending
 *             - accepted
 *             - resubmit
 *             - rejected
 *           description: Status of the payment
 *         invoice_url:
 *           type: string
 *           description: URL of the payment invoice
 *         remarks:
 *           type: string
 *           description: Remarks about the payment
 *         reason:
 *           type: string
 *           description: Reason for payment status (if rejected or resubmit)
 *       required:
 *         - member
 *         - date
 *         - time
 *         - amount
 *         - mode_of_payment
 *         - category
 *   responses:
 *     BadRequest:
 *       description: Invalid input
 *     NotFound:
 *       description: Resource not found
 *     InternalServerError:
 *       description: Internal server error
 */
