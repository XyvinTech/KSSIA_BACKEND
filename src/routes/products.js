const express = require("express");
const productController = require("../controllers/productController");
const authVerify = require("../middlewares/authVerify");
const asyncHandler = require("../utils/asyncHandler");
const productRoute = express.Router();

productRoute.use(authVerify);

// get all products and add products
productRoute
  .route("/products")
  .post(asyncHandler(productController.addProduct))
  .get(asyncHandler(productController.getAllProducts))

// Edit an existing product
productRoute
  .route('/products/:productId')
  .get(asyncHandler(productController.getProductsById))
  .put(asyncHandler(productController.editProduct))

productRoute
  .route('products/seller/:sellerId')
  .get(asyncHandler(productController.getProductsBySeller))

module.exports = productRoute;