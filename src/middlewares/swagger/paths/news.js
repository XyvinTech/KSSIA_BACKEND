/**
 * @swagger
 * tags:
 *   name: News
 *   description: API endpoints for managing news articles
 */

/**
 * @swagger
 * /news:
 *   post:
 *     summary: Create a new news article
 *     tags: 
 *       - News
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: News article object that needs to be added to the system. Includes file uploads for images.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: News article created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /news:
 *   get:
 *     summary: Retrieve all news articles
 *     tags: 
 *       - News
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: News articles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/News'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /news/{newsId}:
 *   get:
 *     summary: Retrieve a single news article by ID
 *     tags: 
 *       - News
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: newsId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the news article to retrieve
 *     responses:
 *       200:
 *         description: News article retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       404:
 *         description: News article not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /news/{newsId}:
 *   put:
 *     summary: Update an existing news article by ID
 *     tags: 
 *       - News
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: newsId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the news article to update
 *     requestBody:
 *       description: News article object that needs to be updated. Includes file uploads for images.
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *               title:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: News article updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: News article not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /news/{newsId}:
 *   delete:
 *     summary: Delete a news article by ID
 *     tags: 
 *       - News
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: newsId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the news article to delete
 *     responses:
 *       200:
 *         description: News article deleted successfully
 *       404:
 *         description: News article not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     News:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: The unique identifier for the news article
 *         category:
 *           type: string
 *         title:
 *           type: string
 *         image:
 *           type: string
 *           description: URL of the news image
 *         content:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the news article was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date and time when the news article was last updated
 */
