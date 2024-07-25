const responseHandler = require("../helpers/responseHandler");
const product = require("../models/products");

// Add Product
const addProduct = async (res, data) => {
    try {
        const newProduct = new product(data);
        await newProduct.save();
        return responseHandler(
            res,
            200,
            `Product added successfully..!`,
            newProduct
          );
    } catch (error) {
        console.error(error);
        return responseHandler(res, 500, `Internal Server Error ${error.message}`);
    }
};
// Edit Product
const editProduct = async (res, productId, data) => {
    try {
        const updatedProduct = await product.findByIdAndUpdate(productId, data, { new: true, runValidators: true });
        if (!updatedProduct) {
            return responseHandler(res, 404, "Product not found");
        }
        return responseHandler(res, 200, "Product updated successfully!", updatedProduct);
    } catch (error) {
        console.error(error);
        return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
    }
};
// All Product
const getAllProducts = async (res) => {
    try {
        const products = await product.find().populate({path: 'seller_id', select: 'name membership_id'}).exec(); 
        return responseHandler(res, 200, "Products retrieved successfully", products);
    } catch (error) {
        console.error(error);
        return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
    }
};
module.exports = { addProduct, editProduct, getAllProducts };

