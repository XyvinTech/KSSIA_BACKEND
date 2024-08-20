require("dotenv").config();
const path = require('path');
const responseHandler = require("../helpers/responseHandler");
const User = require("../models/user");
const Requirements = require("../models/requirements");
const handleFileUpload = require("../utils/fileHandler");
const deleteFile = require("../helpers/deleteFiles");
const { RequirementsSchema } = require("../validation");

/****************************************************************************************************/
/*                                Function to create requirements                                   */
/****************************************************************************************************/
exports.createRequirement = async (req, res) => {
    const data = req.body;

    const { error } = RequirementsSchema.validate(data, { abortEarly: true });
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.message}`);
    }

    let image = '';
    const bucketName = process.env.AWS_S3_BUCKET;
    if (req.file) {
        try {
            image = await handleFileUpload(req.file, bucketName);
        } catch (err) {
            return responseHandler(res, 500, err.message);
        }
    }

    const newRequirement = new Requirements ({ ...data, image });

    try {
        await newRequirement.save();
        return responseHandler(res, 201, "Requirement submitted successfully!", newRequirement);
    } catch (err) {
        return responseHandler(res, 500, `Error saving Requirement: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                                 Function to edit requirement                                     */
/****************************************************************************************************/
exports.updateRequirement = async (req, res) => {
    const { requirementID } = req.params;
    const data = req.body;
    
    const { error } = RequirementsSchema.validate(data, { abortEarly: false });
    if (error) {
        return responseHandler(res, 400, `Invalid input: ${error.details.map(detail => detail.message).join(', ')}`);
    }
    
    let requirement;
    
    try {
        requirement = await Requirements.findById(requirementID);
    } catch (err) {
        return responseHandler(res, 500, `Error finding requirement: ${err.message}`);
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

    Object.assign(requirement, data, { image });

    try {
        await requirement.save();
        return responseHandler(res, 200, "Requirement updated successfully!", requirement);
    } catch (err) {
        return responseHandler(res, 500, `Error saving requirement: ${err.message}`);
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

    const validStatuses = ["pending", "approved", "rejected"];
    if (!validStatuses.includes(status)) {
        return responseHandler(res, 400, "Invalid status value");
    }

    const requirement = await Requirements.findById(requirementID);
    if (!requirement) {
        return responseHandler(res, 404, "Requirement details do not exist");
    }

    requirement.status = status;
    requirement.reason = reason;

    try {
        await requirement.save();
        return responseHandler(res, 200, "Requirement status updated successfully", requirement);
    } catch (err) {
        return responseHandler(res, 500, `Error saving requirement: ${err.message}`);
    }
};

/****************************************************************************************************/
/*                           Function to get users requirements history                             */
/****************************************************************************************************/
exports.getUserRequirements = async (req, res) => {

    const { userId } = req.params;

    if (!userId) {
        return responseHandler(res, 400, "Invalid request");
    }

    const user = await User.findById(userId);
    if (!user) {
        return responseHandler(res, 404, "User not found");
    }

    const requirements = await Requirements.find({ author: userId });

    if (requirements.length === 0) {
        return responseHandler(res, 404, "User hasn't posted any requirements");
    }

    return responseHandler(res, 200, "Successfully retrieved requirements", requirements);
};