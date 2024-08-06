const express = require('express');
const productController = require('../controllers/productController');
const authVerify = require('../middlewares/authVerify');
const asyncHandler = require('../utils/asyncHandler');
const upload = require('../middlewares/uploads');

const productRoute = express.Router();

// Protect all routes with authentication middleware
productRoute.use(authVerify);

// Route to add a new product
productRoute.post('/', upload.single('file'), asyncHandler(productController.addProduct));

// Route to retrieve all products
productRoute.get('/', asyncHandler(productController.getAllProducts));

// Route to retrieve a single product by ID
productRoute.get('/:productId', asyncHandler(productController.getProductsById));

// Route to update a product by ID
productRoute.put('/:productId', upload.single('file'), asyncHandler(productController.editProduct));

// Route to delete a product by ID
productRoute.delete('/:productId', asyncHandler(productController.deleteProduct));

// Route to retrieve products by seller ID
productRoute.get('/seller/:sellerId', asyncHandler(productController.getProductsBySeller));

module.exports = productRoute;
