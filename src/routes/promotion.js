const express = require("express");
const promotionController = require("../controllers/promotionController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const promotionRoute = express.Router();
const upload = require("../middlewares/uploads");


// Protect all routes with authentication middleware
promotionRoute.use(authVerify);

// Get all promotions and add a new promotion
promotionRoute
  .route("/promotions")
  .post(upload.single('file'), asyncHandler(promotionController.createPromotion))
  .get(asyncHandler(promotionController.getAllPromotions));

// Edit an existing promotion by ID
promotionRoute
  .route("/promotions/:promotionId")
  .get(asyncHandler(promotionController.getPromotionById))
  .put(upload.single('file'), asyncHandler(promotionController.editPromotion));

// Delete a promotion by ID
promotionRoute
  .route("/promotions/:promotionId")
  .delete(asyncHandler(promotionController.deletePromotion));

module.exports = promotionRoute;
