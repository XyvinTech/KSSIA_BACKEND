const express = require("express");
const adminController = require("../controllers/adminController");
const authVerify = require("../middlewares/authVerify");
const adminRoute = express.Router();

// adminRoute.use(authVerify);

// get all user and add user
adminRoute
  .route("/users")
  .post(adminController.createUser)
  .get(adminController.getAllUsers)
  .delete(adminController.deleteUser)


// Edit an existing user
adminRoute
.route('/users/:userId')
.get(adminController.getUserById)
.put(adminController.editUser)


module.exports = adminRoute;