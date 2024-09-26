/**
 * @swagger
 * tags:
 *   name: Requirements
 *   description: Operations related to requirements
 */

/**
 * @swagger
 * /requirements:
 *   post:
 *     summary: Create a new requirement
 *     tags: 
 *       - Requirements
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       description: Requirement object that needs to be added to the system
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               author:
 *                 type: string
 *                 description: ID of the user creating the requirement
 *               content:
 *                 type: string
 *                 description: Content of the requirement
 *               status:
 *                 type: string
 *                 description: Status of the requirement
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image associated with the requirement
 *               reason:
 *                 type: string
 *                 description: Reason for the status update (optional)
 *     responses:
 *       201:
 *         description: Requirement created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Requirement'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /requirements:
 *   get:
 *     summary: Fetch all requirements
 *     tags: 
 *       - Requirements
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all requirements
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Requirement'
 *       404:
 *         description: No requirements found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /requirements/{requirementID}:
 *   put:
 *     summary: Update an existing requirement
 *     tags: 
 *       - Requirements
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requirementID
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the requirement to update
 *     requestBody:
 *       description: Requirement object that needs to be updated
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               author:
 *                 type: string
 *                 description: ID of the user creating the requirement
 *               content:
 *                 type: string
 *                 description: Content of the requirement
 *               status:
 *                 type: string
 *                 description: Status of the requirement
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image associated with the requirement
 *               reason:
 *                 type: string
 *                 description: Reason for the status update (optional)
 *     responses:
 *       200:
 *         description: Requirement updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Requirement'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Requirement not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /requirements/{requirementID}:
 *   delete:
 *     summary: Delete a requirement
 *     tags: 
 *       - Requirements
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requirementID
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the requirement to delete
 *     responses:
 *       200:
 *         description: Requirement deleted successfully
 *       404:
 *         description: Requirement not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /requirements/{requirementID}/status:
 *   patch:
 *     summary: Update the status of a requirement
 *     tags: 
 *       - Requirements
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requirementID
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the requirement to update
 *     requestBody:
 *       description: Status update for the requirement
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, approved, rejected]
 *                 description: New status of the requirement
 *               reason:
 *                 type: string
 *                 description: Reason for the status update
 *     responses:
 *       200:
 *         description: Requirement status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Requirement'
 *       400:
 *         description: Invalid status value
 *       404:
 *         description: Requirement not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /requirements/{userId}:
 *   get:
 *     summary: Retrieve requirements for a user by userId
 *     tags: 
 *       - Requirements
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user whose requirements are to be retrieved
 *     responses:
 *       200:
 *         description: Requirements retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Requirement'
 *       400:
 *         description: Invalid request, missing or invalid userId
 *       404:
 *         description: User or requirements not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Requirement:
 *       type: object
 *       properties:
 *         author:
 *           type: string
 *           description: The ID of the user who created the requirement
 *         content:
 *           type: string
 *           description: Content of the requirement
 *         status:
 *           type: string
 *           enum:
 *             - pending
 *             - approved
 *             - rejected
 *           description: Status of the requirement
 *         image:
 *           type: string
 *           description: URL of the image associated with the requirement
 *         reason:
 *           type: string
 *           description: Reason for the status update (if applicable)
 *       required:
 *         - author
 *         - content
 *         - status
 *         - image
 *   responses:
 *     BadRequest:
 *       description: Invalid input
 *     NotFound:
 *       description: Resource not found
 *     InternalServerError:
 *       description: Internal server error
 */
