const express = require("express");
const promotionController = require("../controllers/promotionController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middlewares/uploads");
const promotionRoute = express.Router();

// Protect all routes with authentication middleware
promotionRoute.use(authVerify);


promotionRoute.post('/', asyncHandler(promotionController.createPromotion));

promotionRoute.get('/', asyncHandler(promotionController.getAllPromotions));

promotionRoute.get('/:type', asyncHandler(promotionController.getPromotionsByType));

// promotionRoute.get('/:promotionId', asyncHandler(promotionController.getPromotionById));

promotionRoute.get('/:type/:promotionId', asyncHandler(promotionController.getPromotionsByTypeAndId));

promotionRoute.put('/:promotionId', upload.single("file"), asyncHandler(promotionController.editPromotion));
promotionRoute.delete('/:promotionId', asyncHandler(promotionController.deletePromotion));

module.exports = promotionRoute;