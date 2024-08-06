/**
 * @swagger
 * /news:
 *   post:
 *     summary: Create a new news article
 *     tags:
 *       - News
 *     requestBody:
 *       description: News article object that needs to be created
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 example: "Technology"
 *               title:
 *                 type: string
 *                 example: "New Tech Innovations"
 *               image:
 *                 type: string
 *                 format: binary
 *               content:
 *                 type: string
 *                 example: "Detailed content about the news article."
 *     responses:
 *       201:
 *         description: News article created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       400:
 *         description: Invalid input or news article already exists
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
 *     summary: Retrieve a news article by ID
 *     tags:
 *       - News
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
 *       400:
 *         description: Invalid request
 *       404:
 *         description: News article not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /news/{newsId}:
 *   put:
 *     summary: Update a news article by ID
 *     tags:
 *       - News
 *     parameters:
 *       - in: path
 *         name: newsId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the news article to update
 *     requestBody:
 *       description: News article object that needs to be updated
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               category:
 *                 type: string
 *                 example: "Technology"
 *               title:
 *                 type: string
 *                 example: "Updated Tech Innovations"
 *               image:
 *                 type: string
 *                 format: binary
 *               content:
 *                 type: string
 *                 example: "Updated detailed content about the news article."
 *     responses:
 *       200:
 *         description: News article updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/News'
 *       400:
 *         description: Invalid input or news article not found
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
 *       400:
 *         description: Invalid request
 *       404:
 *         description: News article not found
 *       500:
 *         description: Internal server error
 */