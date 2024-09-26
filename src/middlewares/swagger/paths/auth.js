/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: API for managing admins and authentication
 */

/**
 * @swagger
 * /auth:
 *   post:
 *     summary: Create a new admin
 *     tags:
 *       - Admin create and Auth
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Admin'
 *     responses:
 *       201:
 *         description: Admin created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
/**
 * @swagger
 * /auth:
 *   get:
 *     summary: Retrieve all admins
 *     tags:
 *       - Admin create and Auth
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Admins retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Admin'
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Admin login
 *     tags:
 *       - Admin create and Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       400:
 *         description: Invalid email or password
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Admin logout
 *     tags:
 *       - Admin create and Auth
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/{adminId}:
 *   get:
 *     summary: Retrieve an admin by ID
 *     tags:
 *       - Admin create and Auth
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         description: The ID of the admin to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Admin retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 *   put:
 *     summary: Edit an existing admin
 *     tags:
 *       - Admin
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         description: The ID of the admin to edit
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Admin'
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /auth/{adminId}:
 *   put:
 *     summary: Edit an existing admin
 *     tags:
 *       - Admin create and Auth
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the admin to be edited
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The admin's name
 *               email:
 *                 type: string
 *                 description: The admin's email
 *               password:
 *                 type: string
 *                 description: The admin's new password (optional)
 *               role:
 *                 type: string
 *                 enum: [admin, super admin]
 *                 description: The role assigned to the admin
 *     responses:
 *       200:
 *         description: Admin updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Admin'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Admin not found
 *       500:
 *         description: Internal server error
 */


/**
 * @swagger
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - password
 *         - role
 *       properties:
 *         name:
 *           type: string
 *           description: The admin's name
 *         email:
 *           type: string
 *           format: email
 *           description: The admin's email address
 *         password:
 *           type: string
 *           description: The admin's password
 *         role:
 *           type: string
 *           enum: [admin, super admin]
 *           description: The role assigned to the admin
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: The date the admin was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: The date the admin was last updated
 */
