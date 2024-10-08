require("dotenv").config();
const responseHandler = require("../helpers/responseHandler");
const User = require("../models/user");
const Product = require("../models/products");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const {
  CreateUserSchema,
  EditUserSchema
} = require("../validation");

/****************************************************************************************************/
/*                                 Function to create a new user                                    */
/****************************************************************************************************/

exports.createUser = async (req, res) => {
  const data = req.body;
  // console.log(`Received data parameter: ${data}`);                                 // Debug line

  // Validate the input data
  const {
    error
  } = CreateUserSchema.validate(data, {
    abortEarly: true,
  });

  // Check if an error exists in the validation
  if (error) {
    // If an error exists, return a 400 status code with the error message
    // console.log('Invalid input: ${error.message}');                              // Debug line
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  // Check if a user with this mobile number already exists
  const existingUser = await User.findOne({
    "phone_numbers.personal": data.phone_numbers.personal,
  });
  if (existingUser) {
    // If a user with this mobile number already exists, return a 400 status code with the error message
    // console.log('User with this phone number already exists');                   // Debug line
    return responseHandler(
      res,
      409,
      `User with this phone number already exists`
    );
  }

  // Create a new user
  const newUser = new User(data);
  await newUser.save();

  // console.log(`New user created: ${newUser}`);                                   // Debug line
  return responseHandler(res, 201, `New user created successfully!`, newUser);
};

/****************************************************************************************************/
/*                                 Function to bulk add new user                                    */
/****************************************************************************************************/

exports.createUserBulk = async (req, res) => {
  const data = req.body;
  // console.log(`Received data parameter: ${data}`);                                 // Debug line

  // Validate and filter out invalid users
  const validUsers = [];
  const errors = [];

  for (const user of data) {
    const {
      error
    } = CreateUserSchema.validate(user, {
      abortEarly: true,
    });
    if (error) {
      errors.push(
        `Invalid user data: ${error.message} for user ${user.name?.first_name} ${user.name?.last_name} membership ID: ${user.membership_id}`
      );
    } else {
      // Check if the user already exists
      const existingUser = await User.findOne({
        "phone_numbers.personal": user.phone_numbers.personal,
      });

      if (existingUser) {
        errors.push(
          `User with phone number ${user.phone_numbers.personal} already exists.`
        );
      } else {
        validUsers.push(user);
      }
    }
  }

  if (validUsers.length === 0) {
    return responseHandler(res, 400, "No valid users to create.", {
      errors,
    });
  }

  // Insert valid users into the database
  const insertedUsers = await User.insertMany(validUsers);

  return responseHandler(res, 201, "Users created successfully.", {
    insertedUsers,
    errors,
  });
};

/****************************************************************************************************/
/*                                     Function to edit user                                        */
/****************************************************************************************************/

exports.editUser = async (req, res) => {
  const {
    userId
  } = req.params;
  const {
    membership_id
  } = req.params;
  const data = req.body;
  // console.log(`Received userId parameter: ${userId}`);                             // Debug line
  // console.log(`Received membership_id parameter: ${membership_id}`);               // Debug line
  // console.log(`Received data parameter: ${data}`);                                 // Debug line

  // Validate the input data
  const {
    error
  } = EditUserSchema.validate(data, {
    abortEarly: true,
  });

  // Check if an error exists in the validation
  if (error) {
    // If an error exists, return a 400 status code with the error message
    // console.log('Invalid input: ${error.message}');                              // Debug line
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  let updatedUser;

  if (userId) {
    // Find and update the user using userId
    updatedUser = await User.findByIdAndUpdate(userId, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      // If the user is not found, return a 404 status code with the error message
      // console.log('User not found');                                           // Debug line
      return responseHandler(res, 404, "User not found");
    }
  } else if (membership_id) {
    // Find and update the user using membership_id
    updatedUser = await User.findOneAndUpdate(membership_id, data, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      // If the user is not found, return a 404 status code with the error message
      // console.log('User not found');                                           // Debug line
      return responseHandler(res, 404, "User not found");
    }
  } else {
    // If neither userId nor membership_id is provided, return a 400 status code with the error
    // console.log('Invalid request');                                              // Debug line
    return responseHandler(res, 400, `Invalid request`);
  }

  // console.log('User updated successfully!');                                       // Debug line
  return responseHandler(res, 200, "User updated successfully!", updatedUser);
};

/****************************************************************************************************/
/*                                   Function to delete an user                                     */
/****************************************************************************************************/

const deleteUserFiles = async (user) => {
  // Delete user's files
  if (user.profile_picture) {
    let oldFileKey = path.basename(user.profile_picture);
    await deleteFile(bucketName, oldFileKey);
  }

  if (user.company_logo) {
    let oldFileKey = path.basename(user.company_logo);
    await deleteFile(bucketName, oldFileKey);
  }

  if (user.certificates) {
    for (const cert of user.certificates) {
      let oldFileKey = path.basename(cert.url);
      await deleteFile(bucketName, oldFileKey);
    }
  }

  if (user.brochure) {
    for (const brochure of user.brochure) {
      let oldFileKey = path.basename(brochure.url);
      await deleteFile(bucketName, oldFileKey);
    }
  }

  if (user.awards) {
    for (const award of user.awards) {
      let oldFileKey = path.basename(award.url);
      await deleteFile(bucketName, oldFileKey);
    }
  }
};

exports.deleteUser = async (req, res) => {
  const {
    userId
  } = req.params;
  const {
    membership_id
  } = req.params;
  // console.log(`Received userId: ${userId}`);                                       // Debug line
  // console.log(`Received membership_id: ${membership_id}`);                         // Debug line
  let user;

  if (userId) {
    // Find and delete the user using userId
    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      // If the user is not found, return a 404 status code with the error message
      // console.log('User not found');                                           // Debug line
      return responseHandler(res, 404, "User not found");
    }

    await deleteUserFiles(user);
  } else if (membership_id) {
    // Find and delete the user using membership_id
    const user = await User.findOneAndDelete({
      membership_id: membership_id,
    });
    if (!user) {
      // If the user is not found, return a 404 status code with the error message
      // console.log('User not found');                                           // Debug line
      return responseHandler(res, 404, "User not found");
    }

    await deleteUserFiles(user);
  } else {
    // If neither userId nor membership_id is provided, return a 400 status code with the error
    // console.log('Invalid request');                                              // Debug line
    return responseHandler(res, 400, `Invalid request`);
  }

  // Delete product images
  const products = await Product.find({
    seller_id: userId,
  });
  for (const product of products) {
    if (product.image_url) {
      let oldFileKey = path.basename(product.image_url);
      await deleteFile(bucketName, oldFileKey);
    }
  }

  // Delete products
  await Product.deleteMany({
    seller_id: userId,
  });

  // console.log(`User deleted successfully`);                                        // Debug line
  return responseHandler(res, 200, "User deleted successfully");
};

/****************************************************************************************************/
/*                                   Function to get all users                                      */
/****************************************************************************************************/

exports.getAllUsers = async (req, res) => {
  try {
    
    const userId = req.userId;
    const { pageNo = 1, limit = 10, search = "" } = req.query;

    let filter = {}; // Initialize the filter object

    // Exclude the requesting user from the results
    if (userId && (userId != "" || userId != undefined)){
      filter._id = { $nin: userId };
    }

    // Add search functionality
    if (search) {
      const regex = new RegExp(search, 'i'); // Case-insensitive regex
      filter = {
        ...filter,
        $or: [
          { 'name.first_name': { $regex: regex } },
          { 'name.middle_name': { $regex: regex } },
          { 'name.last_name': { $regex: regex } },
          { email: { $regex: regex } },
          { 'phone_numbers.personal': { $regex: regex } }
        ]
      };
    }

    if (limit === "full") {
      const users = await User.find(filter).populate({
        path: "reviews.reviewer",
        select: "name profile_picture"
      });

      // Map the data to include the required fields (full name and mobile)
      const mappedData = users.map((user) => {
        return {
          ...user._doc, // Spread the original user data
          full_name: `${user.name.first_name} ${user.name.middle_name || ''} ${user.name.last_name}`.trim(),
          mobile: user.phone_numbers?.personal || 'N/A', // Handle phone number or return 'N/A'
        };
      });

      // Return the full data
      return responseHandler(res, 200, "Users retrieved successfully", mappedData);

    } else {
      const skipCount = limit * (pageNo - 1);

      // Get total count of users
      const totalCount = await User.countDocuments(filter);

      // Fetch users with pagination and sorting
      const users = await User.find(filter)
        .populate({
          path: "reviews.reviewer",
          select: "name profile_picture"
        })
        .skip(skipCount)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean();

      // Map the data to include the required fields (full name and mobile)
      const mappedData = users.map((user) => {
        return {
          ...user, // Spread the original user data
          full_name: `${user.name.first_name} ${user.name.middle_name || ''} ${user.name.last_name}`.trim(),
          mobile: user.phone_numbers?.personal || 'N/A', // Handle phone number or return 'N/A'
        };
      });

      // Return the paginated and mapped data
      return responseHandler(res, 200, "Users retrieved successfully", mappedData, totalCount);
    }

  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
};

/****************************************************************************************************/
/*                                   Function to get user by ID                                     */
/****************************************************************************************************/

exports.getUserById = async (req, res) => {
  const {
    userId
  } = req.params;
  // console.log(`Received userId: ${userId}`);                                       // Debug line

  if (!userId) {
    // If userId is not provided, return a 400 status code with the error message
    // console.log('Invalid request');                                              // Debug line
    return responseHandler(res, 400, `Invalid request`);
  }

  // Check if a user with this id exists
  const user = await User.findById(userId)
  .populate({
    path: "reviews.reviewer",
    select: "name profile_picture"
  });
  if (!user) {
    // If the user is not found, return a 404 status code with the error message
    // console.log('User not found');                                               // Debug line
    return responseHandler(res, 404, "User not found");
  }

  let products = await Product.find({
    seller_id: userId
  }).exec();
  if (!products.length) {
    products = [];
  }

  const mappedData = {
    ...user._doc,
    full_name: `${user.name.first_name} ${user.name.middle_name} ${user.name.last_name}`,
    mobile: user.phone_numbers.personal,
    products: products,
  };

  // console.log(`User retrieved successfully`);                                      // Debug line
  return responseHandler(res, 200, "User retrieved successfully", mappedData);
};

exports.suspendUser = async (req, res) => {

  const userId = req.params.userId;

  if (!userId) {
    return responseHandler(res, 400, "User Id is required");
  }

  const user = await User.findByIdAndUpdate(
    userId, {
      status: "suspended",
    }, {
      new: true
    }
  );

  if (!user) {
    return responseHandler(res, 404, "User not found");
  }

  return responseHandler(res, 200, "User suspended successfully");
};