const responseHandler = require("../helpers/responseHandler");
const Product = require("../models/products");

// Add Product
exports.addProduct = async (req, res) => {
    try {

        const data = req.body;

        // Create a new product
        const newProduct = new Product(data);
        await newProduct.save();

        return responseHandler( res, 201, `Product added successfully!`, newProduct );

    } catch (error) {
        console.error(error);
        return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

// Edit Product
exports.editProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const data = req.body;

        // Find and update the product
        const updatedProduct = await Product.findByIdAndUpdate(productId, data, { new: true, runValidators: true });

        if (!updatedProduct) {
            return responseHandler(res, 404, "Product not found");
        }

        return responseHandler(res, 200, "Product updated successfully!", updatedProduct);
        
    } catch (error) {
        console.error(error);
        return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().populate({ path: 'seller_id', select: 'name membership_id' }).exec();
        return responseHandler(res, 200, "Products retrieved successfully", products);
    } catch (error) {
        console.error(error);
        return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
    }
};

// Get product by id
exports.getProductsById = async (req, res) => {
    try {
        const { productId } = req.params;

        // Check if the productId is present in the request
        if (!productId) {
            return responseHandler(res, 400, "Product ID is required");
        }

        // Check if the product exist in the database
        const product = await Product.findById(productId).populate({ path: 'seller_id', select: 'name membership_id' }).exec();
        if (!product) {
            return responseHandler(res, 404, "Product not found");
        }
        return responseHandler(res, 200, "Product retrieved successfully", product);
    
    } catch (error) {
        console.error(error);
        return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
    }
}

// Get products by a single seller
exports.getProductsBySeller = async (req, res) => {
    try {
        const { sellerId } = req.params;

        // Check if sellerId exist in the parameter
        if (!sellerId) {
            return responseHandler(res, 400, "Seller ID is required");
        }

        // Check if the products by the seller exist in the database
        const products = await Product.find({ seller_id: sellerId }).populate({ path: 'seller_id', select: 'name membership_id' }).exec();
        if(!products){
            return responseHandler(res, 404, "Seller has no products");
        }
        return responseHandler(res, 200, "Products retrieved successfully", products);
    
    } catch (error) {
        console.error(error);
        return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
    }
}