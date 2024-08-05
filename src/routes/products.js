const express = require('express');
const productController = require('../controllers/productController');
const authVerify = require('../middlewares/authVerify');
const asyncHandler = require('../utils/asyncHandler');
const productRoute = express.Router();

productRoute.use(authVerify);

productRoute.post('/', asyncHandler(productController.addProduct));
productRoute.get('/', asyncHandler(productController.getAllProducts));

productRoute.get('/:productId', asyncHandler(productController.getProductsById));
productRoute.put('/:productId', asyncHandler(productController.editProduct));
productRoute.delete('/:productId', asyncHandler(productController.deleteProduct));

productRoute.get('/seller/:sellerId', asyncHandler(productController.getProductsBySeller));

module.exports = productRoute;
