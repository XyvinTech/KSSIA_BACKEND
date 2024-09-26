/**
 * @swagger
 * /user/login:
 *   post:
 *     summary: Verify OTP
 *     tags: 
 *       - User
 *     description: Verify the OTP sent to the user's mobile number.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               otp:
 *                 type: number
 *                 example: 123456
 *               mobile:
 *                 type: string
 *                 example: "+1234567890"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *       400:
 *         description: Invalid OTP or mobile number
 */

/**
 * @swagger
 * /user/login/{mobile}:
 *   get:
 *     summary: Send OTP
 *     tags: 
 *       - User
 *     description: Send an OTP to the specified mobile number.
 *     parameters:
 *       - in: path
 *         name: mobile
 *         required: true
 *         schema:
 *           type: string
 *           example: "+1234567890"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid mobile number
 */

/**
 * @swagger
 * /user/edit/{userId}:
 *   put:
 *     summary: Edit user profile
 *     tags: 
 *       - User
 *     security:
 *       - BearerAuth: []
 *     description: Edit the profile of an existing user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           example: "605c72ef1f1b2c001f6472f5"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EditUserRequest'
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *       400:
 *         description: Invalid data or user not found
 */

/**
 * @swagger
 * /user/search/{name}:
 *   get:
 *     summary: Search for users by name
 *     tags: 
 *       - User
 *     security:
 *       - BearerAuth: []
 *     description: Find users matching the specified name.
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *           example: "John Doe"
 *     responses:
 *       200:
 *         description: User(s) found
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       404:
 *         description: No users found
 */

/**
 * @swagger
 * /user/find/{membershipId}:
 *   get:
 *     summary: Find a user by membership ID
 *     tags: 
 *       - User
 *     security:
 *       - BearerAuth: []
 *     description: Retrieve user details using the membership ID.
 *     parameters:
 *       - in: path
 *         name: membershipId
 *         required: true
 *         schema:
 *           type: string
 *           example: "MEM12345"
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /user/{userId}:
 *   get:
 *     summary: Retrieve a single user by ID
 *     tags: 
 *       - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/{userId}/reviews:
 *   post:
 *     summary: Add a review for a user
 *     tags: 
 *       - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user to add a review for
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Review'
 *     responses:
 *       200:
 *         description: Review added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request or input data
 *       404:
 *         description: User not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /user/{userId}/reviews/{reviewId}:
 *   delete:
 *     summary: Delete a review for a user
 *     tags:
 *       - User
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user whose review will be deleted
 *       - in: path
 *         name: reviewId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the review to delete
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid request or review ID
 *       404:
 *         description: User or review not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Review:
 *       type: object
 *       properties:
 *         reviewer:
 *           type: string
 *           description: The ID of the reviewer
 *         content:
 *           type: string
 *           description: The content of the review
 *         rating:
 *           type: integer
 *           description: The rating given in the review (1-5)
 *       required:
 *         - reviewer
 *         - content
 *         - rating
 *       example:
 *         reviewer: "60d21b4667d0d8992e610c85"
 *         content: "Great service and support!"
 *         rating: 5
 */
