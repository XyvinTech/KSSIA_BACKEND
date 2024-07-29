const responseHandler = require("../helpers/responseHandler");
const Product = require("../models/products");
const { productsSchemaval } = require("../validation");

/****************************************************************************************************/
/*                                    Function to add product                                       */
/****************************************************************************************************/

exports.addProduct = async (req, res) => {

    const data = req.body;
    // console.log(`Received data parameter: ${data}`);                                 // Debug line

    // Validate the input data
    const { error } = productsSchemaval.validate(data, {
        abortEarly: true
    });

    // Check if an error exists in the validation
    if (error) {
        // If an error exists, return a 400 status code with the error message
        // console.log('Invalid input: ${error.message}');                              // Debug line
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    // Check if the product exist in the database
    const productExist = await Product.findOne({ name: data.name , seller_id: data.seller_id});
    if (productExist) {
        // console.log(`Product already exist`);                                        // Debug line
        return responseHandler(res, 400, "Product already exist");
    }

    // Create a new product
    const newProduct = new Product(data);
    await newProduct.save();

    // console.log(`Product added successfully!`);                                      // Debug line
    return responseHandler( res, 201, `Product added successfully!`, newProduct );

};

/****************************************************************************************************/
/*                                    Function to edit product                                      */
/****************************************************************************************************/

exports.editProduct = async (req, res) => {

    const { productId } = req.params;
    const data = req.body;

    // Validate the presence of the productId in the request
    if (!productId) {
        // console.log(`productId is required`);                                        // Debug line
        return responseHandler(res, 400, "Invalid request");
    }

    // Validate the input data
    const { error } = productsSchemaval.validate(data, {
        abortEarly: true
    });
    
    // Check if an error exists in the validation
    if (error) {
        // If an error exists, return a 400 status code with the error message
        // console.log('Invalid input: ${error.message}');                              // Debug line
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    // Find and update the product
    const updatedProduct = await Product.findByIdAndUpdate(productId, data, { new: true, runValidators: true });

    if (!updatedProduct) {
        // console.log(`Product not found`);                                            // Debug line
        return responseHandler(res, 404, "Product not found");
    }

    // console.log(`Product updated successfully! ${updatedProduct}`);                  // Debug line
    return responseHandler(res, 200, "Product updated successfully!", updatedProduct);
        
};

/****************************************************************************************************/
/*                                  Function to get ll Products                                     */
/****************************************************************************************************/

exports.getAllProducts = async (req, res) => {

    const products = await Product.find().populate({ path: 'seller_id', select: 'name membership_id' }).exec();
    // console.log(Products retrieved successfully! ${products});                       // Debug line
    return responseHandler(res, 200, "Products retrieved successfully!", products);

};

/****************************************************************************************************/
/*                                 Function to get product by id                                    */
/****************************************************************************************************/

exports.getProductsById = async (req, res) => {

    const { productId } = req.params;
    // console.log(productId);                                                          // Debug line

    // Check if the productId is present in the request
    if (!productId) {
        // console.log(`productId is required`);                                        // Debug line
        return responseHandler(res, 400, "Invalid request");
    }

    // Check if the product exist in the database
    const product = await Product.findById(productId).populate({ path: 'seller_id', select: 'name membership_id' }).exec();
    if (!product) {
        // console.log(`Product not found`);                                            // Debug line
        return responseHandler(res, 404, "Product not found");
    }

    // console.log(`Product retrieved successfully!  ${product}`);                      // Debug line
    return responseHandler(res, 200, "Product retrieved successfully!", product);
    
}

/****************************************************************************************************/
/*                          Function to get products by a single seller                             */
/****************************************************************************************************/

exports.getProductsBySeller = async (req, res) => {

    const { sellerId } = req.params;
    // console.log(sellerId);                                                           // Debug line

    // Check if sellerId exist in the parameter
    if (!sellerId) {
        // console.log(`sellerId is required`);                                         // Debug line
        return responseHandler(res, 400, "Invalid request");
    }

    // Check if the products by the seller exist in the database
    const products = await Product.find({ seller_id: sellerId }).populate({ path: 'seller_id', select: 'name membership_id' }).exec();
    if(!products){
        // console.log(`No products found for the seller`);                             // Debug line
        return responseHandler(res, 404, "Seller has no products");
    }

    // console.log(`Products retrieved successfully!  ${products}`);                    // Debug line
    return responseHandler(res, 200, "Products retrieved successfully!", products);

}

/****************************************************************************************************/
/*                                   Function to delete product                                     */
/****************************************************************************************************/

exports.deleteProduct = async (req, res) => {

    const { productId } = req.params;
    // console.log(productId);                                                          // Debug line

    // Check if productId exist in the parameter
    if (!productId) {
        // console.log(`productId is required`);                                        // Debug line
        return responseHandler(res, 400, "Invalid request");
    }

    // Check if the products by the productId exist in the database
    const product = await Product.findOneAndDelete({ _id: productId });
    if(!product){
        // console.log(`No product found for the productId provided`);                  // Debug line
        return responseHandler(res, 404, "Product with the given ID do not exist in the database");
    }

    // console.log(`Product deleted successfully!`);                                    // Debug line
    return responseHandler(res, 200, "Products Deleted successfully!");

}