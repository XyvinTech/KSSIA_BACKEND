const express = require('express');
const authRoute = express.Router();
const asyncHandler = require('../utils/asyncHandler');
const authController = require('../controllers/auth.controller');

// Admin routes
authRoute.post('/login', asyncHandler(authController.login));
authRoute.post('/logout', asyncHandler(authController.logout));
authRoute.post('/', asyncHandler(authController.createAdmin)); // Create admin
authRoute.put('/:id', asyncHandler(authController.editAdmin)); // Edit admin
authRoute.get('/all', asyncHandler(authController.getAllAdmins)); // Get all admins
authRoute.get('/admin/:id', asyncHandler(authController.getAdminById)); // Get admin by ID
authRoute.get('/', asyncHandler(authController.getAdmin)); // Get admin details

module.exports = authRoute;
