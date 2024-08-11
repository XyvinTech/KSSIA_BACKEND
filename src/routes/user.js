const express = require("express");
const userController = require("../controllers/userController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const userRoute = express.Router();

// userRoute
//     .route("/login")
//     .post(asyncHandler(userController.loginWithOTP))

// userRoute  
//     .route("/login/:mobile")
//     .get(asyncHandler(userController.sendOTPForLogin))


// Edit an existing user
userRoute
    .route('/edit/:userId')
    .put(asyncHandler(userController.editProfile))

userRoute  
    .route("/search/:name")
    .get(asyncHandler(userController.findUserByName))

userRoute 
    .route("/find/:membershipId")
    .get(asyncHandler(userController.findUserByMembershipId))

// userRoute.use(authVerify);

module.exports = userRoute;