/**
 * @swagger
 * tags:
 *   name: Promotions
 *   description: API endpoints for managing promotions
 */

/**
 * @swagger
 * /promotions:
 *   post:
 *     summary: Create a new promotion
 *     tags: 
 *       - Promotions
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Promotion object that needs to be added to the system. Includes file uploads for images and videos.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ['banner', 'video', 'poster', 'notice']
 *               file:
 *                 type: string
 *                 format: binary
 *               yt_link:
 *                 type: string
 *               video_title:
 *                 type: string
 *               notice_title:
 *                 type: string
 *               notice_description:
 *                 type: string
 *               notice_link:
 *                 type: string
 *               status:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Promotion created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /promotions:
 *   get:
 *     summary: Retrieve all promotions
 *     tags: 
 *       - Promotions
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Promotions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Promotion'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /promotions/{type}:
 *   get:
 *     summary: Function to get all promotions by type
 *     tags: 
 *       - Promotions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: type
 *         schema:
 *           type: string
 *         required: true
 *         description: The type of the promotion to retrieve
 *     responses:
 *       200:
 *         description: Promotions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Promotion'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /promotions/{promotionId}:
 *   get:
 *     summary: Retrieve a single promotion by ID
 *     tags: 
 *       - Promotions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promotionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the promotion to retrieve
 *     responses:
 *       200:
 *         description: Promotion retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /promotions/{type}/{promotionId}:
 *   get:
 *     summary: Retrieve promotions by type or a specific promotion by ID and type
 *     tags: [Promotions]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [banner, video, poster, notice]
 *         description: Type of the promotion (e.g., banner, video, poster, notice)
 *       - in: path
 *         name: promotionId
 *         required: false
 *         schema:
 *           type: string
 *         description: ID of the specific promotion (optional)
 *     responses:
 *       200:
 *         description: Successfully retrieved promotions or a specific promotion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 200
 *                 message:
 *                   type: string
 *                   example: Promotions retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         description: Promotion ID
 *                       type:
 *                         type: string
 *                         description: Type of the promotion
 *                       title:
 *                         type: string
 *                         description: Title of the promotion
 *                       description:
 *                         type: string
 *                         description: Description of the promotion
 *                       imageUrl:
 *                         type: string
 *                         description: URL of the promotion image
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Creation date of the promotion
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Last update date of the promotion
 *       400:
 *         description: Invalid request (e.g., invalid type parameter)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 400
 *                 message:
 *                   type: string
 *       404:
 *         description: Promotion not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 404
 *                 message:
 *                   type: string
 *                   example: Promotion not found
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: integer
 *                   example: 500
 *                 message:
 *                   type: string
 */

/**
 * @swagger
 * /promotions/{promotionId}:
 *   put:
 *     summary: Update an existing promotion by ID
 *     tags: 
 *       - Promotions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promotionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the promotion to update
 *     requestBody:
 *       description: Promotion object that needs to be updated. Includes file uploads for images and videos.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ['banner', 'video', 'poster', 'notice']
 *               file:
 *                 type: string
 *                 format: binary
 *               yt_link:
 *                 type: string
 *               video_title:
 *                 type: string
 *               notice_title:
 *                 type: string
 *               notice_description:
 *                 type: string
 *               notice_link:
 *                 type: string
 *               status:
 *                 type: boolean
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Promotion updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /promotions/{promotionId}:
 *   delete:
 *     summary: Delete a promotion by ID
 *     tags: 
 *       - Promotions
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: promotionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the promotion to delete
 *     responses:
 *       200:
 *         description: Promotion deleted successfully
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Promotion:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the promotion
 *         type:
 *           type: string
 *           enum: ['banner', 'video', 'poster', 'notice']
 *         banner_image_url:
 *           type: string
 *           description: URL of the banner image
 *         upload_video:
 *           type: string
 *           description: URL of the uploaded video
 *         yt_link:
 *           type: string
 *           description: YouTube link for the video
 *         video_title:
 *           type: string
 *         poster_image_url:
 *           type: string
 *           description: URL of the poster image
 *         notice_title:
 *           type: string
 *         notice_description:
 *           type: string
 *         notice_link:
 *           type: string
 *         status:
 *           type: boolean
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the promotion was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the promotion was last updated
 */
