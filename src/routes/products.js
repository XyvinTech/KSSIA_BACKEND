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
.put(productController.editProduct)


module.exports = productRoute;