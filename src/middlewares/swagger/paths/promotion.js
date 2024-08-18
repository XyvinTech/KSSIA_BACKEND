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
