/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: Report management
 */

/**
 * @swagger
 * /report:
 *   post:
 *     summary: Create a report
 *     tags: [Reports]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content of the report
 *               reportType:
 *                 type: string
 *                 enum: [product, requirement, user, chat]
 *                 description: The type of report being created
 *               reportedItemId:
 *                 type: string
 *                 description: ID of the item being reported
 *     responses:
 *       201:
 *         description: Report created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Report created successfully"
 *                 data:
 *                   type: object
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /report:
 *   get:
 *     summary: Get all reports
 *     tags: [Reports]
 *     parameters:
 *       - in: query
 *         name: pageNo
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *           example: "search term"
 *     responses:
 *       200:
 *         description: Reports retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Reports retrieved successfully!"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /report/{reportid}:
 *   delete:
 *     summary: Delete a report by ID
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: reportid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Report deleted successfully..!"
 *       404:
 *         description: Report not found
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /report/{reportid}:
 *   get:
 *     summary: Get a report by ID
 *     tags: [Reports]
 *     parameters:
 *       - in: path
 *         name: reportid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report found successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Report found successfully!"
 *                 data:
 *                   type: object
 *       404:
 *         description: Report not found
 *       500:
 *         description: Internal Server Error
 */
