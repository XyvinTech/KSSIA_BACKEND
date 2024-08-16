require("dotenv").config();
const responseHandler = require("../helpers/responseHandler");
const handleFileUpload = require("../utils/fileHandler");
const listFilesInBucket = require("../utils/listFilesInBucket");
const deleteFile = require("../helpers/deleteFiles");


/****************************************************************************************************/
/*                                   Function to upload files                                       */
/****************************************************************************************************/

exports.uploadImages = async (req, res) => {
    // Handle file upload if present
    let image = '';
    const bucketName = process.env.AWS_S3_BUCKET;
    if (req.file) {
        try {
            image = await handleFileUpload(req.file, bucketName);
        } catch (err) {
            return responseHandler(res, 500, err.message);
        }
        return responseHandler(res, 200, "File uploaded successfully", image);
    }
}

/****************************************************************************************************/
/*                                 Get all files in AWS S3 bucket                                   */
/****************************************************************************************************/

exports.getFiles = async (req, res) => {
    const bucketName = process.env.AWS_S3_BUCKET;

    try {
        const files = await listFilesInBucket(bucketName);
        return responseHandler(res, 200, "Files retrieved successfully", files);
    } catch (err) {
        return responseHandler(res, 500, err.message);
    }
};

/****************************************************************************************************/
/*                                 Get all files in AWS S3 bucket                                   */
/****************************************************************************************************/

exports.deleteFile = async (req, res) => {
    const bucketName = process.env.AWS_S3_BUCKET;
    const fileKey = req.params.fileKey; // The file key to delete is passed via URL

    try {
        await deleteFile(bucketName, fileKey);
        return responseHandler(res, 200, "File deleted successfully");
    } catch (err) {
        return responseHandler(res, 500, err.message);
    }
};