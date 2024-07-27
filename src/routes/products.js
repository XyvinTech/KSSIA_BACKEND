const express = require("express");
const productController = require("../controllers/productController");
const authVerify = require("../middlewares/authVerify");
const productRoute = express.Router();

productRoute.use(authVerify);

// get all products and add products
productRoute
  .route("/products")
  .post(productController.addProduct)
  .get(productController.getAllProducts)

// Edit an existing product
productRoute
  .route('/products/:productId')
  .get(productController.getProductsById)
  .put(productController.editProduct)

productRoute
  .route('products/seller/:sellerId')
  .get(productController.getProductsBySeller)

module.exports = productRoute;