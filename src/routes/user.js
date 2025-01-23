const express = require("express");
const userController = require("../controllers/userController");
const asyncHandler = require("../utils/asyncHandler");
const authVerify = require("../middlewares/authVerify");
const userRoute = express.Router();

userRoute.route("/login").post(asyncHandler(userController.loginUser));

userRoute.route("/login/:mobile").get(asyncHandler(userController.sendOtp));

userRoute.route("/qr/:userId").get(asyncHandler(userController.getUserById));

userRoute.get("/app-version", userController.getVersion);

userRoute.post("/enquiry", asyncHandler(userController.sendEnquiry));

userRoute.use(authVerify);

userRoute.route("/:userId").get(asyncHandler(userController.getUserById));

userRoute.route("/edit/:userId").put(asyncHandler(userController.editProfile));

userRoute.get("/enquiry", asyncHandler(userController.getEnquiry));

userRoute
  .route("/search/:name")
  .get(asyncHandler(userController.findUserByName));

userRoute
  .route("/find/:membershipId")
  .get(asyncHandler(userController.findUserByMembershipId));

userRoute
  .route("/:userId/reviews")
  .post(asyncHandler(userController.addReview));

userRoute
  .route("/:userId/reviews/:reviewId")
  .delete(asyncHandler(userController.deleteReview));

userRoute
  .route("/block/products/:blockUserId")
  .post(asyncHandler(userController.blockProduct)); // Block products by a user

userRoute
  .route("/unblock/products/:blockedUserId")
  .post(asyncHandler(userController.unblockProduct)); // Unblock products by a user

userRoute
  .route("/block/requirements/:blockUserId")
  .post(asyncHandler(userController.blockRequirement)); // Block requirements by a user

userRoute
  .route("/unblock/requirements/:blockedUserId")
  .post(asyncHandler(userController.unblockRequirement)); // Unblock requirements by a user

userRoute
  .route("/block/:blockUserId")
  .post(asyncHandler(userController.blockUser)); // Block a user

userRoute
  .route("/unblock/:blockedUserId")
  .post(asyncHandler(userController.unblockUser)); // Unblock a user

userRoute.route("/request/nfc").post(asyncHandler(userController.requestNFC)); // Request NFC

userRoute
  .route("/get/subscription")
  .get(asyncHandler(userController.getUserSubscription)); // Get user subscription

userRoute.put(
  "/subscription/:id",
  asyncHandler(userController.updateSubscription)
);

module.exports = userRoute;
