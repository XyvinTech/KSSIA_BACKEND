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
adminRoute.put('/users/:userId', async (req, res) => {
    const userId = req.params.userId;
    const data = req.body;
    await adminController.editUser(res, userId, data);
});


module.exports = adminRoute;