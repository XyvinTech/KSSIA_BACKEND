const express = require("express");
const userController = require("../controllers/userController");
const asyncHandler = require("../utils/asyncHandler");
const authVerify = require("../middlewares/authVerify");
const userRoute = express.Router();


userRoute
  .route("/login")
  .post(asyncHandler(userController.loginUser));

userRoute  
  .route("/login/:mobile")
  .get(asyncHandler(userController.sendOtp));

userRoute  
  .route("/qr/:userId")
  .get(asyncHandler(userController.getUserById));

userRoute.use(authVerify);

userRoute  
  .route("/:userId")
  .get(asyncHandler(userController.getUserById));

userRoute
  .route('/edit/:userId')
  .put(asyncHandler(userController.editProfile));
  
userRoute  
  .route("/search/:name")
  .get(asyncHandler(userController.findUserByName));

userRoute 
  .route("/find/:membershipId")
  .get(asyncHandler(userController.findUserByMembershipId));

userRoute 
  .route('/:userId/reviews')
  .post(asyncHandler(userController.addReview));

userRoute 
  .route('/:userId/reviews/:reviewId')
  .delete(asyncHandler(userController.deleteReview));

userRoute
  .route('/block/:blockUserId')
  .post(asyncHandler(userController.blockUser)); // Block a user

userRoute
  .route('/unblock/:blockedUserId')
  .post(asyncHandler(userController.unblockUser)); // Unblock a user

module.exports = userRoute;