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

  // Build the aggregation pipeline
  const pipeline = [
    // Stage 1: Match products based on status and blocked users
    {
      $match: filter
    },
    // Stage 2: Lookup seller information (equivalent to populate)
    {
      $lookup: {
        from: 'users', // Assuming 'users' is the collection name for User model
        localField: 'seller_id',
        foreignField: '_id',
        as: 'seller_info'
      }
    },
    // Stage 3: Unwind the seller_info array to get a single object
    {
      $unwind: '$seller_info'
    },
    // Stage 4: Build the search filter (product name, description, seller names)
    {
      $match: {
        $or: [
          { name: { $regex: search, $options: 'i' } }, // Product name
          { description: { $regex: search, $options: 'i' } }, // Product description
          { 'seller_info.name.first_name': { $regex: search, $options: 'i' } }, // Seller first name
          { 'seller_info.name.middle_name': { $regex: search, $options: 'i' } }, // Seller middle name
          { 'seller_info.name.last_name': { $regex: search, $options: 'i' } }, // Seller last name
        ]
      }
    },
    // Stage 5: Add a full name field for the seller
    {
      $addFields: {
        full_name: {
          $concat: [
            { $ifNull: ['$seller_info.name.first_name', ''] },
            ' ',
            { $ifNull: ['$seller_info.name.middle_name', ''] },
            ' ',
            { $ifNull: ['$seller_info.name.last_name', ''] }
          ]
        }
      }
    },
    // Stage 6: Sort by creation date (newest first)
    {
      $sort: { createdAt: -1 }
    },
    // Stage 7: Skip to the correct page
    {
      $skip: skipCount
    },
    // Stage 8: Limit the number of documents returned
    {
      $limit: parseInt(limit)
    },
    // Stage 9: Project the required fields (you can modify this based on what you need)
    {
      $project: {
        _id: 1,
        name: 1,
        image: 1,
        price: 1,
        offer_price: 1,
        description: 1,
        moq: 1,
        status: 1,
        tags: 1,
        createdAt: 1,
        updatedAt: 1,
        full_name: 1,
        'seller_info.membership_id': 1
      }
    }
  ];

  // Stage 10: Get the total count of products matching the filter
  const totalCountPipeline = [
    { $match: filter },
    { $lookup: { from: 'users', localField: 'seller_id', foreignField: '_id', as: 'seller_info' } },
    { $unwind: '$seller_info' },
    { $match: { $or: [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'seller_info.name.first_name': { $regex: search, $options: 'i' } },
      { 'seller_info.name.middle_name': { $regex: search, $options: 'i' } },
      { 'seller_info.name.last_name': { $regex: search, $options: 'i' } }
    ] } },
    { $count: "totalCount" }
  ];

  // Execute the aggregation for products
  const products = await Product.aggregate(pipeline);
  
  // Execute the total count aggregation
  const totalCountResult = await Product.aggregate(totalCountPipeline);
  const totalCount = totalCountResult[0]?.totalCount || 0;

  // Return the paginated and mapped product data
  return responseHandler(
    res,
    200,
    "Products retrieved successfully!",
    products,
    totalCount
  );
};

/****************************************************************************************************/
/*                  Function to get all products for users using search and aggregation              */
/****************************************************************************************************/
exports.getAllProductsUser = async (req, res) => {
  try {
    const reqUser = req.userId;
    const { pageNo = 1, limit = 10, search = '' } = req.query;
    const skipCount = limit * (pageNo - 1);

    let filter = { status: "accepted" };

    // Fetch the current user to get their blocked lists
    const user = await User.findById(reqUser);
    if (user) {
      const blockedUsersList = user.blocked_users || [];
      const blockedProductSellers = user.blocked_products || [];

      // Extract userIds from both lists and remove duplicates
      const blockedUserIds = blockedUsersList.map(item => item.userId);
      const blockedProductUserIds = blockedProductSellers.map(item => item.userId);
      const uniqueBlockedUserIds = [...new Set([...blockedUserIds, ...blockedProductUserIds])];

      // Add blocked user ids to the filter to exclude products from these users
      filter.seller_id = { $nin: uniqueBlockedUserIds };
    }

    // Build the aggregation pipeline
    const pipeline = [
      // Stage 1: Match products based on status and blocked users
      {
        $match: filter
      },
      // Stage 2: Lookup seller information (equivalent to populate)
      {
        $lookup: {
          from: 'users', // Assuming 'users' is the collection name for User model
          localField: 'seller_id',
          foreignField: '_id',
          as: 'seller_info'
        }
      },
      // Stage 3: Unwind the seller_info array to get a single object
      {
        $unwind: '$seller_info'
      },
      // Stage 4: Build the search filter (product name, description, seller names)
      {
        $match: {
          $or: [
            { name: { $regex: search, $options: 'i' } }, // Product name
            { description: { $regex: search, $options: 'i' } }, // Product description
            { 'seller_info.name.first_name': { $regex: search, $options: 'i' } }, // Seller first name
            { 'seller_info.name.middle_name': { $regex: search, $options: 'i' } }, // Seller middle name
            { 'seller_info.name.last_name': { $regex: search, $options: 'i' } }, // Seller last name
          ]
        }
      },
      // Stage 5: Add a full name field for the seller
      {
        $addFields: {
          full_name: {
            $concat: [
              { $ifNull: ['$seller_info.name.first_name', ''] },
              ' ',
              { $ifNull: ['$seller_info.name.middle_name', ''] },
              ' ',
              { $ifNull: ['$seller_info.name.last_name', ''] }
            ]
          }
        }
      },
      // Stage 6: Sort by creation date (newest first)
      {
        $sort: { createdAt: -1 }
      },
      // Stage 7: Skip to the correct page
      {
        $skip: skipCount
      },
      // Stage 8: Limit the number of documents returned
      {
        $limit: parseInt(limit)
      },
      // Stage 9: Project the required fields (you can modify this based on what you need)
      {
        $project: {
          _id: 1,
          name: 1,
          image: 1,
          price: 1,
          offer_price: 1,
          description: 1,
          moq: 1,
          status: 1,
          tags: 1,
          createdAt: 1,
          updatedAt: 1,
          full_name: 1,
          'seller_info.membership_id': 1
        }
      }
    ];

    // Stage 10: Get the total count of products matching the filter
    const totalCountPipeline = [
      { $match: filter },
      { $lookup: { from: 'users', localField: 'seller_id', foreignField: '_id', as: 'seller_info' } },
      { $unwind: '$seller_info' },
      { $match: { $or: [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'seller_info.name.first_name': { $regex: search, $options: 'i' } },
        { 'seller_info.name.middle_name': { $regex: search, $options: 'i' } },
        { 'seller_info.name.last_name': { $regex: search, $options: 'i' } }
      ] } },
      { $count: "totalCount" }
    ];

    // Execute the aggregation for products
    const products = await Product.aggregate(pipeline);
    
    // Execute the total count aggregation
    const totalCountResult = await Product.aggregate(totalCountPipeline);
    const totalCount = totalCountResult[0]?.totalCount || 0;

    // Return the paginated and mapped product data with total count
    return responseHandler(
      res,
      200,
      "Products retrieved successfully!",
      products,
      totalCount
    );
  } catch (error) {
    console.error("Error fetching products:", error);
    return responseHandler(res, 500, "Error fetching products");
  }
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