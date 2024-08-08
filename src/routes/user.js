const express = require("express");
const userController = require("../controllers/userController");
const asyncHandler = require("../utils/asyncHandler");
const userRoute = express.Router();


userRoute
  .route("/login")
  .post(asyncHandler(userController.verifyOtp));

userRoute  
  .route("/login/:mobile")
  .get(asyncHandler(userController.sendOtp));

userRoute
  .route('/edit/:userId')
  .put(upload.fields([
    { name: 'profile_picture', maxCount: 1 },
    { name: 'certificates', maxCount: 5 },
    { name: 'brochures', maxCount: 5 },
    { name: 'awards', maxCount: 5 },
    { name: 'product_images', maxCount: 10 }
  ]), asyncHandler(userController.editProfile));
  
userRoute  
  .route("/search/:name")
  .get(asyncHandler(userController.findUserByName));

userRoute 
  .route("/find/:membershipId")
  .get(asyncHandler(userController.findUserByMembershipId));

module.exports = userRoute;