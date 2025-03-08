require("dotenv").config();
const responseHandler = require("../helpers/responseHandler");
const User = require("../models/user");
const Product = require("../models/products");
const Requirements = require("../models/requirements");
const ChatThread = require("../models/chats");
const Message = require("../models/messages");
const Event = require("../models/events");
const path = require("path");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const { CreateUserSchema, EditUserSchema } = require("../validation");
const capitalizeData = require("../utils/capitalizeData");

/****************************************************************************************************/
/*                                 Function to create a new user                                    */
/****************************************************************************************************/

exports.createUser = async (req, res) => {
  const data = req.body;
  // console.log(`Received data parameter: ${data}`);                                 // Debug line

  // Validate the input data
  const { error } = CreateUserSchema.validate(data, {
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
    const { error } = CreateUserSchema.validate(user, {
      abortEarly: true,
    });
    if (error) {
      errors.push(
        `Invalid user data: ${error.message} for user ${user.name} membership ID: ${user.membership_id}`
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
  const { userId } = req.params;
  const { membership_id } = req.params;
  const data = req.body;
  // console.log(`Received userId parameter: ${userId}`);                             // Debug line
  // console.log(`Received membership_id parameter: ${membership_id}`);               // Debug line
  // console.log(`Received data parameter: ${data}`);                                 // Debug line

  // Validate the input data
  const { error } = EditUserSchema.validate(data, {
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
  const { userId } = req.params;
  const { membership_id } = req.params;
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

    // await deleteUserFiles(user);
  } else {
    // If neither userId nor membership_id is provided, return a 400 status code with the error
    // console.log('Invalid request');                                              // Debug line
    return responseHandler(res, 400, `Invalid request`);
  }

  // Delete product images
  // const products = await Product.find({
  //   seller_id: userId,
  // });
  // for (const product of products) {
  //   if (product.image_url) {
  //     let oldFileKey = path.basename(product.image_url);
  //     await deleteFile(bucketName, oldFileKey);
  //   }
  // }

  // Delete products
  await Product.deleteMany({
    seller_id: userId,
  });

  // Delete requirements images
  // const requirements = await Requirements.find({ author: userId });
  // for (const requirement of requirements) {
  //   if (requirement.image) {
  //     let oldFileKey = path.basename(requirement.image);
  //     await deleteFile(bucketName, oldFileKey);
  //   }
  // }

  // Delete requirements
  await Requirements.deleteMany({
    author: userId,
  });

  // Delete chats and chat threads
  await ChatThread.deleteMany({
    participants: userId,
  });
  await Message.deleteMany({
    from: userId,
  });
  await Message.deleteMany({
    to: userId,
  });

  // Remove from rsvps
  const events = await Event.find({ rsvp: userId });
  events.forEach(async (event) => {
    await event.unmarkrsvp(userId);
  });

  // Remove user from all blocked lists in other users
  await User.updateMany(
    { "blocked_users.userId": userId },
    { $pull: { blocked_users: { userId: userId } } }
  );
  await User.updateMany(
    { "blocked_products.userId": userId },
    { $pull: { blocked_products: { userId: userId } } }
  );
  await User.updateMany(
    { "blocked_requirements.userId": userId },
    { $pull: { blocked_requirements: { userId: userId } } }
  );

  // Remove all reviews uploaded by the user
  await User.updateMany(
    { "reviews.reviewer": userId },
    { $pull: { reviews: { reviewer: userId } } }
  );

  // console.log(`User deleted successfully`);                                        // Debug line
  return responseHandler(res, 200, "User deleted successfully");
};

/****************************************************************************************************/
/*                                   Function to get all users                                      */
/****************************************************************************************************/

exports.getAllUsers = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      pageNo = 1,
      limit = 10,
      search = "",
      name = "",
      membershipId = "",
      designation = "",
      companyName = "",
      status = "",
      subscription = "",
      installed,
    } = req.query;

    let filter = {};

    if (userId && (userId !== "" || userId !== undefined)) {
      filter._id = { $nin: [userId] };
    }

    // Handle name filtering
    if (name && name !== "") {
      filter.name = { $regex: name, $options: "i" };
    }

    // Handle other filters
    if (membershipId && membershipId !== "") {
      filter.membership_id = membershipId;
    }

    if (designation && designation !== "") {
      filter.designation = designation;
    }

    if (installed === false) {
      filter.fcm = { $exists: false };
    } else if (installed) {
      filter.fcm = {
        $nin: [null, ""],
      };
    }

    if (companyName) {
      filter.$or = [];
      filter.$or.push({ company_name: { $regex: companyName, $options: "i" } });
    }

    if (subscription) {
      filter.subscription = subscription;
    }

    // Add search functionality
    if (search && search !== "") {
      // Escape special characters in the search string for regex
      const escapedSearch = search.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");

      // Combine the name filters with other filters
      filter = {
        ...filter,
        $or: [
          { email: { $regex: escapedSearch } },
          {
            "phone_numbers.personal": { $regex: escapedSearch, $options: "i" },
          },
          { designation: { $regex: escapedSearch, $options: "i" } },
          { company_name: { $regex: escapedSearch, $options: "i" } },
          { membership_id: { $regex: escapedSearch, $options: "i" } },
          { name: { $regex: escapedSearch, $options: "i" } },
        ],
      };
    }

    if (status) {
      filter.status = status;
    }

    // Check if the limit is set to 'full' for retrieving all users
    if (limit === "full") {
      const users = await User.find(filter).populate({
        path: "reviews.reviewer",
        select: "name profile_picture",
      });

      // Map the data to include the required fields (full name and mobile)
      const mappedData = users.map((user) => {
        return {
          ...user._doc, // Spread the original user data
          full_name: `${user.name}`.trim(),
          mobile: user.phone_numbers?.personal || "N/A", // Handle phone number or return 'N/A'
        };
      });

      // Return the full data
      return responseHandler(
        res,
        200,
        "Users retrieved successfully",
        mappedData
      );
    } else {
      const skipCount = limit * (pageNo - 1);

      // Get total count of users
      const totalCount = await User.countDocuments(filter);

      // Fetch users with pagination and sorting
      const users = await User.find(filter)
        .populate({
          path: "reviews.reviewer",
          select: "name profile_picture",
        })
        .skip(skipCount)
        .limit(limit)
        .sort({ createdAt: -1, _id: 1 })
        .lean();

      const mappedData = users.map((user) => {
        return capitalizeData({
          ...user,
          full_name: user.name?.trim() || "",
          mobile: user.phone_numbers?.personal || "N/A",
        });
      });

      // Return the paginated and mapped data
      return responseHandler(
        res,
        200,
        "Users retrieved successfully",
        mappedData,
        totalCount
      );
    }
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error: ${error.message}`);
  }
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
    products = [];
  }

  const mappedData = {
    ...user._doc,
    full_name: `${user.name}`,
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
    userId,
    {
      status: "suspended",
    },
    {
      new: true,
    }
  );

  if (!user) {
    return responseHandler(res, 404, "User not found");
  }

  return responseHandler(res, 200, "User suspended successfully");
};

exports.downloadUsers = async (req, res) => {
  try {
    const { designation, company_name, subscription, status, installed } =
      req.query;
    const filter = {};

    if (designation) {
      filter.designation = designation;
    }

    if (company_name) {
      filter.company_name = company_name;
    }

    if (subscription) {
      filter.subscription = subscription;
    }

    if (status) {
      filter.status = status;
    }

    if (installed === false) {
      filter.fcm = { $exists: false };
    } else if (installed) {
      filter.fcm = {
        $nin: [null, ""],
      };
    }

    const users = await User.find(filter);
    const csvData = users.map((user) => {
      return {
        Name: `${user.name}`.trim(),
        MembershipID: user.membership_id,
        Email: user.email,
        Mobile: user.phone_numbers?.personal || "N/A",
        Company: user.company_name || "N/A",
        Designation: user.designation || "N/A",
      };
    });
    const headers = [
      { header: "Name", key: "Name" },
      { header: "Membership ID", key: "MembershipID" },
      { header: "Email", key: "Email" },
      { header: "Mobile", key: "Mobile" },
      { header: "Company", key: "Company" },
      { header: "Designation", key: "Designation" },
    ];
    return responseHandler(res, 200, "Users downloaded successfully", {
      headers: headers,
      body: csvData,
    });
  } catch (error) {
    return responseHandler(res, 500, `Internal Server Error ${error.message}`);
  }
};
