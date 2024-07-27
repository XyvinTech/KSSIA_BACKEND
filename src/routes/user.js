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

userRoute  
    .route("/search/:name")
    .get(userController.findUserByName)

userRoute 
    .route("/find/:membershipId")
    .get(userController.findUserByMembershipId)

// userRoute.use(authVerify);

module.exports = userRoute;