const express = require("express");
const adminController = require("../controllers/adminController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const adminRoute = express.Router();

// adminRoute.use(authVerify);

// get all user and add user
adminRoute
  .route("/users")
  .post(asyncHandler(adminController.createUser))
  .get(asyncHandler(adminController.getAllUsers))
  .delete(asyncHandler(adminController.deleteUser))


// Edit an existing user
adminRoute
.route('/users/:userId')
.get(asyncHandler(adminController.getUserById))
.put(asyncHandler(adminController.editUser))


module.exports = adminRoute;