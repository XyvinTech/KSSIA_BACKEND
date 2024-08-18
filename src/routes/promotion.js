const express = require("express");
const promotionController = require("../controllers/promotionController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const upload = require("../middlewares/uploads");
const promotionRoute = express.Router();

// Protect all routes with authentication middleware
promotionRoute.use(authVerify);


promotionRoute.post('/', upload.fields([
    { name: 'banner_image_url', maxCount: 1 },
    { name: 'upload_video', maxCount: 1 },
    { name: 'poster_image_url', maxCount: 1 }
  ]), asyncHandler(promotionController.createPromotion));

promotionRoute.get('/', asyncHandler(promotionController.getAllPromotions));

promotionRoute.get('/:promotionId', asyncHandler(promotionController.getPromotionById));
promotionRoute.put('/:promotionId', upload.fields([
    { name: 'banner_image_url', maxCount: 1 },
    { name: 'upload_video', maxCount: 1 },
    { name: 'poster_image_url', maxCount: 1 }
  ]), asyncHandler(promotionController.editPromotion));
promotionRoute.delete('/:promotionId', asyncHandler(promotionController.deletePromotion));

module.exports = promotionRoute;