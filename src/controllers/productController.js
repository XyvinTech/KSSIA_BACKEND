require("dotenv").config();
const path = require("path");
const responseHandler = require("../helpers/responseHandler");
const Product = require("../models/products");
const User = require("../models/user");
const Message = require("../models/messages");
const { productsSchemaval } = require("../validation");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const sendInAppNotification = require("../utils/sendInAppNotification");

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

  // Create a new product
  const newProduct = await Product.create(data);

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

  const updatedProduct = await Product.findByIdAndUpdate(productId, data, {
    new: true,
  });

  return responseHandler(
    res,
    200,
    "Product updated successfully!",
    updatedProduct
  );
};

/****************************************************************************************************/
/*                                  Function to get all products                                    */
/****************************************************************************************************/
exports.getAllProducts = async (req, res) => {
  const {
    pageNo = 1,
    limit = 10,
    search = "",
    name = "",
    status = "",
    date = "",
    from = "",
    to = "",
  } = req.query;
  const skipCount = limit * (pageNo - 1);
  let filter = {};

  if (name && name !== "") {
    filter.name = name;
  }

  if (status && status !== "") {
    filter.status = status;
  }

  if (date && date !== "") {
    filter.createdAt = new Date(date);
  }

  if (from && from !== "") {
    filter.createdAt = { $gte: new Date(from) };
  }

  if (to && to !== "") {
    filter.createdAt = filter.createdAt || {};
    filter.createdAt.$lte = new Date(to);
  }

  // console.log(filter);

  // Build the aggregation pipeline
  const pipeline = [
    // Stage 1: Match products based on status and blocked users
    {
      $match: filter,
    },
    // Stage 2: Lookup seller information (equivalent to populate)
    {
      $lookup: {
        from: "users", // Assuming 'users' is the collection name for User model
        localField: "seller_id",
        foreignField: "_id",
        as: "seller_id",
      },
    },
    // Stage 3: Unwind the seller_id array to get a single object
    {
      $unwind: "$seller_id",
    },
    // Stage 4: Build the search filter (product name, description, seller names)
    {
      $match: {
        $or: [
          { name: { $regex: search, $options: "i" } }, // Product name
          { description: { $regex: search, $options: "i" } }, // Product description
          { "seller_id.name.first_name": { $regex: search, $options: "i" } }, // Seller first name
          { "seller_id.name.middle_name": { $regex: search, $options: "i" } }, // Seller middle name
          { "seller_id.name.last_name": { $regex: search, $options: "i" } }, // Seller last name
        ],
      },
    },
    // Stage 5: Add a full name field for the seller
    {
      $addFields: {
        full_name: {
          $concat: [
            { $ifNull: ["$seller_id.name.first_name", ""] },
            " ",
            { $ifNull: ["$seller_id.name.middle_name", ""] },
            " ",
            { $ifNull: ["$seller_id.name.last_name", ""] },
          ],
        },
      },
    },
    // Stage 6: Sort by creation date (newest first)
    {
      $sort: { createdAt: -1 },
    },
    // Stage 7: Skip to the correct page
    {
      $skip: skipCount,
    },
    // Stage 8: Limit the number of documents returned
    {
      $limit: parseInt(limit),
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
        "seller_id.membership_id": 1,
        "seller_id._id": 1,
      },
    },
  ];

  // Stage 10: Get the total count of products matching the filter
  const totalCountPipeline = [
    { $match: filter },
    {
      $lookup: {
        from: "users",
        localField: "seller_id",
        foreignField: "_id",
        as: "seller_id",
      },
    },
    { $unwind: "$seller_id" },
    {
      $match: {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { "seller_id.name.first_name": { $regex: search, $options: "i" } },
          { "seller_id.name.middle_name": { $regex: search, $options: "i" } },
          { "seller_id.name.last_name": { $regex: search, $options: "i" } },
        ],
      },
    },
    { $count: "totalCount" },
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
    const { pageNo = 1, limit = 10, search = "" } = req.query;
    const skipCount = limit * (pageNo - 1);

    let filter = { status: "accepted" };

    // Fetch the current user to get their blocked lists
    const user = await User.findById(reqUser);
    if (user) {
      const blockedUsersList = user.blocked_users || [];
      const blockedProductSellers = user.blocked_products || [];

      // Extract userIds from both lists and remove duplicates
      const blockedUserIds = blockedUsersList.map((item) => item.userId);
      const blockedProductUserIds = blockedProductSellers.map(
        (item) => item.userId
      );
      // Combine both lists into a single array, remove duplicates
      const uniqueBlockedUserIds = [
        ...new Set([...blockedUserIds, ...blockedProductUserIds]),
      ];
      // Add the requested user ID to the blocked list to avoid fetching the users product
      uniqueBlockedUserIds.push(user._id);

      // Add blocked user ids to the filter to exclude products from these users
      filter.seller_id = { $nin: uniqueBlockedUserIds };
    }

    // Build the aggregation pipeline
    const pipeline = [
      // Stage 1: Match products based on status and blocked users
      {
        $match: filter,
      },
      // Stage 2: Lookup seller information (equivalent to populate)
      {
        $lookup: {
          from: "users", // Assuming 'users' is the collection name for User model
          localField: "seller_id",
          foreignField: "_id",
          as: "seller_id",
        },
      },
      // Stage 3: Unwind the seller_id array to get a single object
      {
        $unwind: "$seller_id",
      },
      // Stage 4: Build the search filter (product name, description, seller names)
      {
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } }, // Product name
            { category: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }, // Product description
            { "seller_id.name.first_name": { $regex: search, $options: "i" } }, // Seller first name
            { "seller_id.name.middle_name": { $regex: search, $options: "i" } }, // Seller middle name
            { "seller_id.name.last_name": { $regex: search, $options: "i" } }, // Seller last name
          ],
        },
      },
      // Stage 5: Add a full name field for the seller
      {
        $addFields: {
          full_name: {
            $concat: [
              { $ifNull: ["$seller_id.name.first_name", ""] },
              " ",
              { $ifNull: ["$seller_id.name.middle_name", ""] },
              " ",
              { $ifNull: ["$seller_id.name.last_name", ""] },
            ],
          },
        },
      },
      // Stage 6: Sort by creation date (newest first)
      {
        $sort: { createdAt: -1 },
      },
      // Stage 7: Skip to the correct page
      {
        $skip: skipCount,
      },
      // Stage 8: Limit the number of documents returned
      {
        $limit: parseInt(limit),
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
          category: 1,
          subcategory: 1,
          createdAt: 1,
          updatedAt: 1,
          full_name: 1,
          "seller_id.membership_id": 1,
          "seller_id._id": 1,
        },
      },
    ];

    // Stage 10: Get the total count of products matching the filter
    const totalCountPipeline = [
      { $match: filter },
      {
        $lookup: {
          from: "users",
          localField: "seller_id",
          foreignField: "_id",
          as: "seller_id",
        },
      },
      { $unwind: "$seller_id" },
      {
        $match: {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } },
            { category: { $regex: search, $options: "i" } },
            { subcategory: { $regex: search, $options: "i" } },
            { "seller_id.name.first_name": { $regex: search, $options: "i" } },
            { "seller_id.name.middle_name": { $regex: search, $options: "i" } },
            { "seller_id.name.last_name": { $regex: search, $options: "i" } },
          ],
        },
      },
      { $count: "totalCount" },
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
  const { productId } = req.params;

  const reqUser = req.userId;

  if (!productId) {
    return responseHandler(res, 400, "Invalid request");
  }

  const user = await User.findById(reqUser);

  const uniqueBlockedUserIds = [];

  if (user) {
    const blockedUsersList = user.blocked_users || [];
    const blockedProductSellers = user.blocked_products || [];
    // Extract userIds from both lists
    const blockedUserIds = blockedUsersList.map((item) => item.userId);
    const blockedProductUserIds = blockedProductSellers.map(
      (item) => item.userId
    );
    // Combine both lists into a single array
    const combinedBlockedUserIds = [
      ...blockedUserIds,
      ...blockedProductUserIds,
    ];
    // To remove duplicates
    uniqueBlockedUserIds = [...new Set(combinedBlockedUserIds)];
  }

  const product = await Product.findById(productId)
    .populate({
      path: "seller_id",
      select: "name membership_id",
    })
    .exec();

  if (!product) {
    return responseHandler(res, 404, "Product not found");
  }

  if (uniqueBlockedUserIds) {
    // Check if the seller of the product is blocked
    if (uniqueBlockedUserIds.includes(product.seller_id._id)) {
      return responseHandler(
        res,
        403,
        "You have blocked the seller of this product or have blocked the products by this seller"
      );
    }
  }

  return responseHandler(res, 200, "Product retrieved successfully!", product);
};

/****************************************************************************************************/
/*                          Function to get products by a single seller                             */
/****************************************************************************************************/
exports.getProductsBySeller = async (req, res) => {
  const { sellerId } = req.params;
  const reqUser = req.userId;

  if (!sellerId) {
    return responseHandler(res, 400, "Invalid request");
  }

  const user = await User.findById(reqUser);
  if (user) {
    const blockedUsersList = user.blocked_users || [];
    const blockedProductSellers = user.blocked_products || [];
    // Extract userIds from both lists
    const blockedUserIds = blockedUsersList.map((item) => item.userId);
    const blockedProductUserIds = blockedProductSellers.map(
      (item) => item.userId
    );
    // Combine both lists into a single array
    const combinedBlockedUserIds = [
      ...blockedUserIds,
      ...blockedProductUserIds,
    ];
    // To remove duplicates
    const uniqueBlockedUserIds = [...new Set(combinedBlockedUserIds)];

    // Check if the seller of the product is blocked
    if (uniqueBlockedUserIds.includes(sellerId)) {
      return responseHandler(
        res,
        403,
        "You have blocked the seller of this product or have blocked the products by this seller"
      );
    }
  }

  const products = await Product.find({
    seller_id: sellerId,
  })
    .populate({
      path: "seller_id",
      select: "name membership_id",
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

/****************************************************************************************************/
/*                             Function to update status of product                                 */
/****************************************************************************************************/
exports.updateProductStatus = async (req, res) => {
  const { productId } = req.params;
  const { status, reason } = req.body;

  const validStatuses = ["pending", "accepted", "rejected", "reported"];
  if (!validStatuses.includes(status)) {
    return responseHandler(res, 400, "Invalid status value");
  }

  const product = await Product.findById(productId);
  if (!product) {
    return responseHandler(res, 404, "Product not found");
  }

  if (status == "accepted") {
    product.reason = "";
  }

  product.status = status;
  product.reason = reason;

  try {
    await product.save();

    try {
      const user = await User.findById(product.seller_id);
      if (!user) {
        return responseHandler(res, 404, "User not found");
      }

      let userFCM = [];
      userFCM.push(user.fcm);

      const subject = `${product.name} status update`;
      let content =
        `Your product ${product.name} has been ${product.status}`.trim();
      const file_url = product.image;

      if (product.reason != "" && product.reason != undefined) {
        content =
          `Your product ${product.name} has been ${product.status} beacuse ${product.reason}`.trim();
      }

      await sendInAppNotification(
        userFCM,
        subject,
        content,
        file_url,
        "approvals"
      );
    } catch (error) {
      console.log(`error creating notification : ${error}`);
    }

    return responseHandler(
      res,
      200,
      "Product status updated successfully",
      product
    );
  } catch (err) {
    return responseHandler(res, 500, `Error saving product: ${err.message}`);
  }
};

/****************************************************************************************************/
/*                         Function to count messages based on product                              */
/****************************************************************************************************/
exports.getMessageCount = async (req, res) => {
  const userId = req.userId;

  if (userId == undefined || userId == "") {
    return responseHandler(res, 401, "Unauthorized");
  }

  const products = await Product.find({ seller_id: userId });
  const messageCount = await Message.countDocuments({
    product: { $in: products.map((p) => p._id) },
  });
  return responseHandler(res, 200, "Message count for products", {
    messageCount,
  });
};

exports.downloadProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("seller_id", "name");
    const csvData = products.map((product) => {
      return {
        UserName: `${product.seller_id?.name.first_name} ${
          product.seller_id?.name.middle_name || ""
        } ${product.seller_id?.name.last_name}`.trim(),
        ProductName: product.name,
        Price: product.price,
        OfferPrice: product.offer_price,
        MOQ: product.moq,
        Units: product.units,
        Status: product.status,
      };
    });
    const headers = [
      { header: "User Name", key: "UserName" },
      { header: "Product Name", key: "ProductName" },
      { header: "Price", key: "Price" },
      { header: "Offer Price", key: "OfferPrice" },
      { header: "MOQ", key: "MOQ" },
      { header: "Status", key: "Status" },
    ];
    return responseHandler(res, 200, "Products downloaded successfully", {
      headers: headers,
      body: csvData,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
