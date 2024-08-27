require("dotenv").config();
const path = require("path");
const responseHandler = require("../helpers/responseHandler");
const Product = require("../models/products");
const { productsSchemaval } = require("../validation");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");

/****************************************************************************************************/
/*                                    Function to add product                                       */
/****************************************************************************************************/
exports.addProduct = async (req, res) => {
  const data = req.body;

  // Validate the input data
  const { error } = productsSchemaval.validate(data, {
    abortEarly: true,
  });

  if (error) {
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  // Check if the product exists in the database
  const productExist = await Product.findOne({
    name: data.name,
    seller_id: data.seller_id,
  });
  if (productExist) {
    return responseHandler(res, 400, "Product already exists");
  }

  // Handle file upload if present
  let image = "";
  const bucketName = process.env.AWS_S3_BUCKET;
  if (req.file) {
    try {
      image = await handleFileUpload(req.file, bucketName);
    } catch (err) {
      return responseHandler(res, 500, err.message);
    }
  }

  // Create a new product
  const newProduct = new Product({ ...data, image });
  await newProduct.save();

  return responseHandler(res, 201, "Product added successfully!", newProduct);
};

/****************************************************************************************************/
/*                                    Function to edit product                                      */
/****************************************************************************************************/
exports.editProduct = async (req, res) => {
  const { productId } = req.params;
  const data = req.body;

  // Validate the presence of the productId in the request
  if (!productId) {
    return responseHandler(res, 400, "Invalid request");
  }

  // Validate the input data
  const { error } = productsSchemaval.validate(data, {
    abortEarly: true,
  });

  if (error) {
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  const product = await Product.findById(productId);
  if (!product) {
    return responseHandler(res, 404, "Product not found");
  }

  // Handle file upload if present
  const bucketName = process.env.AWS_S3_BUCKET;
  let image = product.image;
  if (req.file) {
    if (product.image) {
      let oldImageKey = path.basename(product.image);
      await deleteFile(bucketName, oldImageKey);
    }
    try {
      image = await handleFileUpload(req.file, bucketName);
    } catch (err) {
      return responseHandler(res, 500, err.message);
    }
  }

  // Update the product
  Object.assign(product, data, { image });
  await product.save();

  return responseHandler(res, 200, "Product updated successfully!", product);
};

/****************************************************************************************************/
/*                                  Function to get all products                                    */
/****************************************************************************************************/
exports.getAllProducts = async (req, res) => {
  const products = await Product.find()
    .populate({ path: "seller_id", select: "name membership_id" })
    .exec();
  const mappedProducts = products.map((product) => {
    return {
      ...product._doc,
      full_name: `${product.seller_id?.name.first_name} ${product.seller_id?.name.middle_name} ${product.seller_id?.name.last_name}`,
    };
  });
  return responseHandler(
    res,
    200,
    "Products retrieved successfully!",
    mappedProducts
  );
};

/****************************************************************************************************/
/*                                 Function to get product by id                                    */
/****************************************************************************************************/
exports.getProductsById = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return responseHandler(res, 400, "Invalid request");
  }

  const product = await Product.findById(productId)
    .populate({ path: "seller_id", select: "name membership_id" })
    .exec();
  if (!product) {
    return responseHandler(res, 404, "Product not found");
  }

  return responseHandler(res, 200, "Product retrieved successfully!", product);
};

/****************************************************************************************************/
/*                          Function to get products by a single seller                             */
/****************************************************************************************************/
exports.getProductsBySeller = async (req, res) => {
  const { sellerId } = req.params;

  if (!sellerId) {
    return responseHandler(res, 400, "Invalid request");
  }

  const products = await Product.find({ seller_id: sellerId })
    .populate({ path: "seller_id", select: "name membership_id" })
    .exec();
  if (!products.length) {
    return responseHandler(res, 404, "Seller has no products");
  }

  return responseHandler(
    res,
    200,
    "Products retrieved successfully!",
    products
  );
};

/****************************************************************************************************/
/*                                   Function to delete product                                     */
/****************************************************************************************************/
exports.deleteProduct = async (req, res) => {
  const { productId } = req.params;

  if (!productId) {
    return responseHandler(res, 400, "Invalid request");
  }

  const product = await Product.findByIdAndDelete(productId);
  if (!product) {
    return responseHandler(
      res,
      404,
      "Product with the given ID does not exist in the database"
    );
  }

  if (product.image) {
    const bucketName = process.env.AWS_S3_BUCKET;
    try {
      let oldImageKey = path.basename(product.image);
      await deleteFile(bucketName, oldImageKey);
    } catch (err) {
      return responseHandler(res, 500, `Error deleting file: ${err.message}`);
    }
  }

  return responseHandler(res, 200, "Product deleted successfully!");
};
