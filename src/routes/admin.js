const express = require("express");
const adminController = require("../controllers/adminController");
const authVerify = require("../middlewares/authVerify");
const adminRoute = express.Router();

adminRoute.use(authVerify);

// get all user and add user
adminRoute
  .route("/users")
  .post(adminController.createUser)
  .get(adminController.getAllUsers)

// Edit an existing user
adminRoute
.route('/users/:userId')
.put(adminController.editUser)


module.exports = adminRoute;