const express = require("express");
const userController = require("../controllers/userController");
const asyncHandler = require("../utils/asyncHandler");
const userRoute = express.Router();

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
userRoute
  .route("/login")
  .post(asyncHandler(userController.verifyOtp));

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
userRoute  
  .route("/login/:mobile")
  .get(asyncHandler(userController.sendOtp));

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
userRoute
  .route('/edit/:userId')
  .put(asyncHandler(userController.editProfile));

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
userRoute  
  .route("/search/:name")
  .get(asyncHandler(userController.findUserByName));

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
userRoute 
  .route("/find/:membershipId")
  .get(asyncHandler(userController.findUserByMembershipId));

module.exports = userRoute;