const express = require("express");
const userController = require("../controllers/userController");
const authVerify = require("../middlewares/authVerify");
const userRoute = express.Router();

userRoute
    .route("/login")
    .post(userController.verifyOtp)

userRoute  
    .route("/login/:mobile")
    .get(userController.sendOtp)


// Edit an existing user
userRoute
    .route('/edit/:userId')
    .put(userController.editProfile)

// userRoute.use(authVerify);

module.exports = userRoute;