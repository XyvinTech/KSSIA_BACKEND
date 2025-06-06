const express = require('express');
const productController = require('../controllers/productController');
const authVerify = require('../middlewares/authVerify');
const asyncHandler = require('../utils/asyncHandler');
const upload = require('../middlewares/uploads');

const productRoute = express.Router();

// Protect all routes with authentication middleware
productRoute.use(authVerify);

productRoute.get("/download-products", productController.downloadProducts);

// Route to add a new product
productRoute.post('/', asyncHandler(productController.addProduct));

// Route to retrieve all products
productRoute.get('/', asyncHandler(productController.getAllProductsUser));

// Route to retrieve all products admin
productRoute.get('/admin', asyncHandler(productController.getAllProducts));

productRoute.get("/categories", asyncHandler(productController.getAllCategories));

// Route to retrieve a single product by ID
productRoute.get('/:productId', asyncHandler(productController.getProductsById));
productRoute.get('/user/:productId', asyncHandler(productController.getUserProductsById));
// Route to update a product by ID
productRoute.put('/:productId', asyncHandler(productController.editProduct));

// Route to delete a product by ID
productRoute.delete('/:productId', asyncHandler(productController.deleteProduct));

// Route to retrieve products by seller ID
productRoute.get('/seller/:sellerId', asyncHandler(productController.getProductsBySeller));

// Route to get message count of products
productRoute.get('/seller/messages/count', asyncHandler(productController.getMessageCount)); 

// Route to update the status of a product
productRoute.patch('/:productId/status', asyncHandler(productController.updateProductStatus));


module.exports = productRoute;
