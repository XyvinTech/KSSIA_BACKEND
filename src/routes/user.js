const express = require("express");
const userController = require("../controllers/userController");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middlewares/uploads");
const userRoute = express.Router();

// userRoute
//     .route("/login")
//     .post(asyncHandler(userController.loginWithOTP))

// Edit an existing user
userRoute
    .route('/edit/:userId')
    .put(asyncHandler(userController.editProfile))

userRoute  
  .route("/:userId")
  .get(asyncHandler(userController.getUserById));

userRoute
  .route("/upload")
  .put(upload.single('file'),asyncHandler(userController.uploadImages));

userRoute
  .route('/edit/:userId')
  .put(asyncHandler(userController.editProfile));
  
userRoute  
  .route("/search/:name")
  .get(asyncHandler(userController.findUserByName));

userRoute 
  .route("/find/:membershipId")
  .get(asyncHandler(userController.findUserByMembershipId));

module.exports = userRoute;