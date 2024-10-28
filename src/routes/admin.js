const express = require("express");
const adminController = require("../controllers/adminController");
const asyncHandler = require("../utils/asyncHandler");
const authVerify = require("../middlewares/authVerify");
const adminRoute = express.Router();

adminRoute.use(authVerify);

adminRoute.route('/users').get(asyncHandler(adminController.getAllUsers));
adminRoute.route('/users').post(asyncHandler(adminController.createUser));
adminRoute.route('/users/bulk').post(asyncHandler(adminController.createUserBulk));
adminRoute.route('/users/:userId').get(asyncHandler(adminController.getUserById));
adminRoute.route('/users/:userId').put(asyncHandler(adminController.editUser));
adminRoute.route('/users/:userId').delete(asyncHandler(adminController.deleteUser));
adminRoute.route('/users/:membership_id').delete(asyncHandler(adminController.deleteUser));
adminRoute.route('/users/suspend/:userId').put(asyncHandler(adminController.suspendUser));
adminRoute.get("/download-users", adminController.downloadUsers);

module.exports = adminRoute;
