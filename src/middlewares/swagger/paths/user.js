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
 * /upload:
 *   put:
 *     summary: Uploads a file to S3 bucket
 *     description: Handles file upload to AWS S3 bucket and returns the URL of the uploaded file.
 *     tags:
 *       - User
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to be uploaded.
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File uploaded successfully
 *                 fileUrl:
 *                   type: string
 *                   example: https://your-bucket-name.s3.your-region.amazonaws.com/your-file-name
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Error handling file upload: <error message>
 */
