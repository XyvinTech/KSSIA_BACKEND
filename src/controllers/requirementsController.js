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

    let image = "";
    const bucketName = process.env.AWS_S3_BUCKET;
    if (req.file) {
        try {
            image = await handleFileUpload(req.file, bucketName);
        } catch (err) {
            return responseHandler(res, 500, err.message);
        }
    }

    const newRequirement = new Requirements({
        ...data,
        image,
    });

    try {
        await newRequirement.save();
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

    let image = requirement.image;
    const bucketName = process.env.AWS_S3_BUCKET;

    if (req.file) {
        try {
            if (requirement.image) {
                const oldImageKey = path.basename(requirement.image);
                await deleteFile(bucketName, oldImageKey);
            }
            image = await handleFileUpload(req.file, bucketName);
        } catch (err) {
            return responseHandler(res, 500, err.message);
        }
    }

    Object.assign(requirement, data, {
        image,
    });

    try {
        await requirement.save();
        return responseHandler(
            res,
            200,
            "Requirement updated successfully!",
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
/*                                Function to get all requirements                                  */
/****************************************************************************************************/
exports.getAllRequirements = async (req, res) => {
    const { pageNo = 1, limit = 10, search = "" } = req.query;

    // Convert pageNo and limit to numbers
    const pageNumber = Number(pageNo);
    const limitNumber = Number(limit);
    const skipCount = limitNumber * (pageNumber - 1);

    // Create the aggregation pipeline
    let pipeline = [
        {
            // Lookup to join the author data
            $lookup: {
                from: "users", // Name of the collection for authors
                localField: "author", // Field in requirements
                foreignField: "_id", // Field in users
                as: "author",
            },
        },
        {
            // Unwind the author array
            $unwind: {
                path: "$author",
                preserveNullAndEmptyArrays: true, // In case there are requirements without authors
            },
        },
        {
            // Add full_name field to each document
            $addFields: {
                "author.full_name": {
                    $concat: [
                        { $ifNull: ["$author.name.first_name", ""] },
                        {
                            $cond: {
                                if: { $ne: ["$author.name.middle_name", ""] },
                                then: " ",
                                else: "",
                            },
                        },
                        { $ifNull: ["$author.name.middle_name", ""] },
                        {
                            $cond: {
                                if: { $ne: ["$author.name.last_name", ""] },
                                then: " ",
                                else: "",
                            },
                        },
                        { $ifNull: ["$author.name.last_name", ""] },
                    ],
                },
            },
        },
        {
            // Project the required fields
            $project: {
                _id: 1,
                image: 1,
                content: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                __v: 1,
                "author.full_name": 1,
                "author.email": 1,
                "author._id": 1,
                "author.profile_picture": 1,
            },
        },
    ];

    // Check if there's a search query and add a match stage
    if (search) {
        pipeline.push({
            $match: {
                $or: [
                    { content: { $regex: search, $options: "i" } }, // Search in content
                    { status: { $regex: search, $options: "i" } }, // Search in status
                    { "author.email": { $regex: search, $options: "i" } }, // Search in author's email
                    { "author.full_name": { $regex: search, $options: "i" } }, // Search in author's full name
                ],
            },
        });
    }

    // Add pagination and sorting
    pipeline.push(
        { $sort: { createdAt: -1 } },
        { $skip: skipCount },
        { $limit: limitNumber } // Ensure this is a number
    );

    try {
        // Get total count before applying pagination
        const totalCount = await Requirements.countDocuments(
            search
                ? {
                    $or: [
                        { content: { $regex: search, $options: "i" } },
                        { status: { $regex: search, $options: "i" } },
                        { "author.email": { $regex: search, $options: "i" } },
                        { "author.full_name": { $regex: search, $options: "i" } },
                    ],
                }
                : {}
        );

        // Execute the aggregation
        const requirements = await Requirements.aggregate(pipeline).exec();

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
        const blockedUserIds = blockedUsersList.map(
            (item) => item.userId
        );
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

            const userFCM = user.fcm;
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
