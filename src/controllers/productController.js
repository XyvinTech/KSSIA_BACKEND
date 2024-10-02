require("dotenv").config();
const path = require("path");
const responseHandler = require("../helpers/responseHandler");
const Product = require("../models/products");
const User = require("../models/user");
const Message = require("../models/messages");
const {
  productsSchemaval
} = require("../validation");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");

/****************************************************************************************************/
/*                                    Function to add product                                       */
/****************************************************************************************************/
exports.addProduct = async (req, res) => {
  const data = req.body;

  // Validate the input data
  const {
    error
  } = productsSchemaval.validate(data, {
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
  const newProduct = new Product({
    ...data,
    image
  });
  await newProduct.save();

  return responseHandler(res, 201, "Product added successfully!", newProduct);
};

/****************************************************************************************************/
/*                                    Function to edit product                                      */
/****************************************************************************************************/
exports.editProduct = async (req, res) => {
  const {
    productId
  } = req.params;
  const data = req.body;

  // Validate the presence of the productId in the request
  if (!productId) {
    return responseHandler(res, 400, "Invalid request");
  }

  // Validate the input data
  const {
    error
  } = productsSchemaval.validate(data, {
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
  Object.assign(product, data, {
    image
  });
  await product.save();

  return responseHandler(res, 200, "Product updated successfully!", product);
};

/****************************************************************************************************/
/*                                  Function to get all products                                    */
/****************************************************************************************************/
exports.getAllProducts = async (req, res) => {

  const {
    pageNo = 1, limit = 10
  } = req.query;
  const skipCount = limit * (pageNo - 1);
  let filter = {};

  // Get total count of products
  const totalCount = await Product.countDocuments(filter);

  // Fetch products with pagination, populate seller information, and sort
  const products = await Product.find(filter)
    .populate({
      path: "seller_id",
      select: "name membership_id"
    })
    .skip(skipCount)
    .limit(limit)
    .sort({
      createdAt: -1
    })
    .lean() // Convert to plain JS objects
    .exec();

  // Map the products to include the required seller's full name
  const mappedProducts = products.map((product) => {
    return {
      ...product, // Spread the original product data
      full_name: `${product.seller_id?.name.first_name || ''} ${product.seller_id?.name.middle_name || ''} ${product.seller_id?.name.last_name || ''}`.trim(), // Concatenate seller's full name
    };
  });

  // Return the paginated and mapped product data
  return responseHandler(
    res,
    200,
    "Products retrieved successfully!",
    mappedProducts,
    totalCount
  );
};

/****************************************************************************************************/
/*                      Function to get all products for users using search                         */
/****************************************************************************************************/
exports.getAllProductsUser = async (req, res) => {

  const reqUser = req.userId;

  const { pageNo = 1, limit = 10, search = '' } = req.query;
  const skipCount = limit * (pageNo - 1);
  let filter = {
    status: "accepted",
    $text: { $search: search }  // Using text search index
    // OR
    // name: { $regex: new RegExp(search, 'i') }  // Case-insensitive search on name
  };
  const user = await User.findById(reqUser);
  if (user) {
    const blockedUsersList = user.blocked_users || [];;
    const blockedProductSellers = user.blocked_products || [];;
    // Extract userIds from both lists
    const blockedUserIds = blockedUsersList.map(item => item.userId);
    const blockedProductUserIds = blockedProductSellers.map(item => item.userId);
    // Combine both lists into a single array
    const combinedBlockedUserIds = [...blockedUserIds, ...blockedProductUserIds];
    // To remove duplicates 
    const uniqueBlockedUserIds = [...new Set(combinedBlockedUserIds)];
    filter = {
      seller_id: {
        $nin: uniqueBlockedUserIds
      },
      status: "accepted"
    };
  }

  // Get total count of products
  const totalCount = await Product.countDocuments(filter);

  // Fetch products with pagination, populate seller information, and sort
  const products = await Product.find(filter)
    .populate({
      path: "seller_id",
      select: "name membership_id"
    })
    .skip(skipCount)
    .limit(limit)
    .sort({
      createdAt: -1
    })
    .lean() // Convert to plain JS objects
    .exec();

  // Map the products to include the required seller's full name
  const mappedProducts = products.map((product) => {
    return {
      ...product, // Spread the original product data
      full_name: `${product.seller_id?.name.first_name || ''} ${product.seller_id?.name.middle_name || ''} ${product.seller_id?.name.last_name || ''}`.trim(), // Concatenate seller's full name
    };
  });

  // Return the paginated and mapped product data
  return responseHandler(
    res,
    200,
    "Products retrieved successfully!",
    mappedProducts,
    totalCount
  );
};

/****************************************************************************************************/
/*                                 Function to get product by id                                    */
/****************************************************************************************************/
exports.getProductsById = async (req, res) => {
  const {
    productId
  } = req.params;

  const reqUser = req.userId;

  if (!productId) {
    return responseHandler(res, 400, "Invalid request");
  }

  const user = await User.findById(reqUser);

  const uniqueBlockedUserIds =[]

  if (user) {
    const blockedUsersList = user.blocked_users || [];;
    const blockedProductSellers = user.blocked_products || [];;
    // Extract userIds from both lists
    const blockedUserIds = blockedUsersList.map(item => item.userId);
    const blockedProductUserIds = blockedProductSellers.map(item => item.userId);
    // Combine both lists into a single array
    const combinedBlockedUserIds = [...blockedUserIds, ...blockedProductUserIds];
    // To remove duplicates 
    uniqueBlockedUserIds = [...new Set(combinedBlockedUserIds)];
  }

  const product = await Product.findById(productId)
    .populate({
      path: "seller_id",
      select: "name membership_id"
    })
    .exec();

  if (!product) {
    return responseHandler(res, 404, "Product not found");
  }

  if (uniqueBlockedUserIds) {
    // Check if the seller of the product is blocked
    if (uniqueBlockedUserIds.includes(product.seller_id._id)) {
      return responseHandler(res, 403, "You have blocked the seller of this product or have blocked the products by this seller");
    }
  }

  return responseHandler(res, 200, "Product retrieved successfully!", product);
};

/****************************************************************************************************/
/*                          Function to get products by a single seller                             */
/****************************************************************************************************/
exports.getProductsBySeller = async (req, res) => {
  const {
    sellerId
  } = req.params;
  const reqUser = req.userId;

  if (!sellerId) {
    return responseHandler(res, 400, "Invalid request");
  }

  const user = await User.findById(reqUser);
  if (user) {
    const blockedUsersList = user.blocked_users || [];;
    const blockedProductSellers = user.blocked_products || [];;
    // Extract userIds from both lists
    const blockedUserIds = blockedUsersList.map(item => item.userId);
    const blockedProductUserIds = blockedProductSellers.map(item => item.userId);
    // Combine both lists into a single array
    const combinedBlockedUserIds = [...blockedUserIds, ...blockedProductUserIds];
    // To remove duplicates 
    const uniqueBlockedUserIds = [...new Set(combinedBlockedUserIds)];

    // Check if the seller of the product is blocked
    if (uniqueBlockedUserIds.includes(sellerId)) {
      return responseHandler(res, 403, "You have blocked the seller of this product or have blocked the products by this seller");
    }
  }

  const products = await Product.find({
      seller_id: sellerId
    })
    .populate({
      path: "seller_id",
      select: "name membership_id"
    })
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
  const {
    productId
  } = req.params;

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

/****************************************************************************************************/
/*                             Function to update status of product                                 */
/****************************************************************************************************/
exports.updateProductStatus = async (req, res) => {
  const {
    productId
  } = req.params;
  const {
      status,
      reason
  } = req.body;

  const validStatuses = ["pending", "accepted", "rejected", "reported"];
  if (!validStatuses.includes(status)) {
      return responseHandler(res, 400, "Invalid status value");
  }

  const product = await Product.findById(productId);
  if (!product) {
    return responseHandler(res, 404, "Product not found");
  }

  product.status = status;
  product.reason = reason;

  try {
      await product.save();
      return responseHandler(res, 200, "Product status updated successfully", product);
  } catch (err) {
      return responseHandler(res, 500, `Error saving product: ${err.message}`);
  }
};

/****************************************************************************************************/
/*                         Function to count messages based on product                              */
/****************************************************************************************************/
exports.getMessageCount = async (req, res) => {
  const userId = req.userId;

  if(userId == undefined || userId == ""){
    return responseHandler(res, 401, "Unauthorized");
  }

  const products = await Product.find({seller_id: userId});
  const messageCount = await Message.countDocuments({product: {$in: products.map(p => p._id)}});
  return responseHandler(res, 200, "Message count for products", {messageCount});
}