require("dotenv").config();
const Fuse = require("fuse.js");
const admin = require("firebase-admin");
const path = require("path");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const responseHandler = require("../helpers/responseHandler");
const nodemailer = require("nodemailer");
const User = require("../models/user");
const Product = require("../models/products");
const Setting = require("../models/settings");
const {
  CreateUserSchema,
  ReviewSchema,
  EditUserSchema,
  createEnquirySchema,
} = require("../validation");
const { generateToken } = require("../utils/generateToken");
const capitalizeData = require("../utils/capitalizeData");
const Enquiry = require("../models/enquiry");

/****************************************************************************************************/
/*                               Function to generate a 6-digit OTP                                 */
/****************************************************************************************************/

const generateOTP = (length = 6) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString().substring(0, length);
};

/****************************************************************************************************/
/*                 Mock function to send OTP (replace with actual implementation)                   */
/****************************************************************************************************/

const sendOtp = async (mobile, otp) => {
  console.log(`Sending OTP ${otp} to mobile number ${mobile}`);
  // Simulate sending OTP
  return {
    status: "success",
  }; // Replace with actual status from your SMS service
};

/****************************************************************************************************/
/*                                 Function to sent OTP for login                                   */
/****************************************************************************************************/

exports.sendOtp = async (req, res) => {
  const { mobile } = req.params;
  // console.log(`Received mobile parameter: ${mobile}`);                             // Debug line

  // Validate the presence of the mobile field in the request body
  if (!mobile) {
    // console.log(`Mobile number is required`);                                    // Debug line
    return responseHandler(res, 400, "Invalid request");
  }

  // Check if the user exists in the database
  const user = await User.findOne({
    "phone_numbers.personal": mobile,
  });
  if (!user) {
    // console.log(`User not found`);                                               // Debug line
    return responseHandler(res, 404, "User not found");
  }

  // Generate a 6-digit OTP
  const otp = generateOTP(6);

  // Send the OTP to the user's mobile number
  const sendOtpFn = await sendOtp(mobile, otp);

  // If OTP is not sent successfully
  if (sendOtpFn.status !== "success") {
    // console.log(`Failed to send OTP`);                                           // Debug line
    return responseHandler(res, 400, "Failed to sent OTP");
  }

  user.otp = otp;
  await user.save();
  // console.log(`OTP sent successfully`);                                            // Debug line
  return responseHandler(res, 200, "OTP sent successfully", otp);
};

/****************************************************************************************************/
/*                              Function to verify the OTP for login                                */
/****************************************************************************************************/

exports.verifyOtp = async (req, res) => {
  const { mobile, otp } = req.body;
  // console.log(`Received mobile and OTP parameters: ${mobile} ${otp}`);             // Debug line

  // Validate the presence of the mobile and otp fields in the request body
  if (!mobile || !otp) {
    // console.log(`Mobile and OTP are required`);                                  // Debug line
    return responseHandler(res, 400, "Invalid request");
  }

  // Check if the user exists in the database
  const user = await User.findOne({
    "phone_numbers.personal": mobile,
  });
  if (!user) {
    // console.log(`User not found`);                                               // Debug line
    return responseHandler(res, 404, "User not found");
  }

  // Check if the OTP recived and the OTP in the database of the user is same
  if (user.otp !== otp) {
    // console.log(`Invalid OTP`);                                                  // Debug line
    return responseHandler(res, 400, "Invalid OTP");
  }
  user.otp = null;
  await user.save();

  const token = generateToken(user._id);

  // console.log(`OTP verified successfully`);                                        // Debug line
  return responseHandler(res, 200, "User OTP verified successfully", [
    {
      token: token,
      userId: user._id,
    },
  ]);
};

/****************************************************************************************************/
/*                                   Function to get user by ID                                     */
/****************************************************************************************************/

exports.getUserById = async (req, res) => {
  const { userId } = req.params;
  // console.log(`Received userId: ${userId}`);                                       // Debug line

  if (!userId) {
    // If userId is not provided, return a 400 status code with the error message
    // console.log('Invalid request');                                              // Debug line
    return responseHandler(res, 400, `Invalid request`);
  }

  // Check if a user with this id exists
  const user = await User.findById(userId).populate({
    path: "reviews.reviewer",
    select: "name profile_picture",
  });
  if (!user) {
    // If the user is not found, return a 404 status code with the error message
    // console.log('User not found');                                               // Debug line
    return responseHandler(res, 404, "User not found");
  }

  let products = await Product.find({
    seller_id: userId,
  }).exec();
  if (!products.length) {
    products = "Seller has no products";
  }

  // Prepare response with user data and products
  const designation = capitalizeData(user.designation);
  const userData = {
    ...user._doc,
    products: products,
    designation,
  };

  // console.log(`User retrieved successfully`);                                      // Debug line
  return responseHandler(res, 200, "User retrieved successfully", userData);
};

/****************************************************************************************************/
/*                               Function to edit the user profile                                  */
/****************************************************************************************************/

exports.editProfile = async (req, res) => {
  const { userId } = req.params;
  const data = req.body;

  // Validate the presence of the userId in the request body
  if (!userId) {
    return responseHandler(res, 400, "Invalid request");
  }

  // Validate the input data
  const { error } = EditUserSchema.validate(data, {
    abortEarly: true,
  });

  // Check if an error exists in the validation
  if (error) {
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  // Fetch current user data
  const currentUser = await User.findById(userId);
  if (!currentUser) {
    return responseHandler(res, 404, "User not found");
  }

  const bucketName = process.env.AWS_S3_BUCKET;

  // Handle deletion of old files if new URLs are provided

  // if (
  //   !data.profile_picture ||
  //   (data.profile_picture !== currentUser.profile_picture &&
  //     currentUser.profile_picture !== undefined &&
  //     currentUser.profile_picture != "")
  // ) {
  //   if (currentUser.profile_picture) {
  //     const oldFileKey = path.basename(currentUser.profile_picture);
  //     await deleteFile(bucketName, oldFileKey);
  //   }
  // }

  // if (
  //   !data.company_logo ||
  //   (data.company_logo !== currentUser.company_logo &&
  //     currentUser.company_logo !== undefined &&
  //     currentUser.company_logo != "")
  // ) {
  //   if (currentUser.company_logo) {
  //     const oldFileKey = path.basename(currentUser.company_logo);
  //     await deleteFile(bucketName, oldFileKey);
  //   }
  // }

  // const fieldsToCheck = ["awards", "certificates", "brochure"];
  // for (const field of fieldsToCheck) {
  //   if (data[field]) {
  //     for (const item of currentUser[field]) {
  //       const isStillPresent = data[field].some(
  //         (newItem) => newItem.url === item.url
  //       );
  //       if (
  //         !isStillPresent &&
  //         item.url &&
  //         item.url != "" &&
  //         item.url !== undefined
  //       ) {
  //         if (item.url) {
  //           let oldFileKey = path.basename(item.url);
  //           await deleteFile(bucketName, oldFileKey);
  //         }
  //       }
  //     }
  //   }
  // }

  // Update the user's profile with the validated data
  const updatedUser = await User.findByIdAndUpdate(userId, data, {
    new: true,
    runValidators: true,
  });

  if (!updatedUser) {
    return responseHandler(res, 404, "User not found");
  }

  // Update products if any changes exist in the data
  if (data.products) {
    const currentProducts = await Product.find({
      seller_id: userId,
    });
    const currentProductsMap = new Map(
      currentProducts.map((product) => [product._id.toString(), product])
    );

    for (let productData of data.products) {
      if (productData._id) {
        const existingProduct = currentProductsMap.get(productData._id);
        if (existingProduct) {
          await Product.findByIdAndUpdate(productData._id, productData, {
            new: true,
            runValidators: true,
          });
          currentProductsMap.delete(productData._id);
        } else {
          const newProduct = new Product({
            ...productData,
            seller_id: userId,
          });
          await newProduct.save();
        }
      } else {
        return responseHandler(res, 404, "Invalid request");
      }
    }

    // Remove products that were not in the update request, and delete associated images
    for (let remainingProduct of currentProductsMap.values()) {
      // if (remainingProduct.image) {
      //   let oldImageKey = path.basename(remainingProduct.image);
      //   await deleteFile(bucketName, oldImageKey);
      // }
      await Product.findByIdAndDelete(remainingProduct._id);
    }
  }

  return responseHandler(
    res,
    200,
    "User profile updated successfully",
    updatedUser
  );
};

/****************************************************************************************************/
/*                  Function to search users using name aggregation and fuse.js                     */
/****************************************************************************************************/

exports.findUserByName = async (req, res) => {
  const { name } = req.params;
  // console.log(`Received name parameter: ${name}`);                                 // Debug line

  // Validate the presence of the name in the request parameter
  if (!name) {
    // console.log(`Requires name to search the user`);                             // Debug line
    return responseHandler(res, 400, "Invalid request");
  }

  // Decode URL encoded spaces
  const decodedName = decodeURIComponent(name);
  // console.log(`Decoded Name: ${decodedName}`);                                     // Debug line

  // Split the name into parts
  const nameParts = decodedName.split(" ").filter(Boolean);
  // console.log(`Name Parts: ${nameParts}`);                                         // Debug line

  // Prepare the match query
  let matchQuery = {};
  if (nameParts.length > 0) {
    matchQuery = {
      $or: [
        {
          "name.first_name": {
            $regex: nameParts[0],
            $options: "i",
          },
        },
        {
          "name.middle_name": {
            $regex: nameParts.slice(1, -1).join(" "),
            $options: "i",
          },
        },
        {
          "name.last_name": {
            $regex: nameParts[nameParts.length - 1],
            $options: "i",
          },
        },
      ],
    };
  }
  // console.log(`Match Query: ${JSON.stringify(matchQuery)}`);                       // Debug line

  // Find users using aggregation
  const initialResults = await User.aggregate([
    {
      $match: matchQuery,
    },
  ]);
  // console.log(`Initial Results: ${JSON.stringify(initialResults)}`);               // Debug line

  // Check if initial results are empty
  if (!initialResults || initialResults.length === 0) {
    // console.log('No users found in aggregation stage');                          // Debug line
    return responseHandler(res, 404, "User not found");
  }

  // Set up Fuse.js options
  const fuseOptions = {
    keys: ["name.first_name", "name.middle_name", "name.last_name"],
    threshold: 0.7, // Adjust as needed
  };
  // console.log(`Fuse.js Options: ${JSON.stringify(fuseOptions)}`);                  // Debug line
  // Create Fuse instance
  const fuse = new Fuse(initialResults, fuseOptions);

  // Search for users
  const fuseResults = fuse.search(decodedName);
  // console.log(`Fuse.js Results: ${JSON.stringify(fuseResults)}`);                  // Debug line
  const matchedUsers = fuseResults.map((result) => result.item);
  // console.log(`Matched Users: ${JSON.stringify(matchedUsers)}`);                   // Debug line

  if (!matchedUsers || matchedUsers.length === 0) {
    // console.log('No users found in Fuse.js stage');                              // Debug line
    return responseHandler(res, 404, "User not found");
  }

  // console.log('Users successfully found and returned');                            // Debug line
  return responseHandler(res, 200, "User found", matchedUsers);
};

/****************************************************************************************************/
/*                            Function to get user using membership ID                              */
/****************************************************************************************************/

exports.findUserByMembershipId = async (req, res) => {
  const { membershipId } = req.params;
  // console.log(`Received membershipId parameter: ${membershipId}`);                 // Debug line

  // Check if the membership id is present in the request
  if (!membershipId) {
    // console.log('Membership ID is required');                                    // Debug line
    return responseHandler(res, 400, "Invalid request");
  }

  // Check if the membership id exist in the database
  const user = await User.findOne({
    membership_id: membershipId,
  });
  if (!user) {
    // console.log('User not found in database');                                   // Debug line
    return responseHandler(res, 404, "User not found");
  }
  // console.log('User found in database');                                           // Debug line
  return responseHandler(res, 200, "User found", user);
};

/****************************************************************************************************/
/*                                    function to add a review                                      */
/****************************************************************************************************/

exports.addReview = async (req, res) => {
  const { userId } = req.params;
  const reviewData = req.body;

  if (!userId || !reviewData) {
    return responseHandler(res, 400, "Invalid request");
  }

  const user = await User.findById(userId);
  if (!user) {
    return responseHandler(res, 404, "User not found");
  }

  // Validate the input data
  const { error } = ReviewSchema.validate(reviewData, {
    abortEarly: true,
  });

  // Check if an error exists in the validation
  if (error) {
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  try {
    const user = await User.addReview(userId, reviewData);
    return responseHandler(res, 200, "Review added successfully", user);
  } catch (error) {
    return responseHandler(res, 500, `Server error: ${error.message}`);
  }
};

/****************************************************************************************************/
/*                                   function to delete a review                                    */
/****************************************************************************************************/

exports.deleteReview = async (req, res) => {
  const { userId, reviewId } = req.params;

  if (!userId || !reviewId) {
    return responseHandler(res, 400, "Invalid request");
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return responseHandler(res, 404, "User not found");
    }

    await user.deleteReview(reviewId);
    return responseHandler(res, 200, "Review deleted successfully", user);
  } catch (error) {
    return responseHandler(res, 500, `Server error: ${error.message}`);
  }
};

/****************************************************************************************************/
/*                                    function to block a user                                      */
/****************************************************************************************************/

exports.blockUser = async (req, res) => {
  const userId = req.userId;
  const { blockUserId } = req.params;
  const { reason } = req.body;

  // Validate input
  if (!blockUserId || !reason || reason.trim() === "") {
    return responseHandler(
      res,
      400,
      "Invalid request. Please provide a valid user to block and a reason."
    );
  }

  // Prevent a user from blocking themselves
  if (userId === blockUserId) {
    return responseHandler(res, 400, "You cannot block yourself.");
  }

  try {
    // Check if the user to block exists
    const userToBlock = await User.findById(blockUserId);
    if (!userToBlock) {
      return responseHandler(res, 404, "User to be blocked not found.");
    }

    // Check if the current user exists
    const user = await User.findById(userId);
    if (!user) {
      return responseHandler(res, 404, "User not found.");
    }

    // block the user if they are not in the blocked list
    const isBlocked = user.blocked_users.some(
      (blockedUser) => blockedUser.userId.toString() === blockUserId.toString()
    );

    if (!isBlocked) {
      // Block the user with the provided reason
      await user.blockUser(blockUserId, reason);
      return responseHandler(res, 200, "User blocked successfully.", user);
    }

    return responseHandler(res, 400, "User is already blocked.");
  } catch (error) {
    console.error(error);
    return responseHandler(
      res,
      500,
      "An error occurred while blocking the user."
    );
  }
};

/****************************************************************************************************/
/*                                    function to unblock a user                                    */
/****************************************************************************************************/

exports.unblockUser = async (req, res) => {
  const userId = req.userId;
  const { blockedUserId } = req.params;

  // Validate input
  if (!blockedUserId) {
    return responseHandler(
      res,
      400,
      "Invalid request. Please provide a valid user to unblock."
    );
  }

  // Prevent a user from unblocking themselves
  if (userId === blockedUserId) {
    return responseHandler(res, 400, "You cannot unblock yourself.");
  }

  try {
    // Check if the user to unblock exists
    const userToUnblock = await User.findById(blockedUserId);
    if (!userToUnblock) {
      return responseHandler(res, 404, "User to be unblocked not found.");
    }

    // Check if the current user exists
    const user = await User.findById(userId);
    if (!user) {
      return responseHandler(res, 404, "User not found.");
    }

    // Unblock the user if they are in the blocked list
    const isBlocked = user.blocked_users.some(
      (blockedUser) =>
        blockedUser.userId.toString() === blockedUserId.toString()
    );

    if (!isBlocked) {
      return responseHandler(res, 400, "User is not currently blocked.");
    }

    // Unblock the user
    await user.unblockUser(blockedUserId);

    return responseHandler(res, 200, "User unblocked successfully.", user);
  } catch (error) {
    // Handle any errors
    console.error(error);
    return responseHandler(
      res,
      500,
      "An error occurred while unblocking the user."
    );
  }
};

/****************************************************************************************************/
/*                              function to block products by a user                                */
/****************************************************************************************************/

exports.blockProduct = async (req, res) => {
  const userId = req.userId;
  const { blockUserId } = req.params;
  const { reason } = req.body;

  // Validate input
  if (!blockUserId || !reason || reason.trim() === "") {
    return responseHandler(
      res,
      400,
      "Invalid request. Please provide a valid seller to block and a reason."
    );
  }

  // Prevent a user from blocking themselves
  if (userId === blockUserId) {
    return responseHandler(res, 400, "You cannot block yourself.");
  }

  try {
    // Check if the seller to block exists
    const userToBlock = await User.findById(blockUserId);
    if (!userToBlock) {
      return responseHandler(res, 404, "Seller to be blocked not found.");
    }

    // Check if the current user exists
    const user = await User.findById(userId);
    if (!user) {
      return responseHandler(res, 404, "User not found.");
    }

    // block the seller if they are not in the blocked list
    const isBlocked = user.blocked_products.some(
      (blockedUser) => blockedUser.userId.toString() === blockUserId.toString()
    );

    if (!isBlocked) {
      // Block the seller with the provided reason
      await user.blockProducts(blockUserId, reason);
      return responseHandler(
        res,
        200,
        "products by seller blocked successfully.",
        user
      );
    }

    return responseHandler(res, 400, "Products by seller is already blocked.");
  } catch (error) {
    console.error(error);
    return responseHandler(
      res,
      500,
      "An error occurred while blocking the products by the seller."
    );
  }
};

/****************************************************************************************************/
/*                              function to unblock products by a user                              */
/****************************************************************************************************/

exports.unblockProduct = async (req, res) => {
  const userId = req.userId;
  const { blockedUserId } = req.params;

  // Validate input
  if (!blockedUserId) {
    return responseHandler(
      res,
      400,
      "Invalid request. Please provide a valid seller to unblock."
    );
  }

  // Prevent a user from unblocking themselves
  if (userId === blockedUserId) {
    return responseHandler(res, 400, "You cannot unblock yourself.");
  }

  try {
    // Check if the user to unblock exists
    const userToUnblock = await User.findById(blockedUserId);
    if (!userToUnblock) {
      return responseHandler(res, 404, "Seller to be unblocked not found.");
    }

    // Check if the current user exists
    const user = await User.findById(userId);
    if (!user) {
      return responseHandler(res, 404, "User not found.");
    }

    // Unblock the user if they are in the blocked list
    const isBlocked = user.blocked_products.some(
      (blockedUser) =>
        blockedUser.userId.toString() === blockedUserId.toString()
    );

    if (!isBlocked) {
      return responseHandler(
        res,
        400,
        "Products by the seller is not currently blocked."
      );
    }

    // Unblock the user
    await user.unblockProducts(blockedUserId);

    return responseHandler(
      res,
      200,
      "Products by seller unblocked successfully.",
      user
    );
  } catch (error) {
    // Handle any errors
    console.error(error);
    return responseHandler(
      res,
      500,
      "An error occurred while unblocking products by the seller."
    );
  }
};

/****************************************************************************************************/
/*                            function to block requirements by a user                              */
/****************************************************************************************************/

exports.blockRequirement = async (req, res) => {
  const userId = req.userId;
  const { blockUserId } = req.params;
  const { reason } = req.body;

  // Validate input
  if (!blockUserId || !reason || reason.trim() === "") {
    return responseHandler(
      res,
      400,
      "Invalid request. Please provide a valid user to block and a reason."
    );
  }

  // Prevent a user from blocking themselves
  if (userId === blockUserId) {
    return responseHandler(res, 400, "You cannot block yourself.");
  }

  try {
    // Check if the user to block exists
    const userToBlock = await User.findById(blockUserId);
    if (!userToBlock) {
      return responseHandler(res, 404, "User to be blocked not found.");
    }

    // Check if the current user exists
    const user = await User.findById(userId);
    if (!user) {
      return responseHandler(res, 404, "User not found.");
    }

    // block the user if they are not in the blocked list
    const isBlocked = user.blocked_requirements.some(
      (blockedUser) => blockedUser.userId.toString() === blockUserId.toString()
    );

    if (!isBlocked) {
      // Block the user with the provided reason
      await user.blockRequirements(blockUserId, reason);
      return responseHandler(
        res,
        200,
        "Requirements by user blocked successfully.",
        user
      );
    }

    return responseHandler(
      res,
      400,
      "Requirements by user is already blocked."
    );
  } catch (error) {
    console.error(error);
    return responseHandler(
      res,
      500,
      "An error occurred while blocking the requirements by the user."
    );
  }
};

/****************************************************************************************************/
/*                            function to unblock requirements by a user                            */
/****************************************************************************************************/

exports.unblockRequirement = async (req, res) => {
  const userId = req.userId;
  const { blockedUserId } = req.params;

  // Validate input
  if (!blockedUserId) {
    return responseHandler(
      res,
      400,
      "Invalid request. Please provide a valid user to unblock."
    );
  }

  // Prevent a user from unblocking themselves
  if (userId === blockedUserId) {
    return responseHandler(res, 400, "You cannot unblock yourself.");
  }

  try {
    // Check if the user to unblock exists
    const userToUnblock = await User.findById(blockedUserId);
    if (!userToUnblock) {
      return responseHandler(res, 404, "User to be unblocked not found.");
    }

    // Check if the current user exists
    const user = await User.findById(userId);
    if (!user) {
      return responseHandler(res, 404, "User not found.");
    }

    // Unblock the user if they are in the blocked list
    const isBlocked = user.blocked_requirements.some(
      (blockedUser) =>
        blockedUser.userId.toString() === blockedUserId.toString()
    );

    if (!isBlocked) {
      return responseHandler(
        res,
        400,
        "Requirements by the user is not currently blocked."
      );
    }

    // Unblock the user
    await user.unblockRequirements(blockedUserId);

    return responseHandler(
      res,
      200,
      "Requirements by user unblocked successfully.",
      user
    );
  } catch (error) {
    // Handle any errors
    console.error(error);
    return responseHandler(
      res,
      500,
      "An error occurred while unblocking Requirements by the user."
    );
  }
};

/****************************************************************************************************/
/*                                     function to login a user                                     */
/****************************************************************************************************/

exports.loginUser = async (req, res) => {
  const id = req.body.clientToken;
  const { fcm } = req.body;

  if (!id) {
    return responseHandler(res, 400, "Client Token is required");
  }

  let user;
  admin
    .auth()
    .verifyIdToken(id)
    .then(async (decodedToken) => {
      user = await User.findOne({
        "phone_numbers.personal": decodedToken.phone_number,
      });
      if (!user) {
        return responseHandler(res, 404, "User not found");
      } else if (user.uid && user.uid !== null) {
        user.fcm = fcm;
        user.save();
        const token = generateToken(user._id);
        return responseHandler(res, 200, "User logged in successfully", {
          token: token,
          userId: user._id,
        });
      } else {
        user.uid = decodedToken.uid;
        user.fcm = fcm;
        user.save();
        const token = generateToken(user._id);
        return responseHandler(res, 200, "User logged in successfully", {
          token: token,
          userId: user._id,
        });
      }
    });
};

/****************************************************************************************************/
/*                                    function to request a nfc                                     */
/****************************************************************************************************/

exports.requestNFC = async (req, res) => {
  const userId = req.userId;

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).send("User not found");
  }

  // Send email
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.NODE_MAILER_USER,
      pass: process.env.NODE_MAILER_PASS,
    },
  });

  // Prepare user details for the email
  const userDetails = `
   Name: ${user.name.first_name} ${
    user.name.middle_name ? user.name.middle_name + " " : ""
  }${user.name.last_name}
   Email: ${user.email}
   Membership ID: ${user.membership_id}
   Phone Number: ${user.phone_numbers.personal}
   Address: ${user.address}
  `;

  const mailOptions = {
    from: process.env.NODE_MAILER_USER,
    to: "brightymct@gmail.com",
    subject: "User Details for NFC (NFC request)",
    text: `Hello,\n\nHere are your details:\n\n${userDetails}`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.log("🚀 ~ exports.requestNFC= ~ error:", error);
  }

  return responseHandler(res, 201, "Request NFC sent successfully!");
};

/****************************************************************************************************/
/*                                   function to get app version                                    */
/****************************************************************************************************/

exports.getVersion = async (req, res) => {
  try {
    const settings = await Setting.findOne();

    return responseHandler(
      res,
      200,
      "App version fetched successfully",
      settings
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

/****************************************************************************************************/
/*                                 function to get user subscription                                */
/****************************************************************************************************/

exports.getUserSubscription = async (req, res) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);
    const subscription = user.subscription;
    if (!subscription) {
      return responseHandler(res, 404, "User subscription not found", "free");
    }
    return responseHandler(
      res,
      200,
      "User subscription fetched successfully",
      subscription
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.updateSubscription = async (req, res) => {
  const id = req.params.id;
  try {
    const subscription = await User.findByIdAndUpdate(
      id,
      {
        subscription: req.body.subscription,
      },
      {
        new: true,
      }
    );
    return responseHandler(
      res,
      200,
      "User subscription updated successfully",
      subscription
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.sendEnquiry = async (req, res) => {
  try {
    const { error } = createEnquirySchema.validate(req.body, {
      abortEarly: true,
    });

    if (error) {
      return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    const newEnquiry = await Enquiry.create(req.body);
    if (newEnquiry) {
      return responseHandler(
        res,
        201,
        "Enquiry created successfully",
        newEnquiry
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

exports.getEnquiry = async (req, res) => {
  try {
    const user = req.userId;
    const enquiries = await Enquiry.find({ user: user });
    return responseHandler(
      res,
      200,
      "Enquiries fetched successfully",
      enquiries
    );
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};
