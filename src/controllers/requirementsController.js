require("dotenv").config();
const path = require("path");
const responseHandler = require("../helpers/responseHandler");
const User = require("../models/user");
const Requirements = require("../models/requirements");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const { RequirementsSchema } = require("../validation");
const sendInAppNotification = require("../utils/sendInAppNotification");

/****************************************************************************************************/
/*                                Function to create requirements                                   */
/****************************************************************************************************/
exports.createRequirement = async (req, res) => {
  const data = req.body;

  const { error } = RequirementsSchema.validate(data, {
    abortEarly: true,
  });
  if (error) {
    return responseHandler(res, 400, `Invalid input: ${error.message}`);
  }

  req.body.author = req.userId;

  const newRequirement = await Requirements.create(data);

  try {
    return responseHandler(
      res,
      201,
      "Requirement submitted successfully!",
      newRequirement
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error saving Requirement: ${err.message}`
    );
  }
};

/****************************************************************************************************/
/*                                 Function to edit requirement                                     */
/****************************************************************************************************/
exports.updateRequirement = async (req, res) => {
  const { requirementID } = req.params;
  const data = req.body;

  const { error } = RequirementsSchema.validate(data, {
    abortEarly: false,
  });
  if (error) {
    return responseHandler(
      res,
      400,
      `Invalid input: ${error.details
        .map((detail) => detail.message)
        .join(", ")}`
    );
  }

  let requirement;

  try {
    requirement = await Requirements.findById(requirementID);
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error finding requirement: ${err.message}`
    );
  }

  if (!requirement) {
    return responseHandler(res, 404, "Requirement details do not exist");
  }

  try {
    const updatedRequirement = await Requirements.findByIdAndUpdate(
      requirementID,
      data,
      { new: true }
    );
    return responseHandler(
      res,
      200,
      "Requirement updated successfully!",
      updatedRequirement
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error saving requirement: ${err.message}`
    );
  }
};

/****************************************************************************************************/
/*                                Function to get all requirements                                  */
/****************************************************************************************************/
exports.getAllRequirements = async (req, res) => {
  const { pageNo = 1, limit = 10, search = "" } = req.query;

  const pageNumber = parseInt(pageNo, 10);
  const limitNumber = parseInt(limit, 10);
  const skipCount = limitNumber * (pageNumber - 1);
  const filter = {};
  try {
    if (search) {
      filter.$or = [{ "author.name": { $regex: search, $options: "i" } }];
    }

    const requirements = await Requirements.find(filter)
      .populate("author", "name")
      .skip(skipCount)
      .limit(limitNumber)
      .sort({ createdAt: -1 })
      .lean();

    const totalCount = await Requirements.countDocuments(filter);

    return responseHandler(
      res,
      200,
      "Successfully retrieved all requirements",
      requirements,
      totalCount
    );
  } catch (err) {
    console.error("Error in getAllRequirements:", err);
    return responseHandler(
      res,
      500,
      `Error retrieving requirements: ${err.message}`
    );
  }
};

/****************************************************************************************************/
/*                         Function to get all requirements api for users                           */
/****************************************************************************************************/
exports.getAllRequirementsUser = async (req, res) => {
  const reqUser = req.userId;

  const { pageNo = 1, limit = 10 } = req.query;
  const skipCount = limit * (pageNo - 1);

  let filter = { status: "approved" };

  const user = await User.findById(reqUser);
  if (user) {
    const blockedUsersList = user.blocked_users || [];
    const blockedRequirementsUsers = user.blocked_requirements || [];
    // Extract userIds from both lists
    const blockedUserIds = blockedUsersList.map((item) => item.userId);
    const blockedRequirementsUserIds = blockedRequirementsUsers.map(
      (item) => item.userId
    );
    // Combine both lists into a single array, remove duplicates
    const uniqueBlockedUserIds = [
      ...new Set([...blockedUserIds, ...blockedRequirementsUserIds]),
    ];
    // Add the requested user ID to the blocked list to avoid fetching the users requirements
    uniqueBlockedUserIds.push(user._id);

    // Add blocked user ids to the filter to exclude requirements from these users
    filter.author = { $nin: uniqueBlockedUserIds };
  }

  try {
    const totalCount = await Requirements.countDocuments(filter);
    const requirements = await Requirements.find(filter)
      .populate("author", "name email")
      .skip(skipCount)
      .limit(limit)
      .sort({
        createdAt: -1,
      })
      .lean()
      .exec();

    if (requirements.length === 0) {
      return responseHandler(res, 404, "No requirements found");
    }
    return responseHandler(
      res,
      200,
      "Successfully retrieved all requirements",
      requirements,
      totalCount
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error retrieving requirements: ${err.message}`
    );
  }
};

/****************************************************************************************************/
/*                                Function to delete requirement                                   */
/****************************************************************************************************/
exports.deleteRequirement = async (req, res) => {
  const { requirementID } = req.params;

  const requirement = await Requirements.findById(requirementID);
  if (!requirement) {
    return responseHandler(res, 404, "Requirement details do not exist");
  }

  const bucketName = process.env.AWS_S3_BUCKET;

  if (requirement.image) {
    try {
      const oldImageKey = path.basename(requirement.image);
      await deleteFile(bucketName, oldImageKey);
    } catch (err) {
      return responseHandler(res, 500, `Error deleting file: ${err.message}`);
    }
  }

  await Requirements.findByIdAndDelete(requirementID);

  return responseHandler(res, 200, "Requirement deleted successfully");
};

/****************************************************************************************************/
/*                           Function to update status of requirement                               */
/****************************************************************************************************/
exports.updateRequirementStatus = async (req, res) => {
  const { requirementID } = req.params;
  const { status, reason } = req.body;

  const validStatuses = ["pending", "approved", "rejected", "reported"];
  if (!validStatuses.includes(status)) {
    return responseHandler(res, 400, "Invalid status value");
  }

  const requirement = await Requirements.findById(requirementID);
  if (!requirement) {
    return responseHandler(res, 404, "Requirement details do not exist");
  }

  if (status == "approved") {
    requirement.reason = "";
  }

  requirement.status = status;
  requirement.reason = reason;

  try {
    await requirement.save();

    try {
      const user = await User.findById(requirement.author);
      if (!user) {
        return responseHandler(res, 404, "User not found");
      }

      let userFCM = [];
      userFCM.push(user.fcm);

      const subject = `Requirement status update`;
      let content = `Your requirement has been ${requirement.status}`.trim();
      const file_url = requirement.image;

      if (requirement.reason != "" && requirement.reason != undefined) {
        content =
          `Your requirement has been ${requirement.status} beacuse ${requirement.reason}`.trim();
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
      "Requirement status updated successfully",
      requirement
    );
  } catch (err) {
    return responseHandler(
      res,
      500,
      `Error saving requirement: ${err.message}`
    );
  }
};

/****************************************************************************************************/
/*                           Function to get users requirements history                             */
/****************************************************************************************************/
exports.getUserRequirements = async (req, res) => {
  const { userId } = req.params;
  const { pageNo = 1, limit = 10 } = req.query;
  const skipCount = limit * (pageNo - 1);

  if (!userId) {
    return responseHandler(res, 400, "Invalid request");
  }

  const user = await User.findById(userId);
  if (!user) {
    return responseHandler(res, 404, "User not found");
  }

  const totalCount = await Requirements.countDocuments({
    author: userId,
  });
  const requirements = await Requirements.find({
    author: userId,
  })
    .skip(skipCount)
    .limit(limit)
    .sort({
      createdAt: -1,
    })
    .lean();

  if (requirements.length === 0) {
    return responseHandler(res, 404, "User hasn't posted any requirements");
  }

  return responseHandler(
    res,
    200,
    "Successfully retrieved requirements",
    requirements,
    totalCount
  );
};

exports.getRequirements = async (req, res) => {
  const { id } = req.params;
  const requirements = await Requirements.findById(id);
  return responseHandler(
    res,
    200,
    "Successfully retrieved requirements",
    requirements
  );
};
