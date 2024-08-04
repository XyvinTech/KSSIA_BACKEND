const express = require("express");
const promotionController = require("../controllers/promotionController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middlewares/uploads");
const promotionRoute = express.Router();

// Protect all routes with authentication middleware
promotionRoute.use(authVerify);

/**
 * @swagger
 * /promotion:
 *   post:
 *     summary: Create a new promotion
 *     tags:
 *       - Promotions
 *     requestBody:
 *       description: Promotion object that needs to be created
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ['banner', 'video', 'poster', 'notice']
 *                 description: Type of the promotion
 *               banner_image_url:
 *                 type: string
 *                 format: binary
 *                 description: Banner image URL (required if type is 'banner')
 *               upload_video:
 *                 type: string
 *                 format: binary
 *                 description: Video file (required if type is 'video')
 *               yt_link:
 *                 type: string
 *                 description: YouTube link (required if type is 'video')
 *               video_title:
 *                 type: string
 *                 description: Title of the video (required if type is 'video')
 *               poster_image_url:
 *                 type: string
 *                 format: binary
 *                 description: Poster image URL (required if type is 'poster')
 *               notice_title:
 *                 type: string
 *                 description: Title of the notice (required if type is 'notice')
 *               notice_description:
 *                 type: string
 *                 description: Description of the notice (required if type is 'notice')
 *               notice_link:
 *                 type: string
 *                 description: Link associated with the notice (required if type is 'notice')
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the promotion
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the promotion
 *     responses:
 *       201:
 *         description: Promotion created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Invalid input or promotion already exists
 *       500:
 *         description: Internal server error
 */
promotionRoute.post('/', upload.single('file'), asyncHandler(promotionController.createPromotion));

/**
 * @swagger
 * /promotion/promotions:
 *   get:
 *     summary: Retrieve all promotions
 *     tags:
 *       - Promotions
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
promotionRoute.get('/promotions', asyncHandler(promotionController.getAllPromotions));

/**
 * @swagger
 * /promotion/{promotionId}:
 *   get:
 *     summary: Retrieve a promotion by ID
 *     tags:
 *       - Promotions
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
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Internal server error
 */
promotionRoute.get('/:promotionId', asyncHandler(promotionController.getPromotionById));

/**
 * @swagger
 * /promotion/{promotionId}:
 *   put:
 *     summary: Update a promotion by ID
 *     tags:
 *       - Promotions
 *     parameters:
 *       - in: path
 *         name: promotionId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the promotion to update
 *     requestBody:
 *       description: Promotion object that needs to be updated
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: ['banner', 'video', 'poster', 'notice']
 *                 description: Type of the promotion
 *               banner_image_url:
 *                 type: string
 *                 format: binary
 *                 description: Banner image URL (required if type is 'banner')
 *               upload_video:
 *                 type: string
 *                 format: binary
 *                 description: Video file (required if type is 'video')
 *               yt_link:
 *                 type: string
 *                 description: YouTube link (required if type is 'video')
 *               video_title:
 *                 type: string
 *                 description: Title of the video (required if type is 'video')
 *               poster_image_url:
 *                 type: string
 *                 format: binary
 *                 description: Poster image URL (required if type is 'poster')
 *               notice_title:
 *                 type: string
 *                 description: Title of the notice (required if type is 'notice')
 *               notice_description:
 *                 type: string
 *                 description: Description of the notice (required if type is 'notice')
 *               notice_link:
 *                 type: string
 *                 description: Link associated with the notice (required if type is 'notice')
 *               startDate:
 *                 type: string
 *                 format: date
 *                 description: Start date of the promotion
 *               endDate:
 *                 type: string
 *                 format: date
 *                 description: End date of the promotion
 *     responses:
 *       200:
 *         description: Promotion updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Promotion'
 *       400:
 *         description: Invalid input or promotion not found
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Internal server error
 */
promotionRoute.put('/:promotionId', upload.single('file'), asyncHandler(promotionController.editPromotion));

/**
 * @swagger
 * /promotion/{promotionId}:
 *   delete:
 *     summary: Delete a promotion by ID
 *     tags:
 *       - Promotions
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
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Promotion not found
 *       500:
 *         description: Internal server error
 */
promotionRoute.delete('/:promotionId', asyncHandler(promotionController.deletePromotion));

module.exports = promotionRoute;