const express = require("express");
const adminController = require("../controllers/adminController");
const asyncHandler = require("../utils/asyncHandler");
const adminRoute = express.Router();

adminRoute.route('/users').get(asyncHandler(adminController.getAllUsers));
adminRoute.route('/users').post(asyncHandler(adminController.createUser));
adminRoute.route('/users/:userId').get(asyncHandler(adminController.getUserById));
adminRoute.route('/users/:userId').put(asyncHandler(adminController.editUser));
adminRoute.route('/users/:userId').delete(asyncHandler(adminController.deleteUser));
adminRoute.route('/users/:membership_id').delete(asyncHandler(adminController.deleteUser));

module.exports = adminRoute;
